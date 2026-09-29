import { ClipboardCopy, Cpu, ShieldCheck } from 'lucide-react';

export default function ComoFuncionaSection() {
  const pasos = [
    {
      numero: '01',
      titulo: 'Copia y Pega',
      descripcion: 'Copia el texto del mensaje sospechoso que recibiste por WhatsApp, SMS o redes sociales y pégalo en el analizador. También puedes subir una captura de pantalla.',
      icono: ClipboardCopy,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      numero: '02',
      titulo: 'Análisis con IA en 5 seg',
      descripcion: 'Nuestro modelo de Inteligencia Artificial examina enlaces, sintaxis, números telefónicos y tácticas de extorsión típicas del cibercrimen peruano.',
      icono: Cpu,
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      numero: '03',
      titulo: 'Dictamen y Recomendación',
      descripcion: 'Recibes el porcentaje de riesgo, las señales de alarma encontradas y consejos inmediatos para proteger tu dinero y tus datos personales.',
      icono: ShieldCheck,
      color: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Fácil, Rápido y Gratuito
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
            ¿Cómo funciona VerificaYa?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Tres sencillos pasos para no volver a caer en engaños digitales ni perder tus ahorros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {pasos.map((paso, index) => {
            const Icono = paso.icono;
            return (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md shadow-slate-200/40 relative flex flex-col items-start hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center justify-between w-full mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${paso.color} flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition-transform`}>
                    <Icono className="w-7 h-7" />
                  </div>
                  <span className="text-3xl font-black text-slate-200 group-hover:text-blue-200 transition-colors">
                    {paso.numero}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {paso.titulo}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {paso.descripcion}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
