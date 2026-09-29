/**
 * Integración con NVIDIA NIM (Kimi K3 de Moonshot AI / visión Llama)
 * Emite un diagnóstico de ciberseguridad independiente utilizando
 * el endpoint OpenAI-compatible de NVIDIA NIM.
 */

import { extraerJson } from './extraerJson';

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';

/**
 * Prompt del sistema para NVIDIA Nemotron: Diagnóstico de riesgo de fraude
 */
const SYSTEM_PROMPT_NVIDIA = `Eres un motor de diagnóstico de ciberseguridad antifraude especializado en el ecosistema digital del Perú (bancos BCP, Interbank, BBVA; billeteras Yape y Plin; préstamos "gota a gota"; falsas ofertas laborales; suplantación de SUNAT y de familiares).

Tu misión es diagnosticar el mensaje proporcionado y responder UNICAMENTE un objeto JSON válido con la siguiente estructura exacta:

{
  "nivel_riesgo": "Alto" | "Medio" | "Bajo",
  "porcentaje": numero entero entre 0 y 100,
  "categoria": "Laboral" | "Financiera" | "Venta" | "Phishing" | "Otro",
  "senales": [
    "Señal detectada 1",
    "Señal detectada 2",
    "Señal detectada 3"
  ],
  "explicacion": "Diagnóstico directo de 2 a 3 oraciones sobre el vector de fraude y el riesgo para el ciudadano.",
  "recomendacion": "Acción preventiva inmediata clara y concisa."
}

Sé riguroso, objetivo y no incluyas ningún texto fuera del JSON. Si el mensaje es legítimo usa nivel_riesgo "Bajo" y porcentaje 0-20%.`;

/**
 * Analiza un mensaje utilizando la API de NVIDIA NIM
 * @param {string} mensaje
 * @param {object|null} telemetriaVT
 * @param {object|null} telemetriaHA
 * @returns {Promise<object>}
 */
export async function analizarMensajeConNvidia(mensaje, telemetriaVT = null, telemetriaHA = null, imagenBase64 = null) {
  if (!NVIDIA_API_KEY) {
    throw new Error('La variable de entorno NVIDIA_API_KEY no está configurada.');
  }

  const hayImagen = typeof imagenBase64 === 'string' && imagenBase64.startsWith('data:image/');

  // Modelos NVIDIA NIM en orden de prioridad, verificados contra GET /v1/models.
  // Excluidos por prueba directa: moonshotai/kimi-k3 (timeout >45s),
  // mistralai/mistral-nemotron (EOL) y deepseek-ai/deepseek-v4.1-flash
  // (78s sin JSON utilizable). Varios modelos listados por la API responden
  // "Not found for account": no asumir que estar listado implica acceso.
  const modelos = hayImagen
    ? [
        'meta/llama-3.2-11b-vision-instruct',
      ]
    : [
        'nvidia/nemotron-3-ultra-550b-a55b',
        'nvidia/nemotron-3.5-lightning-30b-a3b',
        'meta/llama-3.2-11b-vision-instruct',
      ];

  let userPrompt = hayImagen
    ? `Analiza la imagen adjunta (captura de una conversación). Este es el texto extraído de ella por OCR:\n\n"""\n${mensaje}\n"""\n\nObserva también los elementos visuales (logos falsos, diseño suplantado, capturas de chat, códigos QR) y diagnostica el riesgo de estafa.`
    : `Diagnostica el siguiente mensaje y determina el riesgo de estafa:\n\n"""\n${mensaje}\n"""`;

  if (telemetriaVT && telemetriaVT.consultado && telemetriaVT.stats) {
    const { malicious, suspicious, total } = telemetriaVT.stats;
    userPrompt += `\n\n[EVIDENCIA VIRUSTOTAL]: ${malicious} de ${total} motores marcaron la URL como maliciosa (${suspicious} como sospechosa).`;
  }

  if (telemetriaHA && telemetriaHA.consultado) {
    userPrompt += `\n\n[EVIDENCIA FALCON SANDBOX]: Threat Score ${telemetriaHA.threat_score}/100, Veredicto: ${telemetriaHA.veredicto}.`;
  }

  let ultimoError = null;
  // Modelos confirmados como inservibles en esta sesion (EOL / sin acceso /
  // overload). Se evita reintentar el mismo fallo en el respaldo vision->texto.
  const descartados = new Set();

  for (const modelo of modelos) {
    if (descartados.has(modelo)) continue;
    try {
      const userContent = hayImagen
        ? [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: imagenBase64 } },
          ]
        : userPrompt;

        // Tiempos por modelo (medidos). El respaldo rápido debe fallar rápido
        // para dejar margen al siguiente dentro del límite global de la ruta.
        // Presupuestos por modelo medidos. La cadena completa (30+16+8=54s)
        // debe caber en el límite de la ruta; con visión hay además un
        // retroceso a texto (8+54=62s), de ahí el tope de 65s en route.js.
        // Dar más margen al 550B es lo que permite que llegue a responder en
        // lugar de agotar el tiempo y caer al siguiente.
        const TIMEOUTS = {
          'nvidia/nemotron-3-ultra-550b-a55b': 30000,
          'nvidia/nemotron-3.5-lightning-30b-a3b': 16000,
          'meta/llama-3.2-11b-vision-instruct': 8000,
        };
        const timeoutModelo = TIMEOUTS[modelo] ?? (hayImagen ? 14000 : 16000);

        // Los modelos de visión no aceptan response_format: se extrae el JSON del texto
        const cuerpo = {
          model: modelo,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT_NVIDIA },
            { role: 'user', content: userContent },
          ],
          temperature: 0.1,
          max_tokens: 1024,
        };
        if (!hayImagen) {
          cuerpo.response_format = { type: 'json_object' };
        }

        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          },
          body: JSON.stringify(cuerpo),
          signal: AbortSignal.timeout(timeoutModelo),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.detail || errorBody.message || `NVIDIA NIM respondió con código ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;

      if (!rawText) {
        throw new Error('Respuesta vacía de NVIDIA NIM');
      }

      const parsed = extraerJson(rawText);
      if (!parsed) {
        throw new Error(data.choices?.[0]?.finish_reason === 'length'
          ? 'NVIDIA truncó la respuesta por límite de tokens.'
          : 'No se pudo parsear el JSON de NVIDIA NIM');
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
          : ['Patrones sospechosos identificados por NVIDIA'],
        explicacion: parsed.explicacion || 'Se detectaron elementos de riesgo que requieren precaución.',
        recomendacion: parsed.recomendacion || 'No proporciones datos confidenciales ni realices transferencias.',
        modelo_usado: modelo,
      };
    } catch (err) {
      const msg = err.message || '';
      const esRetirado =
        /end of life|no longer available|is not found|not found for account|deprecat/i.test(msg);
      const esSobrecarga = /\b503\b|overloaded|too many requests|\b429\b/i.test(msg);
      console.warn(`Intento con modelo NVIDIA ${modelo} falló${esRetirado ? ' (modelo retirado)' : esSobrecarga ? ' (sobrecarga)' : ''}:`, msg.slice(0, 160));
      // No reintentar un modelo confirmado como muerto: ahorra ~15s por análisis.
      if (esRetirado || esSobrecarga) descartados.add(modelo);
      ultimoError = err;
    }
  }

  // Si el análisis de visión falla (timeout o JSON inválido), analizar el texto OCR como respaldo
  if (hayImagen) {
    console.warn('NVIDIA visión no disponible, analizando solo el texto extraído por OCR.');
    return analizarMensajeConNvidia(mensaje, telemetriaVT, telemetriaHA, null);
  }

  throw new Error(`NVIDIA NIM: ${ultimoError?.message || 'Fallo de conexión'}`);
}
