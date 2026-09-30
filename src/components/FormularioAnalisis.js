'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Search, 
  Sparkles, 
  AlertCircle, 
  Link as LinkIcon, 
  MessageSquare, 
  Trash2, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Image as ImageIcon, 
  UploadCloud, 
  X, 
  QrCode, 
  Camera, 
  CameraOff, 
  ExternalLink,
  Clock,
  RotateCcw
} from 'lucide-react';
import { EJEMPLOS_PRUEBA_RAPIDA } from '@/lib/estafasData';
import { 
  LIMITES_CONSULTAS, 
  obtenerEstadoCliente, 
  registrarConsultaCliente, 
  formatearTiempoRestante, 
  VENTANA_HORAS 
} from '@/lib/rateLimit';

export default function FormularioAnalisis({ onAnalisisCompletado, estaCargando, setEstaCargando }) {
  const [tabActivo, setTabActivo] = useState('mensaje'); // 'mensaje' | 'captura' | 'url' | 'qr'
  const [texto, setTexto] = useState('');
  const [url, setUrl] = useState('');
  const [imagenes, setImagenes] = useState([]); // Array de { id, file, url, nombre }
  const [qrImagen, setQrImagen] = useState(null); // { id, file, url, nombre } | null
  const [qrDecodificado, setQrDecodificado] = useState('');
  const [qrTipo, setQrTipo] = useState('url'); // 'url' | 'text'
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [escaneandoQR, setEscaneandoQR] = useState(false);
  const [estadoOCR, setEstadoOCR] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');
  const [arrastrando, setArrastrando] = useState(false);
  const [cuotas, setCuotas] = useState({
    mensaje: { usados: 0, restante: 2, max: 2, restableceEnMs: 0 },
    captura: { usados: 0, restante: 2, max: 2, restableceEnMs: 0 },
    url: { usados: 0, restante: 1, max: 1, restableceEnMs: 0 },
    qr: { usados: 0, restante: 1, max: 1, restableceEnMs: 0 },
  });
  
  const fileInputRef = useRef(null);
  const qrFileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const MAX_CARACTERES = 2500; // Debe coincidir con el límite del servidor (api/analizar)

  // Sincronizar y actualizar cuotas locales cada segundo
  useEffect(() => {
    setCuotas(obtenerEstadoCliente());

    const timer = setInterval(() => {
      setCuotas(obtenerEstadoCliente());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Comprime una imagen a data URL base64 (máx. 800px) para análisis visual de las IAs
  const comprimirImagenABase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 800;
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.onerror = () => reject(new Error('No se pudo leer la imagen para el análisis visual.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));
    reader.readAsDataURL(file);
  });

  // Detener cámara de forma segura
  const detenerCamara = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCamaraActiva(false);
  }, []);

  // Procesar archivo de imagen con código QR
  const procesarArchivoQR = useCallback(async (file) => {
    if (!file) return;
    setErrorValidacion('');
    setEscaneandoQR(true);
    setQrDecodificado('');
    detenerCamara();

    const imgObj = {
      id: `qr-${Date.now()}`,
      file,
      url: URL.createObjectURL(file),
      nombre: file.name || 'QR_cargado.png'
    };
    setQrImagen((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return imgObj;
    });

    try {
      const { scanQRCodeFromImage } = await import('@/lib/qrScanner');
      const resultado = await scanQRCodeFromImage(file);
      if (resultado && resultado.text) {
        setQrDecodificado(resultado.text);
        setQrTipo(resultado.type);
      } else {
        setErrorValidacion('⚠️ No se detectó un código QR legible en esta imagen. Asegúrate de que el código esté bien enfocado o prueba recortando la imagen alrededor del QR.');
      }
    } catch (err) {
      console.error('Error decodificando QR:', err);
      setErrorValidacion('Error al procesar la imagen del código QR: ' + err.message);
    } finally {
      setEscaneandoQR(false);
    }
  }, [detenerCamara]);

  // Limpieza de streams al desmontar el componente
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Soporte para pegar imágenes directamente (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      if (tabActivo === 'captura') {
        const archivosPegados = [];
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              archivosPegados.push({
                id: `pasted-${Date.now()}-${i}`,
                file,
                url: URL.createObjectURL(file),
                nombre: `Captura_pegada_${i + 1}.png`
              });
            }
          }
        }

        if (archivosPegados.length > 0) {
          setImagenes((prev) => [...prev, ...archivosPegados].slice(0, 5));
          setErrorValidacion('');
        }
      } else if (tabActivo === 'qr') {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              procesarArchivoQR(file);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [tabActivo, procesarArchivoQR]);

  // Monitoreo y procesamiento de la cámara en vivo
  useEffect(() => {
    if (!camaraActiva) return;

    let cancelado = false;

    const iniciarYMonitorear = async () => {
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('Error al iniciar reproducción de video:', e);
        }

        const loop = async () => {
          if (cancelado) return;
          if (videoRef.current && videoRef.current.readyState >= 2) {
            try {
              const { scanQRCodeFromVideo } = await import('@/lib/qrScanner');
              const textoDetectado = await scanQRCodeFromVideo(videoRef.current, canvasRef.current);
              if (textoDetectado && !cancelado) {
                setQrDecodificado(textoDetectado);
                setQrTipo(textoDetectado.startsWith('http://') || textoDetectado.startsWith('https://') ? 'url' : 'text');
                detenerCamara();
                return;
              }
            } catch (err) {
              // siguiente frame
            }
          }
          animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    iniciarYMonitorear();

    return () => {
      cancelado = true;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [camaraActiva, detenerCamara]);

  const handleTextoChange = (e) => {
    const valor = e.target.value;
    if (valor.length <= MAX_CARACTERES) {
      setTexto(valor);
      if (errorValidacion) setErrorValidacion('');
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    if (errorValidacion) setErrorValidacion('');
  };

  const handleArchivosSeleccionados = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const nuevasImagenes = files.map((file, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      file,
      url: URL.createObjectURL(file),
      nombre: file.name
    }));

    setImagenes((prev) => [...prev, ...nuevasImagenes].slice(0, 5));
    setErrorValidacion('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const eliminarImagen = (id) => {
    setImagenes((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.url) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setArrastrando(true);
  };

  const handleDragLeave = () => {
    setArrastrando(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    if (tabActivo === 'captura') {
      const nuevasImagenes = files.map((file, idx) => ({
        id: `img-${Date.now()}-${idx}`,
        file,
        url: URL.createObjectURL(file),
        nombre: file.name
      }));
      setImagenes((prev) => [...prev, ...nuevasImagenes].slice(0, 5));
      setErrorValidacion('');
    } else if (tabActivo === 'qr') {
      procesarArchivoQR(files[0]);
    }
  };

  const iniciarCamara = async () => {
    setErrorValidacion('');
    setQrImagen((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
    setQrDecodificado('');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setErrorValidacion('Tu navegador o dispositivo no soporta el acceso a la cámara.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      setCamaraActiva(true);
    } catch (err) {
      console.error('Error al solicitar cámara:', err);
      setErrorValidacion('No se pudo acceder a la cámara. Concede los permisos o sube una foto con el QR.');
      setCamaraActiva(false);
    }
  };

  const cargarEjemplo = (textoEjemplo) => {
    detenerCamara();
    setTabActivo('mensaje');
    setTexto(textoEjemplo);
    setErrorValidacion('');
    document.getElementById('textarea-mensaje')?.focus();
  };

  const limpiarFormulario = () => {
    setTexto('');
    setUrl('');
    setImagenes([]);
    setQrImagen((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
    setQrDecodificado('');
    detenerCamara();
    setErrorValidacion('');
    setEstadoOCR('');
  };

  const cuotaActiva = cuotas[tabActivo] || { restante: 1, max: 1, restableceEnMs: 0 };
  const sinCuota = cuotaActiva.restante <= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorValidacion('');

    // Validar cuota antes de procesar
    if (sinCuota) {
      setErrorValidacion(`⚠️ Has alcanzado el límite de ${cuotaActiva.max} consulta(s) de ${LIMITES_CONSULTAS[tabActivo]?.label} por este periodo. Se restablecerá en ${formatearTiempoRestante(cuotaActiva.restableceEnMs)}.`);
      return;
    }

    let contenidoAAnalizar = '';
    let imagenParaIA = null; // Captura opcional para análisis visual multimodal de las IAs

    if (tabActivo === 'mensaje') {
      contenidoAAnalizar = texto.trim();
      if (!contenidoAAnalizar) {
        setErrorValidacion('⚠️ Por favor ingresa o pega el texto del mensaje que deseas verificar.');
        return;
      }
    } else if (tabActivo === 'url') {
      contenidoAAnalizar = url.trim();
      if (!contenidoAAnalizar) {
        setErrorValidacion('⚠️ Por favor ingresa el enlace o URL que deseas verificar.');
        return;
      }
      if (!contenidoAAnalizar.startsWith('http://') && !contenidoAAnalizar.startsWith('https://')) {
        setErrorValidacion('⚠️ El enlace debe comenzar con http:// o https://');
        return;
      }
      contenidoAAnalizar = `Enlace web sospechoso recibido: ${contenidoAAnalizar}`;
    } else if (tabActivo === 'captura') {
      if (imagenes.length === 0) {
        setErrorValidacion('⚠️ Por favor sube al menos una captura de pantalla de la conversación.');
        return;
      }

      setEstaCargando(true);
      setEstadoOCR('🔍 Preparando captura para análisis visual con IA...');

      // 1. Preparar siempre la imagen comprimida para el análisis visual multimodal de las IAs
      try {
        imagenParaIA = await comprimirImagenABase64(imagenes[0].file);
      } catch (imgErr) {
        console.warn('No se pudo preparar la imagen para análisis visual:', imgErr);
      }

      // 2. Intentar extraer texto mediante OCR como complemento
      let textoExtraidoTotal = '';
      try {
        for (let i = 0; i < imagenes.length; i++) {
          setEstadoOCR(`🔍 Leyendo texto de la captura ${i + 1} de ${imagenes.length}...`);
          
          const { createWorker } = await import('tesseract.js');
          const ocrWorker = await createWorker(['spa', 'eng'], 1, {
            logger: (m) => {
              if (m.status === 'recognizing text' && m.progress) {
                setEstadoOCR(`🔍 Leyendo captura ${i + 1} (${Math.round(m.progress * 100)}%)...`);
              }
            },
          });
          const { data: { text: ocrText } } = await ocrWorker.recognize(imagenes[i].file);
          await ocrWorker.terminate();
          
          if (ocrText && ocrText.trim().length > 0) {
            textoExtraidoTotal += `\n[Captura ${i + 1}]:\n` + ocrText.trim() + '\n';
          }
        }
      } catch (ocrErr) {
        console.warn('OCR falló o fue omitido, continuando con visión por IA:', ocrErr);
      }

      if (textoExtraidoTotal.trim().length >= 5) {
        contenidoAAnalizar = `Conversación extraída de captura(s) de pantalla:\n${textoExtraidoTotal.trim()}`;
      } else {
        contenidoAAnalizar = 'Captura de pantalla adjunta para análisis visual forense con Inteligencia Artificial.';
      }

      setEstadoOCR('🧠 Analizando señales de fraude con Inteligencia Artificial...');
    } else if (tabActivo === 'qr') {
      if (!qrDecodificado) {
        if (qrImagen) {
          setErrorValidacion('⚠️ No se detectó un código QR en la imagen cargada. Por favor sube una imagen con un QR visible.');
        } else {
          setErrorValidacion('⚠️ Sube una imagen con un código QR o activa la cámara para escanearlo.');
        }
        return;
      }
      contenidoAAnalizar = `Código QR sospechoso detectado (vector de ataque Quishing / QR Phishing).\nContenido/URL decodificada del QR:\n${qrDecodificado}`;
    }

    setEstaCargando(true);
    if (!estadoOCR) {
      setEstadoOCR('🧠 Consultando motores de IA (Groq + Mistral + OpenCode + NVIDIA)...');
    }

    const intervalProgreso = setInterval(() => {
      setEstadoOCR((prev) => {
        if (prev.includes('motores de IA')) return '🛡️ Auditando seguridad y reputación web...';
        if (prev.includes('reputación web')) return '⚡ Generando dictamen forense y recomendaciones...';
        return '🔍 Finalizando análisis de ciberseguridad...';
      });
    }, 1200);

    try {
      const response = await fetch('/api/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mensaje: contenidoAAnalizar, 
          imagen: imagenParaIA,
          modalidad: tabActivo 
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 429 || data.limiteAlcanzado) {
          setCuotas(obtenerEstadoCliente());
        }
        throw new Error(data.error || 'No se pudo completar el análisis.');
      }

      // Registrar consulta consumida y refrescar límites
      registrarConsultaCliente(tabActivo);
      setCuotas(obtenerEstadoCliente());

      onAnalisisCompletado(data.data, contenidoAAnalizar);
    } catch (err) {
      console.error('Error durante el análisis:', err);
      setErrorValidacion(err.message || 'Ocurrió un error inesperado al conectar con el servidor de análisis.');
    } finally {
      clearInterval(intervalProgreso);
      setEstaCargando(false);
      setEstadoOCR('');
    }
  };

  return (
    <div id="analizador" className="w-full max-w-4xl mx-auto">
      
      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-200/80 overflow-hidden transition-all">
        
        {/* Barra Informativa de Uso Justo (12 horas) */}
        <div className="bg-slate-900 text-slate-200 px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span className="font-semibold text-slate-300">
              Uso Justo Ciudadano:
            </span>
            <span className="text-slate-400 hidden md:inline">
              Texto (2), Captura (2), Link (1) y QR (1) cada 12 horas.
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400">Cupo activo ({LIMITES_CONSULTAS[tabActivo]?.label}):</span>
            <span className={`font-black px-2 py-0.5 rounded-full border ${
              cuotaActiva.restante > 0 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
            }`}>
              {cuotaActiva.restante}/{cuotaActiva.max} disponible{cuotaActiva.max > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Pestañas de Selección */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-slate-200 bg-slate-50/70 p-2 gap-2">
          
          <button
            type="button"
            onClick={() => { setTabActivo('mensaje'); setErrorValidacion(''); detenerCamara(); }}
            className={`flex items-center justify-between py-3 px-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
              tabActivo === 'mensaje'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Pegar Texto</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              (cuotas.mensaje?.restante ?? 2) > 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800 font-extrabold'
            }`}>
              {cuotas.mensaje?.restante ?? 2}/2
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setTabActivo('captura'); setErrorValidacion(''); detenerCamara(); }}
            className={`flex items-center justify-between py-3 px-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all relative cursor-pointer ${
              tabActivo === 'captura'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Subir Captura</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              (cuotas.captura?.restante ?? 2) > 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800 font-extrabold'
            }`}>
              {cuotas.captura?.restante ?? 2}/2
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setTabActivo('url'); setErrorValidacion(''); detenerCamara(); }}
            className={`flex items-center justify-between py-3 px-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${
              tabActivo === 'url'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Analizar Enlace</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              (cuotas.url?.restante ?? 1) > 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800 font-extrabold'
            }`}>
              {cuotas.url?.restante ?? 1}/1
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setTabActivo('qr'); setErrorValidacion(''); }}
            className={`flex items-center justify-between py-3 px-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all relative cursor-pointer ${
              tabActivo === 'qr'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Escanear QR</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              (cuotas.qr?.restante ?? 1) > 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800 font-extrabold'
            }`}>
              {cuotas.qr?.restante ?? 1}/1
            </span>
          </button>

        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5">
          
          {/* Alerta de Límite Alcanzado (12 horas) */}
          {sinCuota && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs sm:text-sm space-y-2.5 animate-fadeIn shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Has alcanzado el cupo de {cuotaActiva.max} consulta(s) de {LIMITES_CONSULTAS[tabActivo]?.label}</span>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  Cada 12 horas
                </span>
              </div>

              <p className="text-amber-800 text-xs leading-relaxed">
                Para que todos los ciudadanos de Perú puedan verificar estafas de forma equitativa y gratuita sin colapsar la infraestructura de Inteligencia Artificial, los cupos se renuevan automáticamente cada 12 horas.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200/80">
                <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                  <span>⏳ Se restablece en:</span>
                  <span className="font-mono bg-white text-purple-700 font-black px-2.5 py-0.5 rounded-lg border border-purple-300 shadow-xs">
                    {formatearTiempoRestante(cuotaActiva.restableceEnMs)}
                  </span>
                </div>

                <Link
                  href="/precios"
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 underline flex items-center gap-1"
                >
                  <span>Apoyar para más servidores</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB: TEXTO */}
          {tabActivo === 'mensaje' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                <label htmlFor="textarea-mensaje" className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  Pega aquí el mensaje sospechoso recibido:
                </label>
                <span>{texto.length} / {MAX_CARACTERES} caracteres</span>
              </div>

              <div className="relative">
                <textarea
                  id="textarea-mensaje"
                  rows={5}
                  value={texto}
                  onChange={handleTextoChange}
                  disabled={estaCargando}
                  placeholder="Ejemplo: ¡Hola! Te escribimos de RRHH de TikTok. Gana S/ 300 al día dando likes a videos. Regístrate en bit.ly/trabajo-tiktok — o — BCP ALERTA: Tu cuenta fue bloqueada..."
                  className="w-full px-4 py-3.5 text-slate-900 bg-slate-50/50 rounded-2xl border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400 text-sm sm:text-base leading-relaxed resize-y disabled:opacity-50"
                />
                
                {texto.length > 0 && !estaCargando && (
                  <button
                    type="button"
                    onClick={limpiarFormulario}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                    title="Limpiar texto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB: CAPTURA DE PANTALLA (OCR) */}
          {tabActivo === 'captura' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  Sube capturas de pantalla de la conversación sospechosa:
                </span>
                <span>Máximo 5 imágenes</span>
              </div>

              {/* Zona Drag and Drop */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  arrastrando
                    ? 'border-blue-600 bg-blue-50/60 scale-[0.99]'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleArchivosSeleccionados}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Haz clic para seleccionar o arrastra tus capturas aquí
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Formatos JPG, PNG, WEBP. También puedes pegar capturas con <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[11px] font-mono">Ctrl + V</kbd>
                  </p>
                </div>
              </div>

              {/* Miniaturas de imágenes seleccionadas */}
              {imagenes.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {imagenes.map((img) => (
                    <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.nombre}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); eliminarImagen(img.id); }}
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors"
                        title="Eliminar imagen"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] text-white truncate px-1.5">
                        {img.nombre}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: URL / ENLACE */}
          {tabActivo === 'url' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                <label htmlFor="input-url" className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                  Pega el enlace web o link sospechoso recibido:
                </label>
              </div>

              <div className="relative">
                <input
                  id="input-url"
                  type="url"
                  value={url}
                  onChange={handleUrlChange}
                  disabled={estaCargando}
                  placeholder="https://bcp-seguridad-alerta.com.pe/actualizar-datos"
                  className="w-full px-4 py-3.5 text-slate-900 bg-slate-50/50 rounded-2xl border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400 text-sm sm:text-base disabled:opacity-50"
                />
                
                {url.length > 0 && !estaCargando && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                    title="Limpiar enlace"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB: CÓDIGO QR (QUISHING) */}
          {tabActivo === 'qr' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-medium text-slate-500">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-blue-600" />
                  Escanea o sube una imagen con un código QR sospechoso:
                </span>
                <span className="text-[11px] text-amber-700 bg-amber-50 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  Protección Anti-Quishing
                </span>
              </div>

              {/* Controles de Entrada QR: Subir Foto vs Cámara */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => qrFileInputRef.current?.click()}
                  className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-3 font-semibold text-xs sm:text-sm text-slate-700 cursor-pointer"
                >
                  <UploadCloud className="w-5 h-5 text-blue-600" />
                  <span>Subir imagen con código QR</span>
                </button>

                <input
                  ref={qrFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) procesarArchivoQR(file);
                  }}
                  className="hidden"
                />

                {!camaraActiva ? (
                  <button
                    type="button"
                    onClick={iniciarCamara}
                    className="p-4 rounded-2xl border border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-3 font-semibold text-xs sm:text-sm text-slate-700 cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-blue-600" />
                    <span>Escanear con la Cámara en Vivo</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={detenerCamara}
                    className="p-4 rounded-2xl border border-red-300 bg-red-50 hover:bg-red-100 transition-all flex items-center justify-center gap-3 font-semibold text-xs sm:text-sm text-red-700 cursor-pointer"
                  >
                    <CameraOff className="w-5 h-5 text-red-600" />
                    <span>Apagar Cámara</span>
                  </button>
                )}
              </div>

              {/* Vista previa de la cámara */}
              {camaraActiva && (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-w-md mx-auto border-2 border-blue-500 shadow-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 border-2 border-dashed border-yellow-400/80 m-8 rounded-xl pointer-events-none animate-pulse flex items-center justify-center">
                    <span className="bg-black/60 text-yellow-300 text-[11px] font-bold px-3 py-1 rounded-full">
                      Apunta al código QR
                    </span>
                  </div>
                </div>
              )}

              {/* Estado de Decodificación del QR */}
              {escaneandoQR && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm rounded-xl animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                  <span>Decodificando código QR de forma segura...</span>
                </div>
              )}

              {qrDecodificado && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <span>Código QR Decodificado Exitosamente</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px]">
                            {qrTipo === 'url' ? 'Enlace Web' : 'Texto / Datos'}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-700">
                          Enlace extraído sin abrirlo en tu navegador (blindado contra redirecciones)
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setQrDecodificado('');
                        setQrImagen((prev) => {
                          if (prev?.url) URL.revokeObjectURL(prev.url);
                          return null;
                        });
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                      title="Escanear otro código"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Recuadro de URL o texto detectado */}
                  <div className="p-3 rounded-xl bg-white border border-emerald-200 text-slate-900 font-mono text-xs sm:text-sm break-all select-all flex items-center justify-between gap-2">
                    <span>{qrDecodificado}</span>
                    {qrTipo === 'url' && (
                      <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>

                  {qrImagen && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrImagen.url}
                        alt="Miniatura QR"
                        className="w-8 h-8 rounded object-cover border border-slate-200"
                      />
                      <span className="truncate">{qrImagen.nombre}</span>
                    </div>
                  )}

                  <div className="text-xs text-slate-600 bg-white/70 rounded-lg p-2.5 border border-emerald-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Presiona <strong>&quot;Analizar código QR — GRATIS&quot;</strong> para que nuestra IA audite el dominio y descarte trampas de Quishing.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mensajes de Error */}
          {errorValidacion && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{errorValidacion}</span>
            </div>
          )}

          {/* Estado de carga OCR */}
          {estadoOCR && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
              <span className="font-semibold">{estadoOCR}</span>
            </div>
          )}

          {/* Botón Principal de Acción */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={estaCargando || sinCuota}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg text-white transition-all shadow-lg flex items-center justify-center gap-3 ${
                sinCuota
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : estaCargando
                  ? 'bg-blue-500 cursor-not-allowed shadow-blue-500/20'
                  : 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.99] shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 cursor-pointer'
              }`}
            >
              {sinCuota ? (
                <div className="flex items-center gap-2 text-sm sm:text-base">
                  <Clock className="w-5 h-5" />
                  <span>Cupo de {LIMITES_CONSULTAS[tabActivo]?.label} agotado (Se renueva en {formatearTiempoRestante(cuotaActiva.restableceEnMs)})</span>
                </div>
              ) : estaCargando ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>{estadoOCR || 'Analizando señales de fraude con IA...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>
                    Analizar {tabActivo === 'captura' ? 'captura(s)' : tabActivo === 'qr' ? 'código QR' : 'ahora'} — GRATIS
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-500 font-medium text-center">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Cero Almacenamiento de Datos ni Registros
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                100% Anónimo y Efímero
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                IA Antifraude en Tiempo Real
              </span>
            </div>
            
            <p className="mt-2.5 text-[11px] text-center text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              🔒 <strong>Garantía de Privacidad & Uso Justo:</strong> No guardamos copias de tus mensajes, capturas ni historiales. Cada usuario cuenta con 2 textos, 2 capturas, 1 link y 1 QR cada 12 horas. Consulta nuestra{' '}
              <Link href="/privacidad" className="text-blue-600 hover:underline font-bold">
                Política de Privacidad
              </Link>.
            </p>
          </div>

          {/* Casos típicos peruanos */}
          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>💡 Casos típicos peruanos para probar con 1 clic:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {EJEMPLOS_PRUEBA_RAPIDA.map((ejemplo, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => cargarEjemplo(ejemplo.texto)}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-300 transition-all font-medium text-left cursor-pointer"
                >
                  {ejemplo.etiqueta}
                </button>
              ))}
            </div>
          </div>

        </form>
      </div>

    </div>
  );
}
