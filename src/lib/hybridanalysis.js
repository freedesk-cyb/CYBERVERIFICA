import crypto from 'crypto';
import { validarUrlExterna } from './seguridad';

/**
 * Integración con la API v2 de Hybrid Analysis (CrowdStrike Falcon Sandbox)
 * Permite auditar indicadores de amenaza, URLs y hashes contra la base global
 * de inteligencia y detonación de malware de Falcon Sandbox.
 */

const HYBRID_ANALYSIS_API_KEY = process.env.HYBRID_ANALYSIS_API_KEY || '';

/**
 * Genera el hash SHA-256 de una URL o cadena
 * @param {string} input 
 * @returns {string} Hash SHA-256 en hexadecimal
 */
export function generarSha256(input) {
  return crypto.createHash('sha256').update(input.trim()).digest('hex');
}

/**
 * Consulta la reputación y veredicto de amenaza de una URL o hash en Hybrid Analysis
 * @param {string} url O dirección web detectada
 * @returns {Promise<object>} Telemetría de seguridad de Hybrid Analysis
 */
export async function consultarUrlEnHybridAnalysis(url) {
  if (!url || typeof url !== 'string') {
    return { consultado: false, error: 'URL no válida' };
  }

  // V-02: Prevención SSRF — rechazar URLs internas/privadas
  const checkSSRF = validarUrlExterna(url);
  if (!checkSSRF.segura) {
    console.warn('SSRF bloqueado en Hybrid Analysis:', checkSSRF.razon, url);
    return { consultado: false, error: 'URL no permitida para análisis externo.' };
  }

  // Verificar si la clave API está configurada
  if (!HYBRID_ANALYSIS_API_KEY || HYBRID_ANALYSIS_API_KEY.includes('tu_hybrid_analysis_api_key')) {
    return {
      consultado: false,
      configurado: false,
      url,
      mensaje: 'Para activar la inspección de Falcon Sandbox / Hybrid Analysis, agrega tu clave en HYBRID_ANALYSIS_API_KEY.',
    };
  }

  const sha256 = generarSha256(url);
  const headers = {
    'api-key': HYBRID_ANALYSIS_API_KEY,
    'user-agent': 'Falcon Sandbox',
    'accept': 'application/json',
  };

  try {
    // 1. Intentar obtener el resumen forense del indicador (overview summary)
    const summaryResponse = await fetch(`https://www.hybrid-analysis.com/api/v2/overview/${sha256}/summary`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(3000),
    });

    if (summaryResponse.status === 200) {
      const data = await summaryResponse.json();
      return procesarResumenHybridAnalysis(url, sha256, data);
    }

    // 2. Si no hay overview directo, consultar el endpoint de búsqueda por hash
    const searchResponse = await fetch(`https://www.hybrid-analysis.com/api/v2/search/hash?hash=${sha256}`, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(3000),
    });

    if (searchResponse.status === 200) {
      const searchData = await searchResponse.json();
      if (searchData.reports && searchData.reports.length > 0) {
        const principalReport = searchData.reports.find(r => r.verdict) || searchData.reports[0];
        return {
          consultado: true,
          configurado: true,
          url,
          sha256,
          encontrado: true,
          veredicto: principalReport.verdict || 'sin_veredicto',
          threat_score: principalReport.threat_score ?? (principalReport.verdict === 'malicious' ? 100 : principalReport.verdict === 'suspicious' ? 60 : 0),
          entorno: principalReport.environment_description || 'Sandbox Multi-OS',
          estado: principalReport.state || 'SUCCESS',
          total_reportes: searchData.reports.length,
          permalink: `https://www.hybrid-analysis.com/sample/${sha256}`,
        };
      }
    }

    // 3. Si no tiene reportes previos registrados en la sandbox
    return {
      consultado: true,
      configurado: true,
      url,
      sha256,
      encontrado: false,
      veredicto: 'no_catalogado',
      threat_score: 0,
      mensaje: 'Indicador sin historial de malware previo registrado en la red Falcon Sandbox.',
      permalink: `https://www.hybrid-analysis.com/sample/${sha256}`,
    };

  } catch (error) {
    console.warn('Error al conectar con Hybrid Analysis:', error.message);
    return {
      consultado: false,
      configurado: true,
      url,
      sha256,
      error: error.message || 'Error de conexión con Hybrid Analysis Falcon Sandbox',
    };
  }
}

/**
 * Normaliza los resultados del resumen de Hybrid Analysis
 */
function procesarResumenHybridAnalysis(url, sha256, data) {
  const verdictRaw = data.verdict || 'unknown';
  let veredictoNormalizado = 'limpio';
  
  if (verdictRaw === 'malicious') {
    veredictoNormalizado = 'malicioso';
  } else if (verdictRaw === 'suspicious') {
    veredictoNormalizado = 'sospechoso';
  } else if (verdictRaw === 'whitelisted' || verdictRaw === 'no specific threat') {
    veredictoNormalizado = 'seguro';
  } else if (verdictRaw === 'unknown') {
    veredictoNormalizado = data.threat_score > 50 ? 'sospechoso' : 'sin_amenaza_especifica';
  }

  return {
    consultado: true,
    configurado: true,
    url,
    sha256,
    encontrado: true,
    veredicto: veredictoNormalizado,
    veredicto_original: verdictRaw,
    threat_score: data.threat_score ?? (veredictoNormalizado === 'malicioso' ? 100 : 0),
    multiscan_result: data.multiscan_result ?? 0,
    fecha_analisis: data.last_multi_scan || data.analysis_start_time || data.submitted_at || null,
    permalink: `https://www.hybrid-analysis.com/sample/${sha256}`,
  };
}
