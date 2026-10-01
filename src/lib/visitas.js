import { supabase, generarHashMensaje } from './supabase';

/**
 * Contador de visitas anónimo
 * - No guarda IPs ni datos personales: solo un hash sal del par IP + User-Agent
 * - Una visita se cuenta como máximo una vez por día por visitante
 * - Persistencia: Supabase (tabla `visitas`) con respaldo en memoria
 */

// Base histórica estimada (patrón "base + dinámico" igual que obtenerEstadisticas)
const BASE_VISITAS = (parseInt(process.env.VISITAS_BASE || '', 10) || 12480);

const MAX_ENTRADAS_MAP = 1000; // Optimizado para Cloudflare Workers (128MB RAM)
const VENTANA_VISITA_MS = 24 * 60 * 60 * 1000;

// -------------------------------------------------------------
// RESPALDO EN MEMORIA (si Supabase no está disponible)
// ⚠️  PRODUCCIÓN: en serverless cada instancia tiene su propio Map,
//     por eso Supabase es la fuente de verdad cuando está conectado.
// -------------------------------------------------------------
let visitasTotalesMemoria = 0;
let visitasHoyMemoria = 0;
const visitantesRecientes = new Map(); // hash -> timestamp de registro

function inicioDiaLocal() {
  const ahora = new Date();
  return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).toISOString();
}

function limpiarVisitantesVencidos(ahora = Date.now()) {
  for (const [hash, ts] of visitantesRecientes) {
    if (ahora - ts >= VENTANA_VISITA_MS) visitantesRecientes.delete(hash);
  }
}

/**
 * Genera un identificador anónimo y estable del visitante
 */
function hashVisitante(ip, userAgent) {
  const semilla = `${ip || 'desconocido'}|${userAgent || 'desconocido'}|${inicioDiaLocal()}`;
  return generarHashMensaje(semilla);
}

/**
 * Registra una visita única diaria y devuelve el contador actualizado.
 * @param {{ ip?: string, userAgent?: string }} contexto
 */
export async function registrarVisita({ ip, userAgent } = {}) {
  const ahora = Date.now();
  const hash = hashVisitante(ip, userAgent);

  // Deduplicación en memoria (misma instancia)
  limpiarVisitantesVencidos(ahora);

  // Si el Map está lleno no se registra para no crecer sin control
  const esNueva = !visitantesRecientes.has(hash) && visitantesRecientes.size < MAX_ENTRADAS_MAP;

  if (esNueva) {
    visitantesRecientes.set(hash, ahora);
    visitasTotalesMemoria += 1;
    visitasHoyMemoria += 1;
  }

  // Si Supabase está disponible, la tabla `visitas` es la fuente de verdad
  if (supabase && esNueva) {
    try {
      const { error } = await supabase.from('visitas').insert([
        {
          visitante_hash: hash,
          fecha_creacion: new Date(ahora).toISOString(),
        },
      ]);
      if (error) {
        console.warn('Advertencia al registrar visita en Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Error registrando visita:', err.message);
    }
  }

  const total = await obtenerContadorVisitas();
  return { ...total, nueva: esNueva };
}

/**
 * Obtiene el total de visitas (base histórica + registros propios)
 */
export async function obtenerContadorVisitas() {
  const inicioDia = inicioDiaLocal();
  let total = BASE_VISITAS + visitasTotalesMemoria;
  let hoy = visitasHoyMemoria;

  if (supabase) {
    try {
      const { count, error } = await supabase
        .from('visitas')
        .select('*', { count: 'exact', head: true });
      if (!error && typeof count === 'number' && count > 0) {
        total = BASE_VISITAS + count;
      }

      const { count: countHoy, error: errorHoy } = await supabase
        .from('visitas')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_creacion', inicioDia);
      if (!errorHoy && typeof countHoy === 'number') {
        hoy = countHoy;
      }
    } catch {
      // Mantener valores de respaldo en memoria
    }
  }

  return {
    total_visitas: total,
    visitas_hoy: hoy,
    visitantes_unicos: total,
    actualizado_en: new Date().toISOString(),
  };
}
