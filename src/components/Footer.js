import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Heart, ExternalLink, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Marca */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-black text-base">VerificaYa</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Plataforma ciudadana de ciberseguridad y detección de estafas con IA, enfocada en el mercado peruano.
            </p>
            <div className="flex flex-col gap-2 mb-3">
              <a 
                href="mailto:verificayacyber@gmail.com?subject=Mensaje%20de%20Apoyo%20-%20VerificaYa"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-300 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>verificayacyber@gmail.com</span>
              </a>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
              🇵🇪 Hecho en Perú
            </span>
          </div>

          {/* Navegación */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Plataforma</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Analizar Mensaje</Link></li>
              <li><Link href="/estafas-comunes" className="hover:text-blue-400 transition-colors">Estafas Comunes en Perú</Link></li>
              <li><Link href="/nosotros" className="hover:text-blue-400 transition-colors">Sobre Nosotros</Link></li>
              <li><Link href="/precios" className="hover:text-rose-400 text-rose-300 font-semibold transition-colors flex items-center gap-1">Donativos & Sostenibilidad ❤️</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Legal y Privacidad</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/privacidad" className="hover:text-blue-400 transition-colors font-medium">Política de Privacidad</Link></li>
              <li className="text-emerald-400 font-semibold flex items-center gap-1">
                <span>🔒 Cero registros ni almacenamiento</span>
              </li>
              <li><span className="text-slate-500">Términos de Uso</span></li>
              <li><span className="text-slate-500">Aviso Legal</span></li>
            </ul>
            <div className="mt-4 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-xs text-slate-400 leading-relaxed">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 inline mb-0.5 mr-1" />
              VerificaYa es una herramienta orientativa. No reemplaza una denuncia ante la <strong className="text-slate-300">PNP</strong> o la <strong className="text-slate-300">Indecopi</strong>.
            </div>
          </div>

          {/* Entidades */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">¿Fuiste víctima de estafa?</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="https://www.pnp.gob.pe" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  PNP Divindat — División Alta Tecnología
                </a>
              </li>
              <li>
                <a href="https://www.indecopi.gob.pe" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  Indecopi — Protección al Consumidor
                </a>
              </li>
              <li>
                <a href="https://www.sbs.gob.pe" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  SBS — Superintendencia de Banca
                </a>
              </li>
              <li>
                <a href="https://www.osiptel.gob.pe" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  Osiptel — Fraudes Telefónicos
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Pie */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} VerificaYa. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            Hecho con <Heart className="w-3 h-3 text-red-500 fill-red-500" /> para los ciudadanos del Perú
          </p>
        </div>

      </div>
    </footer>
  );
}
