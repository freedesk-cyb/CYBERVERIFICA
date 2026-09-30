/**
 * Integración con la API v3 de VirusTotal
 * Permite auditar URLs contra más de 70 motores de ciberseguridad mundiales
 * (Google Safe Browsing, Kaspersky, ESET, Bitdefender, Netcraft, PhishTank, etc.)
 */

import { validarUrlExterna } from './seguridad';

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY || '';

/**
 * Extrae todas las URLs encontradas en un texto (mensajes, códigos QR decodificados, etc.)
 * @param {string} texto 
 * @returns {string[]} Lista de URLs únicas
 */
export function extraerUrlsDeTexto(texto) {
  if (!texto || typeof texto !== 'string') return [];

  // Expresión regular robusta para URLs con http/https o prefijo www.
  const urlRegex = /((?:https?:\/\/|www\.)[^\s<>"{}|\\^`[\]]+)/gi;
  const matches = texto.match(urlRegex) || [];

  // Normalizar (agregar esquema a URLs www.), remover duplicados
  const urlsUnicas = [...new Set(matches.map(u => {
    let limpia = u.trim().replace(/[.,;:)\]]+$/, '');
    if (!/^https?:\/\//i.test(limpia)) limpia = 'https://' + limpia;
    return limpia;
  }))];
  return urlsUnicas;
}

/**
 * Codifica una URL al formato de identificador requerido por VirusTotal v3
 * (Base64url sin padding '=')
 * @param {string} url 
 * @returns {string} ID en base64url
 */
export function obtenerUrlIdVirusTotal(url) {
  return Buffer.from(url.trim())
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Consulta el estado y reputación de una URL en VirusTotal v3
 * @param {string} url 
 * @returns {Promise<object>} Telemetría de seguridad de VirusTotal
 */
export async function consultarUrlEnVirusTotal(url) {
  if (!url || typeof url !== 'string') {
    return { consultado: false, error: 'URL no válida' };
  }

  // V-02: Prevención SSRF — rechazar URLs internas/privadas
  const checkSSRF = validarUrlExterna(url);
  if (!checkSSRF.segura) {
    console.warn('SSRF bloqueado en VirusTotal:', checkSSRF.razon, url);
    return { consultado: false, error: 'URL no permitida para análisis externo.' };
  }

  // Si no está configurada la clave en .env.local, retornar estado informativo seguro
  if (!VIRUSTOTAL_API_KEY || VIRUSTOTAL_API_KEY.includes('tu_virustotal_api_key')) {
    return {
      consultado: false,
      configurado: false,
      url,
      mensaje: 'Para activar la inspección en tiempo real de más de 70 motores antivirus, agrega tu clave gratuita de VirusTotal en VIRUSTOTAL_API_KEY.',
    };
  }

  const urlId = obtenerUrlIdVirusTotal(url);

  try {
    // 1. Consultar si VirusTotal ya tiene el análisis previo de esta URL
    const response = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      method: 'GET',
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
        'Accept': 'application/json',
      },
      // Timeout preventivo para no bloquear la respuesta al usuario
      signal: AbortSignal.timeout(3000),
    });

    if (response.status === 200) {
      const data = await response.json();
      return procesarRespuestaVirusTotal(url, data);
    }

    // 2. Si la URL nunca ha sido escaneada (404), solicitar su escaneo
    if (response.status === 404) {
      const postResponse = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        headers: {
          'x-apikey': VIRUSTOTAL_API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ url: url.trim() }),
        signal: AbortSignal.timeout(6000),
      });

      if (postResponse.ok) {
        return {
          consultado: true,
          configurado: true,
          url,
          estado: 'en_analisis',
          mensaje: 'La URL ha sido enviada a la red de escaneo de VirusTotal. El primer análisis está en progreso.',
          stats: {
            malicious: 0,
            suspicious: 0,
            harmless: 0,
            undetected: 0,
            total: 0,
          },
          motores_detectores: [],
          permalink: `https://www.virustotal.com/gui/url/${urlId}`,
        };
      }
    }

    if (response.status === 429) {
      return {
        consultado: false,
        configurado: true,
        url,
        error: 'Límite de peticiones de VirusTotal alcanzado (cuota gratuita de 4 consultas/minuto).',
      };
    }

    return {
      consultado: false,
      configurado: true,
      url,
      error: `VirusTotal respondió con código ${response.status}`,
    };

  } catch (error) {
    console.warn('Error al conectar con VirusTotal:', error.message);
    return {
      consultado: false,
      configurado: true,
      url,
      error: error.message || 'Error de conexión con VirusTotal',
    };
  }
}

/**
 * Normaliza y extrae las métricas clave de la respuesta JSON de VirusTotal
 */
function procesarRespuestaVirusTotal(url, data) {
  const atributos = data?.data?.attributes || {};
  const stats = atributos.last_analysis_stats || {
    malicious: 0,
    suspicious: 0,
    harmless: 0,
    undetected: 0,
  };

  const results = atributos.last_analysis_results || {};
  const motoresDetectores = [];

  // Extraer qué firmas de ciberseguridad marcaron la URL como maliciosa o sospechosa
  for (const [engineName, engineResult] of Object.entries(results)) {
    if (engineResult.category === 'malicious' || engineResult.category === 'suspicious') {
      motoresDetectores.push({
        motor: engineName,
        categoria: engineResult.category,
        resultado: engineResult.result || 'amenaza detectada',
      });
    }
  }

  const totalMotores = Object.keys(results).length || 
    ((stats.malicious || 0) + (stats.suspicious || 0) + (stats.harmless || 0) + (stats.undetected || 0));

  const urlId = obtenerUrlIdVirusTotal(url);

  return {
    consultado: true,
    configurado: true,
    url,
    reputacion: atributos.reputation ?? 0,
    stats: {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
      undetected: stats.undetected || 0,
      total: totalMotores,
    },
    motores_detectores: motoresDetectores,
    categorias: atributos.categories || {},
    fecha_ultimo_analisis: atributos.last_analysis_date 
      ? new Date(atributos.last_analysis_date * 1000).toISOString() 
      : null,
    permalink: `https://www.virustotal.com/gui/url/${urlId}`,
  };
}
