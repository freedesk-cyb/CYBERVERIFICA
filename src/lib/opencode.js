/**
 * Integración con OpenCode Inference (modelo space-bunny-free).
 * Endpoint OpenAI-compatible con cabecera Bearer.
 * Reemplaza a Gemini, cuya cuota gratuita se agotaba de forma recurrente.
 */

import { extraerJson } from './extraerJson';
import { sanitizarParaPrompt, ANCLA_ANTI_INYECCION } from './seguridad';

const OPENCODE_API_KEY = process.env.OPENCODE_API_KEY || '';
const BASE_URL = process.env.OPENCODE_BASE_URL || 'https://opencode.ai/inference/openai/v1';

// space-bunny-free medido entre 5s y 16s. El resto de la lista son alternativas
// por si el free tier se degrada; hoy ninguna responde desde fuera de OpenCode.
const MODELOS = ['space-bunny-free'];

/**
 * Prompt del sistema: dictamen conciso, en el mismo formato que el resto de motores.
 */
export const SYSTEM_PROMPT_OPENCODE = `Eres un experto en ciberseguridad antifraude especializado en Peru. Tu rol es emitir un DICTAMEN RAPIDO Y PRECISO sobre si un mensaje es una estafa.

RESPONDE UNICAMENTE un objeto JSON valido con EXACTAMENTE esta estructura:
{
  "nivel_riesgo": "Alto" | "Medio" | "Bajo",
  "porcentaje": numero entero entre 0 y 100,
  "categoria": "Laboral" | "Financiera" | "Venta" | "Phishing" | "Otro",
  "senales": [
    "Senal concisa 1",
    "Senal concisa 2",
    "Senal concisa 3"
  ],
  "explicacion": "Dictamen directo en exactamente 2 oraciones: que es y por que es peligroso.",
  "recomendacion": "Una accion inmediata concreta y clara."
}

IMPORTANTE SOBRE LOS NIVELES: se estricto con los falsos positivos. Un mensaje
legitino de un banco, operador o entidad del Estado (cobro de debtores, aviso de
vencimiento, confirmacion de operacion, multidimensional, promocion con
localizador) NO es una estafa: clasificalo como nivel_riesgo "Bajo" con
porcentaje 0-20. Reserve "Medio" y "Alto" para Pressure, urgencia, pagos
solicitados, enlaces sospechosos o suplantacion evidente.

Se breve, directo y contundente. Sin rodeos.`;

export async function analizarMensajeConOpencode(mensaje, telemetriaVT = null, telemetriaHA = null, imagenBase64 = null) {
  if (!OPENCODE_API_KEY) {
    throw new Error('La variable de entorno OPENCODE_API_KEY no esta configurada.');
  }

  const hayImagen = typeof imagenBase64 === 'string' && imagenBase64.startsWith('data:image/');

  let userPrompt = hayImagen
    ? 'Analiza la imagen adjunta (captura de una conversacion). Este es el texto extraido de ella por OCR:\n\n<<<INICIO_MENSAJE_CIUDADANO>>>\n' + sanitizarParaPrompt(mensaje) + '\n<<<FIN_MENSAJE_CIUDADANO>>>\n\nObserva tambien los elementos visuales (logos falsos, diseno suplantado, capturas de chat, codigos QR) y determina el riesgo de estafa.'
    : 'Analiza el siguiente mensaje y determina el riesgo de estafa:\n\n<<<INICIO_MENSAJE_CIUDADANO>>>\n' + sanitizarParaPrompt(mensaje) + '\n<<<FIN_MENSAJE_CIUDADANO>>>';

  if (telemetriaVT && telemetriaVT.consultado && telemetriaVT.stats) {
    const { malicious, suspicious, total } = telemetriaVT.stats;
    userPrompt += '\n\n[EVIDENCIA VIRUSTOTAL]: ' + malicious + ' de ' + total + ' motores marcaron la URL como maliciosa (' + suspicious + ' como sospechosa).';
  }

  if (telemetriaHA && telemetriaHA.consultado) {
    userPrompt += '\n\n[EVIDENCIA FALCON SANDBOX]: Threat Score ' + telemetriaHA.threat_score + '/100, Veredicto: ' + telemetriaHA.veredicto + '.';
  }

  // V-01: Ancla anti-inyeccion al final del prompt
  userPrompt += ANCLA_ANTI_INYECCION;

  let ultimoError = null;

  for (const modelo of MODELOS) {
    try {
      const contenido = hayImagen
        ? [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: imagenBase64 } },
          ]
        : userPrompt;

      const response = await fetch(BASE_URL + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENCODE_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelo,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT_OPENCODE },
            { role: 'user', content: contenido },
          ],
          temperature: 0.1,
          max_tokens: 1024,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(hayImagen ? 30000 : 25000),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const detalle = errorBody.error?.message || errorBody.message || `OpenCode respondió con código ${response.status}`;
        throw new Error(detalle);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;

      if (!rawText) throw new Error('Respuesta vacía de OpenCode');

      // space-bunny-free es free-tier y su salida varía entre llamadas: a veces
      // envuelve el JSON en ```json, a veces añade preámbulo y a veces lo
      // corta. Se prueban varias extracciones antes de descartar el modelo.
      const parsed = extraerJson(rawText);
      if (!parsed) {
        const finish = data.choices?.[0]?.finish_reason;
        throw new Error(finish === 'length'
          ? 'OpenCode truncó la respuesta por límite de tokens.'
          : 'No se pudo parsear el JSON de OpenCode.');
      }

      const nivelValido = ['Alto', 'Medio', 'Bajo'].includes(parsed.nivel_riesgo)
        ? parsed.nivel_riesgo
        : (parsed.porcentaje >= 70 ? 'Alto' : (parsed.porcentaje >= 35 ? 'Medio' : 'Bajo'));

      const categoriaValida = ['Laboral', 'Financiera', 'Venta', 'Phishing', 'Otro'].includes(parsed.categoria)
        ? parsed.categoria
        : 'Otro';

      return {
        nivel_riesgo: nivelValido,
        porcentaje: typeof parsed.porcentaje === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.porcentaje))) : 85,
        categoria: categoriaValida,
        senales: Array.isArray(parsed.senales) && parsed.senales.length > 0
          ? parsed.senales
          : ['Mensaje con patrones atipicos o no verificados'],
        explicacion: parsed.explicacion || 'Se detectaron elementos que requieren precaucion.',
        recomendacion: parsed.recomendacion || 'No compartas datos bancarios ni codigos personales.',
        modelo_usado: modelo,
      };
    } catch (err) {
      const msg = err?.message || '';
      const esSinAcceso = /only be used from within OpenCode|access is disabled|Model is unavailable/i.test(msg);
      console.warn(`Intento con modelo OpenCode ${modelo} fallo${esSinAcceso ? ' (sin acceso)' : ''}:`, msg.slice(0, 160));
      ultimoError = err;
    }
  }

  // Respaldo por texto OCR si el analisis visual no es posible
  if (hayImagen) {
    console.warn('OpenCode visión no disponible, analizando solo el texto extraído por OCR.');
    return analizarMensajeConOpencode(mensaje, telemetriaVT, telemetriaHA, null);
  }

  const errMsg = ultimoError?.message || '';
  const mensajeFinal = /only be used from within OpenCode/i.test(errMsg)
    ? 'OpenCode: el modelo free no permite llamadas desde fuera de OpenCode. El análisis continúa con los otros motores.'
    : /access is disabled|Model is unavailable/i.test(errMsg)
    ? 'OpenCode: modelo no disponible para esta clave. El análisis continúa con los otros motores.'
    : 'Error al procesar con IA: ' + (errMsg || 'Fallo de conexión');

  throw new Error(mensajeFinal);
}
