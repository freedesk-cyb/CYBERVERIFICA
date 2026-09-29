'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Shield, 
  Globe2, 
  FileSearch, 
  ArrowRight, 
  Eye,
  Smartphone,
  KeyRound,
  QrCode
} from 'lucide-react';
import FormularioAnalisis from '@/components/FormularioAnalisis';
import ResultadoAnalisis from '@/components/ResultadoAnalisis';
import ComoFuncionaSection from '@/components/ComoFuncionaSection';
import EstadisticasCard from '@/components/EstadisticasCard';
import TestimoniosSection from '@/components/TestimoniosSection';

export default function HomePage() {
  const [resultado, setResultado] = useState(null);
  const [mensajeAnalizado, setMensajeAnalizado] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const resultadoRef = useRef(null);

  const handleAnalisisCompletado = (dataResultado, textoOriginal) => {
    setResultado(dataResultado);
    setMensajeAnalizado(textoOriginal);

    setTimeout(() => {
      resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleReset = () => {
    setResultado(null);
    setMensajeAnalizado('');
    const formElement = document.getElementById('analizador');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* SECCIÓN HERO PROFESIONAL DE CIBERSEGURIDAD */}
      <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
        {/* Hero background image */}
        <Image src="/hero_cybersecurity.jpg" alt="Protección Digital Perú" fill priority className="object-cover opacity-30" />
        {/* Efectos de fondo estilo Cyber-Defense */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e40af_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-blue-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Barra de Estado del Sistema de Seguridad */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-blue-400 text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-200">Red Antifraude Ciudadana Perú</span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-bold">Protección Activa 24/7</span>
            </div>
          </div>

          {/* Titular Principal */}
          <div className="text-center max-w-4xl mx-auto space-y-5 mb-10">
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Ciberseguridad y Detección de Estafas con{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
                Inteligencia Artificial
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
              Analiza en segundos mensajes de <strong>WhatsApp, SMS, correos de phishing, códigos QR (Quishing) o capturas de chat</strong>. Evaluamos riesgos cibernéticos, dominios clonados e ingeniería social antes de que comprometas tu dinero o tu identidad.
            </p>

            {/* Pilares de Confianza */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Análisis Forense IA</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs font-medium">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cero Datos ni Registros</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs font-medium">
                <QrCode className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Escáner QR & Capturas</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs font-medium">
                <Globe2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>100% Libre en Perú</span>
              </div>
            </div>

          </div>

          {/* Formulario Principal de Análisis */}
          <div className="relative z-20">
            <FormularioAnalisis 
              onAnalisisCompletado={handleAnalisisCompletado}
              estaCargando={estaCargando}
              setEstaCargando={setEstaCargando}
            />
          </div>

          {/* Ancla para Scroll de Resultados */}
          <div ref={resultadoRef} />

          {/* Visualización del Resultado */}
          {resultado && (
            <ResultadoAnalisis 
              resultado={resultado}
              mensajeAnalizado={mensajeAnalizado}
              onReset={handleReset}
            />
          )}

        </div>
      </section>

      {/* SECCIÓN: CAPAS DE PROTECCIÓN DE CIBERSEGURIDAD */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-200">
              <Shield className="w-3.5 h-3.5" />
              Arquitectura de Protección Digital
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              ¿Cómo te protege el motor de VerificaYa?
            </h2>
            <p className="text-base text-slate-600 mt-3 leading-relaxed">
              Combinamos modelos avanzados de lenguaje con heurísticas especializadas en el cibercrimen peruano para blindar tus decisiones digitales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                1. Detección Anti-Phishing
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Examina enlaces sospechosos, acortadores (bit.ly, tinyurl) y dominios clonados que simulan bancos (BCP, Interbank, BBVA) o entidades del Estado (SUNAT, Bono).
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-4 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                2. Filtro de Ingeniería Social
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Identifica tácticas de manipulación psicológica: urgencia artificial, amenazas de embargo o bloqueo de cuentas, y falsos premios irresistibles.
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-red-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center mb-4 shadow-md shadow-red-600/20 group-hover:scale-105 transition-transform">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                3. Alerta de Extorsión & Empleo Falso
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Detecta redes de reclutamiento falso (tareas de TikTok/Amazon) y aplicaciones móviles extorsivas de préstamos rápidos (&quot;Gota a Gota&quot;).
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                4. Protocolo de Autodefensa
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Te entrega una guía paso a paso: cómo bloquear números, asegurar tus cuentas bancarias y denunciar ante la PNP Divindat sin almacenar tus datos.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECCIÓN DE ESTADÍSTICAS E IMPACTO SOCIAL */}
      <EstadisticasCard />

      {/* SECCIÓN DE CÓMO FUNCIONA */}
      <ComoFuncionaSection />

      {/* SECCIÓN: DECÁLOGO DE CIBERSEGURIDAD PARA EL CIUDADANO */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                <KeyRound className="w-3.5 h-3.5" />
                Guía de Seguridad Digital
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                Reglas de Oro para Protegerte en Internet
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Las entidades formales en el Perú siguen protocolos estrictos. Memoriza estos 4 principios para evitar fraudes en tu vida diaria:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Los bancos nunca piden Token por SMS</h4>
                  <p className="text-xs text-slate-400 mt-1">Ni tu clave de 6 dígitos ni tu CVV. Si te lo piden por mensaje o llamada, es 100% estafa.</p>
                </div>
              </div>

              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Nunca pagues para trabajar</h4>
                  <p className="text-xs text-slate-400 mt-1">Ninguna empresa seria cobra por uniformes, exámenes médicos ni pide transferir dinero para &quot;desbloquear tareas&quot;.</p>
                </div>
              </div>

              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Revisa la web oficial (.pe o .gob.pe)</h4>
                  <p className="text-xs text-slate-400 mt-1">Los portales del Estado terminan en <code>.gob.pe</code>. Desconfía de sitios <code>.xyz</code>, <code>.online</code> o <code>.site</code>.</p>
                </div>
              </div>

              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-sm">
                  4
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Cuidado con permisos en apps</h4>
                  <p className="text-xs text-slate-400 mt-1">No concedas acceso a tus contactos ni fotos a apps de préstamos rápidos no autorizadas por la SBS.</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SECCIÓN DE TESTIMONIOS */}
      <TestimoniosSection />

      {/* SECCIÓN PREGUNTAS FRECUENTES */}
      <section className="py-16 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Preguntas Frecuentes sobre Seguridad
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Todo lo que necesitas saber sobre el uso de la plataforma y la protección de tus datos.
            </p>
          </div>

          <div className="space-y-4">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                ¿Guardan mis mensajes, capturas, teléfonos o registros de búsqueda?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong>No, en lo absoluto.</strong> Implementamos una política estricta de <em>Cero Almacenamiento y Cero Registros (Zero-Logs Architecture)</em>. No almacenamos copias de tus textos, capturas de pantalla, números de celular ni historiales de análisis. Las consultas se procesan en la memoria volátil del servidor para emitir el veredicto en tiempo real y se descartan inmediatamente después.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                ¿Qué tan confiable es el diagnóstico de la Inteligencia Artificial?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nuestro motor está configurado con las heurísticas y vectores de ataque cibernético más recientes en Perú. Sin embargo, funciona como una herramienta de orientación preventiva y autodefensa ciudadana; no reemplaza una denuncia policial ante la PNP.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">
                ¿Qué hago si ya caí o transferí dinero?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Comunícate de inmediato con tu banco o billetera (Yape/Plin) para solicitar el bloqueo preventivo de tus canales digitales. Luego, acude con tus capturas a la <strong>División de Investigación de Delitos de Alta Tecnología (Divindat PNP)</strong> en Av. España 323, Lima, o a la comisaría de tu sector.
              </p>
            </div>

          </div>

          {/* Banner de Llamado a la Acción */}
          <div className="mt-12 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-8 sm:p-10 text-center text-white shadow-xl shadow-blue-900/20">
            <h3 className="text-2xl sm:text-3xl font-black mb-3">
              ¿Tienes un mensaje o captura sospechosa en este momento?
            </h3>
            <p className="text-blue-200 text-sm sm:text-base max-w-xl mx-auto mb-6">
              Verifícalo gratis en 5 segundos y protege tus ahorros y los de tu familia.
            </p>
            <button
              onClick={() => {
                const el = document.getElementById('analizador');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-slate-900 bg-white hover:bg-blue-50 shadow-md transition-all hover:scale-105"
            >
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Subir o pegar para analizar ahora
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
