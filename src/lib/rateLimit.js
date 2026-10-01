/**
 * Sistema de Cuotas y Límites de Uso Justo (Rate Limiting)
 * Regla:
 * - Texto: 2 consultas cada 12 horas
 * - Captura / Imagen: 2 consultas cada 12 horas
 * - Enlace / URL: 1 consulta cada 12 horas
 * - Código QR: 1 consulta cada 12 horas
 */

export const VENTANA_HORAS = 12;
export const VENTANA_MS = VENTANA_HORAS * 60 * 60 * 1000;

export const LIMITES_CONSULTAS = {
  mensaje: { max: 2, label: 'Texto', icon: 'MessageSquare' },
  captura: { max: 2, label: 'Imagen', icon: 'Image' },
  url: { max: 1, label: 'Enlace', icon: 'Link' },
  qr: { max: 1, label: 'Código QR', icon: 'QrCode' },
};

// -------------------------------------------------------------
// SERVIDOR: Almacén en memoria volátil indexado por IP + Modalidad
// ⚠️  PRODUCCIÓN: En serverless (Vercel) cada instancia tiene su
//     propio Map → usar Upstash Redis o Vercel KV para persistencia.
// -------------------------------------------------------------
const registroServidorIP = new Map(); // key: `${ip}_${modalidad}` -> [timestamps]
const MAX_ENTRADAS_MAP = 1_000; // Optimizado para Cloudflare Workers (128MB RAM)

/**
 * Limpieza pasiva de llaves expiradas en el Map (evita setInterval en serverless)
 */
function limpiarMapPasivo(ahora = Date.now()) {
  if (registroServidorIP.size < 200) return;
  for (const [key, timestamps] of registroServidorIP) {
    const vigentes = timestamps.filter((t) => ahora - t < VENTANA_MS);
    if (vigentes.length === 0) {
      registroServidorIP.delete(key);
    } else {
      registroServidorIP.set(key, vigentes);
    }
  }
}

/**
 * Limpia timestamps vencidos (> 12 horas)
 */
function limpiarTimestampsVencidos(timestamps, ahora = Date.now()) {
  return timestamps.filter((t) => ahora - t < VENTANA_MS);
}

/**
 * Verifica y registra una consulta en el servidor
 * @param {string} ip - IP del cliente
 * @param {string} modalidad - 'mensaje' | 'captura' | 'url' | 'qr'
 * @returns {{ permitido: boolean, restante: number, max: number, restableceEnMs: number, error?: string }}
 */
export function verificarLimiteServidor(ip, modalidad = 'mensaje') {
  const mod = LIMITES_CONSULTAS[modalidad] ? modalidad : 'mensaje';
  const maxPermitido = LIMITES_CONSULTAS[mod].max;
  const key = `${ip || 'desconocido'}_${mod}`;
  const ahora = Date.now();

  limpiarMapPasivo(ahora);

  const previos = registroServidorIP.get(key) || [];
  const vigentes = limpiarTimestampsVencidos(previos, ahora);

  if (vigentes.length >= maxPermitido) {
    const masAntiguo = Math.min(...vigentes);
    const restableceEnMs = Math.max(0, masAntiguo + VENTANA_MS - ahora);
    
    return {
      permitido: false,
      restante: 0,
      max: maxPermitido,
      restableceEnMs,
      error: `Has alcanzado el límite de ${maxPermitido} consulta(s) de ${LIMITES_CONSULTAS[mod].label} cada 12 horas. Se restablecerá automáticamente en ${formatearTiempoRestante(restableceEnMs)}.`,
    };
  }

  // Registrar nuevo intento (V-07: respetar límite de entradas del Map)
  if (registroServidorIP.size < MAX_ENTRADAS_MAP) {
    vigentes.push(ahora);
    registroServidorIP.set(key, vigentes);
  } else {
    // Map lleno: permitir la consulta pero no registrar para no crecer más
    console.warn('rateLimit: Map alcanzó el límite de', MAX_ENTRADAS_MAP, 'entradas. No se registra esta consulta.');
  }

  const restante = Math.max(0, maxPermitido - vigentes.length);
  const masAntiguo = Math.min(...vigentes);
  const restableceEnMs = Math.max(0, masAntiguo + VENTANA_MS - ahora);

  return {
    permitido: true,
    restante,
    max: maxPermitido,
    restableceEnMs,
  };
}

// -------------------------------------------------------------
// CLIENTE (Browser): Gestión mediante localStorage
// -------------------------------------------------------------
const STORAGE_KEY = 'verificaya_usage_limits_v1';

export function obtenerEstadoCliente() {
  if (typeof window === 'undefined') {
    return {
      mensaje: { usados: 0, restante: 2, max: 2, restableceEnMs: 0 },
      captura: { usados: 0, restante: 2, max: 2, restableceEnMs: 0 },
      url: { usados: 0, restante: 1, max: 1, restableceEnMs: 0 },
      qr: { usados: 0, restante: 1, max: 1, restableceEnMs: 0 },
    };
  }

  const ahora = Date.now();
  let data = {};
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) {
      data = JSON.parse(guardado);
    }
  } catch (e) {
    console.warn('Error leyendo límites locales:', e);
  }

  const resultado = {};

  Object.keys(LIMITES_CONSULTAS).forEach((mod) => {
    const max = LIMITES_CONSULTAS[mod].max;
    const timestamps = Array.isArray(data[mod]) ? data[mod] : [];
    const vigentes = limpiarTimestampsVencidos(timestamps, ahora);
    data[mod] = vigentes;

    const usados = vigentes.length;
    const restante = Math.max(0, max - usados);
    const masAntiguo = vigentes.length > 0 ? Math.min(...vigentes) : ahora;
    const restableceEnMs = vigentes.length > 0 ? Math.max(0, masAntiguo + VENTANA_MS - ahora) : 0;

    resultado[mod] = {
      usados,
      restante,
      max,
      restableceEnMs,
      permitido: restante > 0,
    };
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // Ignorar si el storage está lleno o bloqueado
  }

  return resultado;
}

/**
 * Registra una consulta consumida en el cliente
 * @param {string} modalidad - 'mensaje' | 'captura' | 'url' | 'qr'
 */
export function registrarConsultaCliente(modalidad = 'mensaje') {
  if (typeof window === 'undefined') return;

  const mod = LIMITES_CONSULTAS[modalidad] ? modalidad : 'mensaje';
  const ahora = Date.now();

  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    const data = guardado ? JSON.parse(guardado) : {};
    const timestamps = Array.isArray(data[mod]) ? data[mod] : [];
    const vigentes = limpiarTimestampsVencidos(timestamps, ahora);
    vigentes.push(ahora);
    data[mod] = vigentes;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Error guardando límite local:', e);
  }
}

/**
 * Formatea milisegundos a "Xh Ym" o "Xm Ys"
 */
export function formatearTiempoRestante(ms) {
  if (!ms || ms <= 0) return '0m';
  const totalSegundos = Math.floor(ms / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  if (horas > 0) {
    return `${horas}h ${minutos}m`;
  }
  if (minutos > 0) {
    return `${minutos}m ${segundos}s`;
  }
  return `${segundos}s`;
}
