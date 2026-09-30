/**
 * Extrae texto de una imagen usando Tesseract.js (OCR en el navegador)
 * Soporta español e inglés para capturas de WhatsApp, SMS y chat.
 *
 * @param {File} imageFile  - Objeto File del input[type=file]
 * @param {Function} onProgress - Callback (0-100) opcional de progreso
 * @returns {Promise<string>} - Texto extraído
 */
export async function extractTextFromImage(imageFile, onProgress) {
  // Importación dinámica para que no rompa el build SSR de Next.js
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker('spa+eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  try {
    const { data: { text } } = await worker.recognize(imageFile);
    return text.trim();
  } finally {
    await worker.terminate();
  }
}
