import Groq from 'groq-sdk';
import { extraerJson } from './extraerJson';
import { sanitizarParaPrompt, ANCLA_ANTI_INYECCION } from './seguridad';

// Inicializar cliente Groq con la clave de entorno
const groqApiKey = process.env.GROQ_API_KEY || '';

export const groq = new Groq({
  apiKey: groqApiKey,
});

/**
 * Prompt del sistema para Groq: Analisis forense DETALLADO y exhaustivo
 */
const SYSTEM_PROMPT_GROQ_DETALLADO = `Eres un experto de elite en ciberseguridad, antifraude y analisis forense digital, altamente especializado en el ecosistema digital del Peru (bancos BCP, Interbank, BBVA, Scotiabank, Banco de la Nacion; billeteras digitales Yape y Plin; estafas de prestamos "gota a gota" y aplicaciones extorsivas; falsas ofertas laborales en TikTok/Telegram/WhatsApp; fraudes de compras en Marketplace/Instagram; suplantacion de SUNAT, Reniec, Osiptel, bonos del Estado y supuestas maletas en el aeropuerto Jorge Chavez).

Tu mision es emitir un INFORME FORENSE COMPLETO Y EXHAUSTIVO en formato JSON. Este informe sera leido primero por el ciudadano para decidir si es victima de un fraude.

CRITERIOS DE EVALUACION (revisa TODOS):
1. Urgencia artificial o amenazas de bloqueo de cuenta, tarjeta o retencion judicial.
2. Promesas irreales (ganar S/ 200 a S/ 1,000 diarios por dar likes a videos, inversion magica en cripto o bolsa).
3. Solicitud de claves secretas, codigos SMS (OTP), Token Digital o datos de tarjeta de credito/debito.
4. Prestamos inmediatos sin evaluacion de Infocorp pero con cobro adelantado o acceso abusivo a contactos ("gota a gota").
5. Enlaces con dominios apocrifos o acortadores (bit.ly, tinyurl, dominios .xyz, .top, .ru).
6. Suplantacion de identidad institucional (logos borrosos, numeros con prefijos internacionales +234, +62, +1).
7. Pagos adelantados por "gastos administrativos", "uniformes", "examenes medicos" o "aranceles aduaneros".
8. Ataques de Quishing / Codigos QR maliciosos que redirigen a webs clonadas de bancos o descarga de APKs maliciosos.

REGLAS DE RESPUESTA:
- Responde UNICAMENTE un objeto JSON valido, sin bloques de codigo markdown, sin texto previo ni posterior.
- El formato JSON debe tener EXACTAMENTE esta estructura ampliada:
{
  "nivel_riesgo": "Alto" | "Medio" | "Bajo",
  "porcentaje": numero entero entre 0 y 100,
  "categoria": "Laboral" | "Financiera" | "Venta" | "Phishing" | "Otro",
  "senales": [
    "Senal detallada 1 con contexto especifico",
    "Senal detallada 2 con contexto especifico",
    "Senal detallada 3 con contexto especifico",
    "Senal detallada 4 (si aplica)",
    "Senal detallada 5 (si aplica)"
  ],
  "explicacion": "Explicacion exhaustiva de 3 a 5 oraciones en lenguaje claro y empatico. Describe QUE esta pasando, POR QUE es peligroso y COMO opera la estafa especificamente.",
  "analisis_tecnico": "Parrafo tecnico-forense de 2 a 3 oraciones explicando los vectores de ataque, tecnicas de ingenieria social o indicadores de compromiso detectados. Puede incluir terminologia tecnica.",
  "contexto_peru": "Una oracion explicando como este tipo de estafa opera especificamente en Peru, referenciando entidades locales (bancos, SUNAT, PNP, Yape, Plin) o modalidades conocidas del cibercrimen peruano.",
  "recomendacion": "Lista de 3 a 5 acciones inmediatas concretas que el ciudadano debe tomar ahora mismo."
}

Si el mensaje es 100% legitimo, usa nivel_riesgo "Bajo" y porcentaje 0-20%, pero igual completa todos los campos.`;

/**
 * Funcion principal para analizar un mensaje con Groq (analisis detallado)
 */
export async function analizarMensajeConGroq(mensaje, telemetriaVT = null, telemetriaHA = null, imagenBase64 = null) {
  if (!groqApiKey) {
    throw new Error('La variable de entorno GROQ_API_KEY no esta configurada.');
  }

  const hayImagen = typeof imagenBase64 === 'string' && imagenBase64.startsWith('data:image/');

  // Modelos optimizados para maxima velocidad y precision forense
  // (con imagen: modelos con capacidad de vision multimodal)
  const modelos = hayImagen
    ? [
        'meta-llama/llama-4-scout-17b-16e-instruct',
        'meta-llama/llama-4-maverick-17b-128e-instruct',
      ]
    : [
        'qwen/qwen3.8-27b',
        'openai/gpt-oss-20b',
        'openai/gpt-oss-120b',
      ];

  let userPrompt = hayImagen
    ? 'Analiza la imagen adjunta (captura de una conversacion). Este es el texto extraido de ella por OCR:\n\n<<<INICIO_MENSAJE_CIUDADANO>>>\n' + sanitizarParaPrompt(mensaje) + '\n<<<FIN_MENSAJE_CIUDADANO>>>\n\nObserva tambien los elementos visuales (logos falsos, diseno suplantado, capturas de chat, codigos QR) y realiza el informe forense completo.'
    : 'Realiza un informe forense completo del siguiente mensaje sospechoso:\n\n<<<INICIO_MENSAJE_CIUDADANO>>>\n' + sanitizarParaPrompt(mensaje) + '\n<<<FIN_MENSAJE_CIUDADANO>>>';

  if (telemetriaVT && telemetriaVT.consultado && telemetriaVT.stats) {
    const { malicious, suspicious, total } = telemetriaVT.stats;
    const motores = (telemetriaVT.motores_detectores || [])
      .slice(0, 8)
      .map(function(m) { return m.motor + ' (' + m.resultado + ')'; })
      .join(', ');

    userPrompt += '\n\n[EVIDENCIA TECNICA VIRUSTOTAL MULTI-ENGINE]:\n' +
      '- URL evaluada: ' + telemetriaVT.url + '\n' +
      '- Resultado de motores: ' + malicious + ' detectaron MALICIOUS, ' + suspicious + ' detectaron SUSPICIOUS de ' + total + ' motores de seguridad mundiales.\n' +
      (motores ? '- Firmas antivirus/antifraude que alertaron: ' + motores + '\n' : '') +
      'Integra este dictamen en tu analisis_tecnico y senales.';
  }

  if (telemetriaHA && telemetriaHA.consultado) {
    userPrompt += '\n\n[EVIDENCIA TECNICA HYBRID ANALYSIS / CROWDSTRIKE FALCON SANDBOX]:\n' +
      '- Indicador / Hash evaluado: ' + telemetriaHA.sha256 + '\n' +
      '- Veredicto de sandbox: ' + (telemetriaHA.veredicto || telemetriaHA.veredicto_original || 'evaluado') + '\n' +
      '- Threat Score: ' + telemetriaHA.threat_score + '/100\n' +
      '- Multiscan Detections: ' + (telemetriaHA.multiscan_result ?? 0) + '\n' +
      (telemetriaHA.entorno ? '- Entorno de ejecucion: ' + telemetriaHA.entorno + '\n' : '') +
      'Integra este analisis de comportamiento en tu analisis_tecnico y senales forenses.';
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

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_GROQ_DETALLADO },
          { role: 'user', content: contenidoUsuario },
        ],
        model: modelo,
        temperature: 0.1,
        // El tier de Groq limita a 1000 tokens de salida por minuto (OTPM) y
        // calcula el uso esperado ANTES de generar: con 2048 la API rechazaba
        // la peticion entera con 429 aunque el motorrespondiera rapido.
        max_tokens: 900,
        response_format: { type: 'json_object' },
      }, { timeout: 15000 });

      const respuestaTexto = chatCompletion.choices[0]?.message?.content;
      if (!respuestaTexto) {
        throw new Error('La API de Groq devolvio una respuesta vacia.');
      }

      // 900 tokens puede cortar el JSON a media respuesta. Se usa el parser
      // compartido, que intenta varias extracciones antes de descartar el modelo.
      const resultado = extraerJson(respuestaTexto);
      if (!resultado) {
        const cortado = chatCompletion.choices[0]?.finish_reason === 'length';
        throw new Error(cortado
          ? 'Groq truncó la respuesta por límite de tokens (max_tokens).'
          : 'No se pudo parsear el JSON de Groq.');
      }

      const nivelValido = ['Alto', 'Medio', 'Bajo'].includes(resultado.nivel_riesgo)
        ? resultado.nivel_riesgo
        : (resultado.porcentaje >= 70 ? 'Alto' : (resultado.porcentaje >= 35 ? 'Medio' : 'Bajo'));

      const categoriaValida = ['Laboral', 'Financiera', 'Venta', 'Phishing', 'Otro'].includes(resultado.categoria)
        ? resultado.categoria
        : 'Otro';

      return {
        nivel_riesgo: nivelValido,
        porcentaje: typeof resultado.porcentaje === 'number' ? Math.min(100, Math.max(0, Math.round(resultado.porcentaje))) : 85,
        categoria: categoriaValida,
        senales: Array.isArray(resultado.senales) && resultado.senales.length > 0
          ? resultado.senales
          : ['Mensaje con patrones atipicos o no verificados'],
        explicacion: resultado.explicacion || 'Se detectaron elementos que requieren extrema precaucion.',
        analisis_tecnico: resultado.analisis_tecnico || null,
        contexto_peru: resultado.contexto_peru || null,
        recomendacion: resultado.recomendacion || 'No compartas datos bancarios ni codigos personales.',
        modelo_usado: modelo,
      };
    } catch (err) {
      const msg = err?.message || '';
      // 429 de OTPM: el limite es de toda la organizacion, asi que probar los
      // siguientes modelos de la lista solo gastaria tiempo para fallar igual.
      const esRateLimit = /rate_limit_exceeded|OTPM|\b429\b|Request too large/i.test(msg);
      console.warn(`Groq modelo ${modelo} fallo${esRateLimit ? ' (rate-limit OTPM)' : ''}:`, msg.slice(0, 180));
      ultimoError = err;
      if (esRateLimit) break;
    }
  }

  // Si los modelos de vision no estan disponibles, analizar el texto OCR como respaldo
  if (hayImagen) {
    console.warn('Groq vision no disponible, analizando solo el texto extraido por OCR.');
    return analizarMensajeConGroq(mensaje, telemetriaVT, telemetriaHA, null);
  }

  const errMsg = ultimoError?.message || '';
  throw new Error('Groq: ' + (/OTPM|rate_limit_exceeded|Request too large/i.test(errMsg)
    ? 'límite de tokens por minuto alcanzado (tier de pago). El análisis continúa con los otros motores.'
    : (errMsg || 'Fallo de conexion')));
}