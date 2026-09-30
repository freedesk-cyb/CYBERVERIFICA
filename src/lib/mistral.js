/**
 * Integración con Mistral AI (Mistral AI SAS)
 * Permite emitir un dictamen de ciberseguridad independiente y balanceado
 * utilizando modelos como open-mistral-nemo y open-mistral-7b.
 */

import { extraerJson } from './extraerJson';
import { sanitizarParaPrompt, ANCLA_ANTI_INYECCION } from './seguridad';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';

/**
 * Prompt del sistema para Mistral: Dictamen y evaluación de fraude
 */
const SYSTEM_PROMPT_MISTRAL = `Eres un auditor de ciberseguridad y prevención de fraudes especializado en el ecosistema digital de Perú.
Tu misión es evaluar el mensaje proporcionado y responder UNICAMENTE un objeto JSON válido con la siguiente estructura exacta:

{
  "nivel_riesgo": "Alto" | "Medio" | "Bajo",
  "porcentaje": numero entero entre 0 y 100,
  "categoria": "Laboral" | "Financiera" | "Venta" | "Phishing" | "Otro",
  "senales": [
    "Señal detectada 1",
    "Señal detectada 2",
    "Señal detectada 3"
  ],
  "explicacion": "Explicación directa de 2 a 3 oraciones sobre el vector de fraude y el riesgo para el ciudadano.",
  "recomendacion": "Acción preventiva inmediata clara y concisa."
}

Se riguroso, objetivo y no incluyas ningún texto fuera del JSON. Si es legítimo usa riesgo "Bajo" y porcentaje 0-20%.`;

/**
 * Analiza un mensaje utilizando la API de Mistral AI
 * @param {string} mensaje 
 * @param {object|null} telemetriaVT 
 * @param {object|null} telemetriaHA 
 * @returns {Promise<object>}
 */
export async function analizarMensajeConMistral(mensaje, telemetriaVT = null, telemetriaHA = null, imagenBase64 = null) {
  if (!MISTRAL_API_KEY) {
    throw new Error('La variable de entorno MISTRAL_API_KEY no está configurada.');
  }

  const hayImagen = typeof imagenBase64 === 'string' && imagenBase64.startsWith('data:image/');

  // Modelos Mistral en orden de prioridad (con imagen: modelos de visión)
  const modelos = hayImagen
    ? [
        'pixtral-large-latest',
        'pixtral-12b-2409',
      ]
    : [
        'open-mistral-nemo',
        'open-mistral-7b',
        'mistral-small-latest',
      ];

  let userPrompt = hayImagen
    ? `Analiza la imagen adjunta (captura de una conversación). Este es el texto extraído de ella por OCR:\n\n<<<INICIO_MENSAJE_CIUDADANO>>>\n${sanitizarParaPrompt(mensaje)}\n<<<FIN_MENSAJE_CIUDADANO>>>\n\nObserva también los elementos visuales (logos falsos, diseño suplantado, capturas de chat, códigos QR) y determina el riesgo de estafa.`
    : `Analiza el siguiente mensaje y determina el riesgo de estafa:\n\n<<<INICIO_MENSAJE_CIUDADANO>>>\n${sanitizarParaPrompt(mensaje)}\n<<<FIN_MENSAJE_CIUDADANO>>>`;

  if (telemetriaVT && telemetriaVT.consultado && telemetriaVT.stats) {
    const { malicious, suspicious, total } = telemetriaVT.stats;
    userPrompt += `\n\n[EVIDENCIA VIRUSTOTAL]: ${malicious} de ${total} motores marcaron la URL como maliciosa.`;
  }

  if (telemetriaHA && telemetriaHA.consultado) {
    userPrompt += `\n\n[EVIDENCIA FALCON SANDBOX]: Threat Score ${telemetriaHA.threat_score}/100, Veredicto: ${telemetriaHA.veredicto}.`;
  }

  // V-01: Ancla anti-inyeccion al final del prompt
  userPrompt += ANCLA_ANTI_INYECCION;

  let ultimoError = null;

  for (const modelo of modelos) {
    try {
      const contenidoUsuario = hayImagen
        ? [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: imagenBase64 } },
          ]
        : userPrompt;

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelo,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT_MISTRAL },
            { role: 'user', content: contenidoUsuario },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 1024,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || `Mistral respondió con código ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;

      if (!rawText) {
        throw new Error('Respuesta vacía de Mistral AI');
      }

      const parsed = extraerJson(rawText);
      if (!parsed) {
        throw new Error(data.choices?.[0]?.finish_reason === 'length'
          ? 'Mistral truncó la respuesta por límite de tokens.'
          : 'No se pudo parsear el JSON de Mistral');
      }

      const nivelValido = ['Alto', 'Medio', 'Bajo'].includes(parsed.nivel_riesgo)
        ? parsed.nivel_riesgo
        : (parsed.porcentaje >= 70 ? 'Alto' : (parsed.porcentaje >= 35 ? 'Medio' : 'Bajo'));

      const categoriaValida = ['Laboral', 'Financiera', 'Venta', 'Phishing', 'Otro'].includes(parsed.categoria)
        ? parsed.categoria
        : 'Otro';

      return {
        nivel_riesgo: nivelValido,
        porcentaje: typeof parsed.porcentaje === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.porcentaje))) : 80,
        categoria: categoriaValida,
        senales: Array.isArray(parsed.senales) && parsed.senales.length > 0
          ? parsed.senales
          : ['Patrones sospechosos identificados por Mistral AI'],
        explicacion: parsed.explicacion || 'Se detectaron elementos de riesgo que requieren precaución.',
        recomendacion: parsed.recomendacion || 'No proporciones datos confidenciales ni realices transferencias.',
        modelo_usado: modelo,
      };
    } catch (err) {
      console.warn(`Intento con modelo Mistral ${modelo} falló:`, err.message);
      ultimoError = err;
    }
  }

  // Si el análisis de visión falla, analizar el texto OCR como respaldo
  // ( Groq, Gemini y NVIDIA ya lo hacen; faltaba aquí).
  if (hayImagen) {
    console.warn('Mistral visión no disponible, analizando solo el texto extraído por OCR.');
    return analizarMensajeConMistral(mensaje, telemetriaVT, telemetriaHA, null);
  }

  throw new Error(`Mistral AI: ${ultimoError?.message || 'Fallo de conexión'}`);
}
