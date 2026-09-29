'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Coffee, 
  Users, 
  Server, 
  QrCode, 
  Download, 
  Maximize2, 
  X, 
  CheckCircle2, 
  Copy, 
  Share2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  ArrowRight,
  Award,
  Flame,
  ExternalLink,
  Mail,
  Send,
  MessageSquareHeart
} from 'lucide-react';

export default function PreciosPage() {
  const [montoSeleccionado, setMontoSeleccionado] = useState(10);
  const [montoPersonalizado, setMontoPersonalizado] = useState('');
  const [mostrarModalQR, setMostrarModalQR] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [emailCopiado, setEmailCopiado] = useState(false);
  const [haDonado, setHaDonado] = useState(false);
  const [faqAbierta, setFaqAbierta] = useState(null);

  const correoContacto = 'verificayacyber@gmail.com';

  const opcionesDonacion = [
    {
      monto: 3,
      icono: Coffee,
      titulo: 'Un Cafecito',
      impacto: 'Financia 50 análisis de mensajes sospechosos para personas vulnerables.',
      beneficio: 'Medalla Digital Simbólica: Amigo de VerificaYa',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-700 border-amber-200'
    },
    {
      monto: 5,
      icono: ShieldCheck,
      titulo: 'Protector Familiar',
      impacto: 'Protege a 10 familias con alertas preventivas de phishing bancario y clonación de WhatsApp.',
      beneficio: 'Insignia Guardián Digital + Agradecimiento comunitario',
      color: 'from-blue-500/20 to-cyan-500/10 text-blue-700 border-blue-200'
    },
    {
      monto: 10,
      icono: Server,
      titulo: '1 Día de Servidor',
      impacto: 'Mantiene encendidos los servidores de IA (Groq Llama 3.3 + Gemini) procesando alertas 24/7 sin caídas.',
      beneficio: 'Insignia Héroe Antifraude + Acceso prioritario',
      popular: true,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-700 border-purple-300'
    },
    {
      monto: 20,
      icono: Flame,
      titulo: 'Impulso Comunitario',
      impacto: 'Entrena y actualiza los filtros contra nuevas bandas de extorsión y préstamos «Gota a gota».',
      beneficio: 'Insignia Padrino de la Seguridad Ciudadana',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-700 border-emerald-200'
    },
    {
      monto: 50,
      icono: Award,
      titulo: 'Gran Aliado Social',
      impacto: 'Cubre el costo de más de 1,200 análisis de ciberseguridad para adultos mayores y emprendedores.',
      beneficio: 'Insignia de Honor Ciudadano + Reconocimiento en el proyecto',
      color: 'from-rose-500/20 to-pink-500/10 text-rose-700 border-rose-200'
    }
  ];

  const montoActual = montoPersonalizado ? Number(montoPersonalizado) : montoSeleccionado;

  const lanzarConfeti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#742284', '#00d2c7', '#3b82f6', '#10b981', '#f59e0b']
      });
    } catch {
      // Ignorar en entornos sin soporte
    }
  };

  const handleSeleccionarMonto = (monto) => {
    setMontoSeleccionado(monto);
    setMontoPersonalizado('');
    lanzarConfeti();
  };

  const handleYaDone = () => {
    setHaDonado(true);
    try {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#742284', '#00d2c7', '#3b82f6', '#f43f5e', '#fbbf24']
      });
    } catch {
      // fallback
    }
  };

  const copiarMensajeAgradecimiento = () => {
    const texto = `¡Acabo de apoyar a VerificaYa Perú! 🇵🇪🛡️ Una iniciativa 100% gratuita que usa Inteligencia Artificial para proteger a nuestras familias de estafas por WhatsApp y llamadas falsas. Apoya tú también escaneando su QR o visitando https://verificaya.pe/precios`;
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const copiarEmail = () => {
    navigator.clipboard.writeText(correoContacto);
    setEmailCopiado(true);
    setTimeout(() => setEmailCopiado(false), 3000);
  };

  const faqs = [
    {
      q: '¿Por qué VerificaYa funciona a base de donativos y no cobra por análisis?',
      a: 'Nuestra misión es social: proteger a todos los peruanos, especialmente a adultos mayores, trabajadores y emprendedores que no tienen conocimientos técnicos. Creemos que la ciberseguridad preventiva debe ser un bien público y gratuito, financiado por el apoyo voluntario de la propia comunidad.'
    },
    {
      q: '¿A dónde se destina el dinero de las donaciones?',
      a: 'El 100% de los fondos se destina al mantenimiento de los servidores en la nube, consumo de tokens de Inteligencia Artificial (Groq Llama 3.3 y Google Gemini Pro), actualización de bases de datos de números y webs fraudulentas en Perú, y difusión de material educativo preventivo.'
    },
    {
      q: '¿Puedo donar desde cualquier monto?',
      a: '¡Por supuesto! Desde S/ 1 o S/ 2 mediante Yape todo suma enormemente para costear las peticiones a la IA y mantener la plataforma 24 horas al día disponible.'
    },
    {
      q: '¿Cómo puedo enviar mi constancia de donación o un mensaje de apoyo al equipo?',
      a: `Puedes escribirnos directamente a nuestro correo oficial verificayacyber@gmail.com con tus palabras de aliento, sugerencias o adjuntando tu captura de donación para enviarte un agradecimiento especial.`
    },
    {
      q: '¿Qué hago si mi empresa quiere patrocinar o utilizar la API?',
      a: `Contamos con convenios institucionales para empresas, fintechs o portales de empleo. Escríbenos a verificayacyber@gmail.com para coordinar la integración de la API antifraude de VerificaYa en tus plataformas o realizar una contribución corporativa de Responsabilidad Social.`
    },
    {
      q: '¿Cuántas consultas gratuitas puedo realizar?',
      a: 'Cada usuario dispone de 2 análisis de texto, 2 capturas de imagen, 1 enlace web y 1 código QR cada 12 horas. Este sistema de uso justo garantiza que la plataforma siempre esté disponible para todos los ciudadanos del país sin saturar los servidores de IA.'
    },
    {
      q: '¿Puedo colaborar si no tengo dinero para donar?',
      a: '¡Totalmente! Puedes ayudarnos compartiendo VerificaYa en tus grupos familiares de WhatsApp, Facebook y con amigos. Cada persona que evite caer en una estafa gracias a ti es una gran victoria para el país.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Luces de fondo decorativas */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-purple-600/15 via-blue-600/20 to-teal-500/15 blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-purple-700/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Encabezado Principal */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-bold shadow-lg shadow-purple-950/40 mb-4 animate-pulse">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>Iniciativa Ciudadana Gratuita & Sin Fines de Lucro</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Tu donativo protege a <span className="bg-gradient-to-r from-teal-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">miles de peruanos</span> de las estafas
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mt-5 leading-relaxed">
            <strong className="text-white">VerificaYa</strong> es 100% de libre acceso para todo el Perú. 
            Mantenemos activa la Inteligencia Artificial y las alertas antifraude gracias al corazón y solidaridad de personas como tú.
          </p>

          {/* Barra de progreso de la meta mensual comunitaria */}
          <div className="mt-8 bg-slate-800/80 backdrop-blur-md p-5 rounded-3xl border border-slate-700/70 shadow-xl max-w-xl mx-auto">
            <div className="flex justify-between items-center text-xs sm:text-sm font-bold mb-2">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-teal-400" />
                Meta mensual de servidores e IA:
              </span>
              <span className="text-teal-300 font-extrabold">S/ 680 / S/ 1,000 (68%)</span>
            </div>
            
            <div className="w-full bg-slate-950/80 rounded-full h-3.5 p-0.5 border border-slate-700 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000 shadow-md shadow-teal-500/40"
                style={{ width: '68%' }}
              />
            </div>
            
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              🛡️ Cubre costos de procesamiento de <strong>+18,000 análisis mensuales</strong> sin cobrarle a nadie.
            </p>
          </div>

        </div>

        {/* Sección Central: Calculadora Interactiva de Donación + QR Yape */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">

          {/* Columna Izquierda: Selector Interactivo de Montos e Impacto (7 cols) */}
          <div className="lg:col-span-7 bg-slate-800/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl flex flex-col justify-between">
            
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Elige cómo deseas contribuir
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Toca cualquier monto para calcular el impacto social inmediato en el país.
                  </p>
                </div>
                <span className="hidden sm:inline-block px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-300 text-xs font-bold">
                  🇵🇪 Yape Directo
                </span>
              </div>

              {/* Botones de montos interactivos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {opcionesDonacion.map((opcion) => {
                  const Icono = opcion.icono;
                  const seleccionado = montoSeleccionado === opcion.monto && !montoPersonalizado;

                  return (
                    <button
                      key={opcion.monto}
                      type="button"
                      onClick={() => handleSeleccionarMonto(opcion.monto)}
                      className={`relative p-3.5 rounded-2xl border text-left transition-all duration-200 group flex flex-col justify-between ${
                        seleccionado
                          ? 'bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border-purple-400 shadow-lg shadow-purple-500/20 scale-[1.02] ring-2 ring-purple-400/50'
                          : 'bg-slate-900/60 border-slate-700 hover:border-slate-500 hover:bg-slate-900/90'
                      }`}
                    >
                      {opcion.popular && (
                        <span className="absolute -top-2.5 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                          Recomendado
                        </span>
                      )}
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200">
                          {opcion.titulo}
                        </span>
                        <Icono className={`w-4 h-4 ${seleccionado ? 'text-purple-300' : 'text-slate-500 group-hover:text-purple-400'}`} />
                      </div>

                      <div className="text-2xl font-black text-white">
                        S/ {opcion.monto}
                      </div>
                    </button>
                  );
                })}

                {/* Opción Personalizada */}
                <div className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                  montoPersonalizado
                    ? 'bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border-purple-400 ring-2 ring-purple-400/50'
                    : 'bg-slate-900/60 border-slate-700'
                }`}>
                  <span className="text-xs font-semibold text-slate-400 mb-1">Monto Libre</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-black text-slate-400">S/</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="Ej. 15"
                      value={montoPersonalizado}
                      onChange={(e) => {
                        setMontoPersonalizado(e.target.value);
                        if (e.target.value) lanzarConfeti();
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1 text-sm font-bold text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* Tarjeta dinámica de Impacto Social */}
              <div className="bg-gradient-to-br from-purple-950/60 via-slate-900/90 to-indigo-950/60 rounded-2xl p-5 border border-purple-500/30 shadow-inner mb-6 relative overflow-hidden">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 text-rose-400 fill-rose-400 animate-bounce" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-1">
                      Tu impacto estimado con S/ {montoActual || 10}:
                    </span>
                    <p className="text-sm text-slate-200 font-medium leading-relaxed">
                      {montoPersonalizado
                        ? `Con tu generoso aporte voluntario de S/ ${montoPersonalizado}, ayudas a financiar el análisis de más de ${Number(montoPersonalizado) * 15} mensajes sospechosos en tiempo real para la población.`
                        : (opcionesDonacion.find(o => o.monto === montoSeleccionado)?.impacto || 'Tu ayuda mantiene libre de estafas a familias peruanas.')}
                    </p>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-teal-300 bg-teal-950/70 border border-teal-500/30 px-2.5 py-1 rounded-lg">
                      <Award className="w-3.5 h-3.5 text-teal-400" />
                      <span>{opcionesDonacion.find(o => o.monto === montoSeleccionado)?.beneficio || 'Insignia de Agradecimiento Digital'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-700/60">
              <button
                type="button"
                onClick={copiarMensajeAgradecimiento}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all border border-slate-600 cursor-pointer"
              >
                {copiado ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiado ? '¡Copiado al portapapeles!' : 'Copiar link de donación'}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Hola! Te comparto VerificaYa (https://verificaya.pe/precios), una herramienta gratuita que protege a nuestras familias peruanas contra estafas por WhatsApp y SMS. ¡Apoyemos su labor!')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20"
              >
                <Share2 className="w-4 h-4" />
                <span>Difundir por WhatsApp</span>
              </a>
            </div>

          </div>

          {/* Columna Derecha: Tarjeta del QR Yape Oficial (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            <div className="w-full bg-gradient-to-b from-[#742284] via-[#5a1866] to-[#3a0d42] rounded-3xl p-6 sm:p-7 border-2 border-purple-400/50 shadow-2xl shadow-purple-950/60 relative overflow-hidden text-center group">
              
              {/* Badge Yape */}
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00d2c7]/20 border border-[#00d2c7]/50 text-[#00d2c7] text-xs font-black">
                  <span>📱 YAPE OFICIAL</span>
                </div>
                <span className="text-[11px] text-purple-200 font-medium">Perú • Sin Comisiones</span>
              </div>

              {/* Contenedor del QR con Efecto de Enfoque */}
              <div className="relative mx-auto bg-white p-4 rounded-2xl shadow-2xl shadow-black/40 max-w-[260px] sm:max-w-[280px] transition-transform duration-300 group-hover:scale-[1.02]">
                
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-purple-50 flex items-center justify-center">
                  <Image
                    src="/qr-donacion.jpg"
                    alt="Código QR de Yape para donación VerificaYa"
                    width={320}
                    height={320}
                    className="w-full h-full object-contain rounded-lg"
                    priority
                  />
                  {/* Marco decorativo de escaneo */}
                  <div className="absolute inset-0 border-2 border-dashed border-purple-400/40 rounded-lg pointer-events-none" />
                </div>

                <div className="mt-3 flex items-center justify-between text-slate-800 text-[11px] font-bold px-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    QR Activo
                  </span>
                  <button
                    type="button"
                    onClick={() => setMostrarModalQR(true)}
                    className="text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Ampliar</span>
                  </button>
                </div>
              </div>

              {/* Pasos de Escaneo */}
              <div className="mt-5 space-y-2 text-left bg-black/30 p-3.5 rounded-2xl border border-purple-300/20 text-xs text-purple-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#00d2c7] text-slate-900 font-black text-[11px] flex items-center justify-center shrink-0">1</span>
                  <span>Abre tu app <strong>Yape</strong> en tu celular.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#00d2c7] text-slate-900 font-black text-[11px] flex items-center justify-center shrink-0">2</span>
                  <span>Toca en <strong>Escanear QR</strong> y apunta a esta pantalla.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#00d2c7] text-slate-900 font-black text-[11px] flex items-center justify-center shrink-0">3</span>
                  <span>Digita tu aporte (<strong>S/ {montoActual || 10}</strong> o el que desees). ¡Gracias!</span>
                </div>
              </div>

              {/* Botón interactivo "Ya doné" */}
              <div className="mt-5">
                {!haDonado ? (
                  <button
                    type="button"
                    onClick={handleYaDone}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#00d2c7] to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-purple-900" />
                    <span>¡Ya realicé mi aporte por Yape! 🎉</span>
                  </button>
                ) : (
                  <div className="bg-emerald-500/20 border border-emerald-400/50 p-3.5 rounded-2xl text-center animate-fadeIn">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-black text-sm mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡Muchísimas gracias por tu apoyo! ❤️</span>
                    </div>
                    <p className="text-[11px] text-slate-200">
                      Tu generosidad ayuda a salvar el dinero y tranquilidad de familias trabajadoras del Perú.
                    </p>
                  </div>
                )}
              </div>

              {/* Botón de Descargar QR */}
              <div className="mt-3">
                <a
                  href="/qr-donacion.jpg"
                  download="QR-Donacion-VerificaYa-Yape.jpg"
                  className="inline-flex items-center gap-1.5 text-xs text-purple-200 hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  Descargar imagen del QR en alta calidad
                </a>
              </div>

            </div>

          </div>

        </div>

        {/* Sección: Mensaje de Apoyo y Contacto Ciudadano (NUEVO) */}
        <div className="bg-gradient-to-r from-purple-950/50 via-slate-900/90 to-indigo-950/50 rounded-3xl p-8 sm:p-10 border border-purple-500/40 shadow-2xl mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-bold mb-3">
                <MessageSquareHeart className="w-4 h-4 text-rose-400" />
                <span>Mensajes de Apoyo & Sugerencias</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ¿Deseas enviarnos tus palabras de aliento o constancia de donación?
              </h2>
              
              <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
                Leemos con gratitud cada mensaje de la comunidad. Si realizaste una donación, deseas enviarnos comentarios, o quieres alertarnos sobre una nueva modalidad de estafa para investigarla con IA, escríbenos directamente a nuestro correo oficial.
              </p>
            </div>

            {/* Tarjeta de Correo con Acción Rápida */}
            <div className="shrink-0 w-full md:w-auto bg-slate-950/80 p-6 rounded-2xl border border-purple-400/30 shadow-xl text-center md:text-left flex flex-col sm:flex-row md:flex-col items-center gap-4">
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-purple-300" />
                </div>
                <div className="text-left">
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
                    Correo Oficial de Apoyo:
                  </span>
                  <a 
                    href={`mailto:${correoContacto}?subject=Mensaje%20de%20Apoyo%20-%20VerificaYa`}
                    className="text-base sm:text-lg font-black text-purple-300 hover:text-white transition-colors"
                  >
                    {correoContacto}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={copiarEmail}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {emailCopiado ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{emailCopiado ? '¡Copiado!' : 'Copiar'}</span>
                </button>

                <a
                  href={`mailto:${correoContacto}?subject=Mensaje%20de%20Apoyo%20o%20Constancia%20-%20VerificaYa&body=Hola%20equipo%20de%20VerificaYa,%0A%0AMi%20mensaje%20de%20apoyo%20o%20comentario%20es:%20`}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Escribir Correo</span>
                </a>
              </div>

            </div>

          </div>
        </div>

        {/* Sección: Transparencia Total - ¿A dónde va tu dinero? */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-slate-700/70 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Transparencia y Destino de los Recursos
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Cada sol donado se rinde con total claridad para garantizar la continuidad del proyecto para la sociedad peruana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/80 relative overflow-hidden">
              <div className="text-3xl font-black text-teal-400 mb-1">60%</div>
              <h3 className="font-bold text-white text-base mb-2">Servidores e Inteligencia Artificial</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pago de procesamiento en la nube y consumo de modelos Groq Llama 3.3 y Google Gemini para respuestas en menos de 3 segundos sin colapsos.
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/80 relative overflow-hidden">
              <div className="text-3xl font-black text-blue-400 mb-1">25%</div>
              <h3 className="font-bold text-white text-base mb-2">Inteligencia de Amenazas en Perú</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Monitoreo diario de nuevos números telefónicos denunciados, enlaces maliciosos clonados de bancos y modalidades de extorsión &apos;Gota a gota&apos;.
              </p>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-700/80 relative overflow-hidden">
              <div className="text-3xl font-black text-purple-400 mb-1">15%</div>
              <h3 className="font-bold text-white text-base mb-2">Educación y Talleres Preventivos</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Creación de guías ilustradas, difusión comunitaria y charlas digitales para capacitar a adultos mayores y prevenir estafas antes de que ocurran.
              </p>
            </div>

          </div>
        </div>

        {/* Sección: Para Empresas, Fintechs y Aliados Institucionales */}
        <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 rounded-3xl p-8 sm:p-10 border border-blue-500/30 mb-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-3 border border-blue-400/30">
              <Building2 className="w-3.5 h-3.5" />
              Responsabilidad Social & API Empresarial
            </div>
            <h3 className="text-2xl font-black text-white">
              ¿Tu empresa u organización desea ser Patrocinador Oficial?
            </h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Ofrecemos planes de integración API para portales de empleo, plataformas de e-commerce y entidades financieras que desean proteger a sus clientes y apoyar activamente la ciberseguridad nacional.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <a
              href={`mailto:${correoContacto}?subject=Propuesta%20de%20Patrocinio%20o%20API%20Empresarial%20VerificaYa`}
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Contactar a {correoContacto}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Preguntas Frecuentes (FAQ Accordion Interactivo) */}
        <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-10 border border-slate-800 max-w-4xl mx-auto shadow-xl">
          <h3 className="text-xl sm:text-2xl font-black text-white mb-6 flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-purple-400" />
            Preguntas Frecuentes sobre las Donaciones
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = faqAbierta === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setFaqAbierta(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-200 hover:text-white flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-purple-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                  </button>
                  
                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-400 border-t border-slate-900 pt-3 leading-relaxed animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Llamado final a la acción */}
        <div className="text-center mt-16 pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Volver al Analizador de Estafas Gratuito</span>
          </Link>
          <p className="text-xs text-slate-500 mt-3">
            VerificaYa Perú • Desarrollado para la protección ciudadana
          </p>
        </div>

      </div>

      {/* Modal Lightbox para Ampliar el QR */}
      {mostrarModalQR && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl p-6 max-w-sm w-full text-center relative shadow-2xl">
            
            <button
              type="button"
              onClick={() => setMostrarModalQR(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-1.5 text-xs font-black text-[#00d2c7] bg-[#742284] px-3 py-1 rounded-full mb-4">
              <span>YAPE OFICIAL VERIFICAYA</span>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-xl mb-4">
              <Image
                src="/qr-donacion.jpg"
                alt="Código QR de Yape ampliado"
                width={360}
                height={360}
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Escanea con tu app Yape desde cualquier celular para donar.
            </p>

            <button
              type="button"
              onClick={() => setMostrarModalQR(false)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
