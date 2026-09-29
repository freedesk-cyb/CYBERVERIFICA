/**
 * Decodificador de códigos QR en el cliente (Browser)
 * Combina BarcodeDetector nativo de navegadores modernos con jsQR como fallback universal.
 */

/**
 * Escanea y decodifica un código QR a partir de un archivo o Blob de imagen.
 * @param {File|Blob} imageFile 
 * @returns {Promise<{ text: string, type: 'url'|'text' } | null>}
 */
export async function scanQRCodeFromImage(imageFile) {
  if (typeof window === 'undefined') return null;

  // 1. Intento nativo acelerado por hardware con BarcodeDetector (Chrome/Edge modernos)
  if ('BarcodeDetector' in window) {
    try {
      const formats = await window.BarcodeDetector.getSupportedFormats?.() || [];
      if (formats.includes('qr_code')) {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const bitmap = await createImageBitmap(imageFile);
        const barcodes = await detector.detect(bitmap);
        bitmap.close?.();
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          const text = barcodes[0].rawValue.trim();
          return {
            text,
            type: text.startsWith('http://') || text.startsWith('https://') ? 'url' : 'text'
          };
        }
      }
    } catch (e) {
      console.warn('BarcodeDetector nativo no disponible o falló, recurriendo a jsQR:', e);
    }
  }

  // 2. Fallback robusto y universal con jsQR
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = async () => {
        try {
          const { default: jsQR } = await import('jsqr');
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          
          // Limitar tamaño máximo para optimizar rendimiento sin perder definición del QR
          let { width, height } = img;
          const maxDim = 1600;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const imageData = ctx.getImageData(0, 0, width, height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (qrCode && qrCode.data) {
            const text = qrCode.data.trim();
            resolve({
              text,
              type: text.startsWith('http://') || text.startsWith('https://') ? 'url' : 'text'
            });
          } else {
            resolve(null);
          }
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('No se pudo cargar la imagen seleccionada.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Escanea un frame de un elemento <video> en reproducción para decodificar QR en tiempo real.
 * @param {HTMLVideoElement} videoElement
 * @param {HTMLCanvasElement} [canvasElement]
 * @returns {Promise<string|null>} Texto decodificado o null
 */

// Detector nativo reutilizable (evita crear una instancia por cada frame)
let detectorNativoQR = null;
function obtenerDetectorNativo() {
  if (detectorNativoQR === null && typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      detectorNativoQR = new window.BarcodeDetector({ formats: ['qr_code'] });
    } catch {
      detectorNativoQR = false;
    }
  }
  return detectorNativoQR || null;
}

export async function scanQRCodeFromVideo(videoElement, canvasElement) {
  if (!videoElement || videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return null;
  }

  const canvas = canvasElement || document.createElement('canvas');
  const width = videoElement.videoWidth;
  const height = videoElement.videoHeight;

  if (!width || !height) return null;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(videoElement, 0, 0, width, height);

  // 1. Intento nativo rápido
  const detector = obtenerDetectorNativo();
  if (detector) {
    try {
      const barcodes = await detector.detect(canvas);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return barcodes[0].rawValue.trim();
      }
    } catch {
      // Ignorar e ir a jsQR
    }
  }

  // 2. jsQR
  try {
    const { default: jsQR } = await import('jsqr');
    const imageData = ctx.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    return code?.data ? code.data.trim() : null;
  } catch {
    return null;
  }
}
