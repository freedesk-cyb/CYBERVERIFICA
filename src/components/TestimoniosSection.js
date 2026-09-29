import { Star, Quote, ShieldCheck, Lock } from 'lucide-react';

export default function TestimoniosSection() {
  const testimonios = [
    {
      nombre: 'Usuario Protegido (L. M.)',
      ciudad: 'Lima (San Juan de Lurigancho)',
      caso: 'Falso trabajo de TikTok',
      texto: 'Me escribieron ofreciéndome S/ 300 al día por dar likes a videos de TikTok. Casi deposito S/ 100 para "desbloquear mi pago", pero pegué el mensaje en VerificaYa y me alertó 98% de riesgo. ¡Me salvaron!',
      estrellas: 5,
      ahorro: 'S/ 500 evitados',
    },
    {
      nombre: 'Ciudadano Anónimo (J. H.)',
      ciudad: 'Arequipa',
      caso: 'SMS falso del BCP',
      texto: 'Llegó un SMS diciendo que mi tarjeta había sido bloqueada y debía entrar a un link. La IA de VerificaYa me mostró que el link no era de viabcp.com. Excelente servicio, muy claro.',
      estrellas: 5,
      ahorro: 'Ahorros bancarios a salvo',
    },
    {
      nombre: 'Usuaria Protegida (M. F.)',
      ciudad: 'Trujillo',
      caso: 'Préstamo express en Facebook',
      texto: 'Iba a descargar una app de préstamos que me pedía acceso a mis contactos. VerificaYa me explicó que era la modalidad "Gota a gota" digital. Bloqueé al instante y denuncié.',
      estrellas: 5,
      ahorro: 'Privacidad protegida',
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Casos Reales • Identidad Protegida
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
            Lo que dicen quienes verificaron a tiempo
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Testimonios de ciudadanos en todo el Perú que evitaron fraudes gracias a la prevención digital (nombres anonimizados por privacidad).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonios.map((item, index) => (
            <div
              key={index}
              className="bg-slate-50/70 rounded-3xl p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(item.estrellas)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {item.ahorro}
                  </span>
                </div>

                <Quote className="w-6 h-6 text-slate-300 mb-2" />

                <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                  &quot;{item.texto}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center text-sm shadow-xs border border-slate-700">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900">{item.nombre}</h4>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                      Anónimo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{item.ciudad}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
