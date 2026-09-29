/**
 * Utilidad compartida para extraer un objeto JSON de la respuesta de un modelo.
 *
 * Los motores no siempre devuelven JSON puro: lo envuelven en ```json, añaden
 * preámbulo, repiten el objeto o lo truncan por límite de tokens. Centralizar
 * la estrategia evita que cada proveedor improvise una versión distinta.
 */

/**
 * Extrae el objeto JSON de una respuesta de modelo.
 * Estrategia: parseo directo -> quitar cercas markdown -> recortar del primer
 * '{' al último '}' -> escaneo de llaves balanceadas. Devuelve null si nada cuadra.
 *
 * @param {string} texto
 * @returns {object|null}
 */
export function extraerJson(texto) {
  if (typeof texto !== 'string') return null;

  const intentos = [texto.trim()];

  const sinCercas = texto.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  if (sinCercas !== texto.trim()) intentos.push(sinCercas);

  const primero = texto.indexOf('{');
  const ultimo = texto.lastIndexOf('}');
  if (primero !== -1 && ultimo > primero) intentos.push(texto.slice(primero, ultimo + 1));

  for (const intento of intentos) {
    try {
      const obj = JSON.parse(intento);
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj;
    } catch { /* siguiente estrategia */ }
  }

  // Último recurso: emparejar llaves respetando las comillas, para el caso de
  // que haya texto o un segundo objeto después del JSON.
  if (primero !== -1) {
    let nivel = 0, enComillas = false, escape = false;
    for (let i = primero; i < texto.length; i++) {
      const c = texto[i];
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === '"') { enComillas = !enComillas; continue; }
      if (enComillas) continue;
      if (c === '{') nivel++;
      else if (c === '}' && --nivel === 0) {
        try {
          const obj = JSON.parse(texto.slice(primero, i + 1));
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) return obj;
        } catch { return null; }
      }
    }
  }

  return null;
}
