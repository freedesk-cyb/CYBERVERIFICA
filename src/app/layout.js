import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'VerificaYa - Detecta Estafas con Inteligencia Artificial en Perú',
  description: 'Analiza mensajes sospechosos de WhatsApp, ofertas laborales falsas, préstamos gota a gota y phishing bancario con IA en segundos. Gratis y confidencial.',
  keywords: [
    'verificar estafa peru',
    'estafas whatsapp peru',
    'phishing bcp interbank yape',
    'trabajos falsos tiktok',
    'gota a gota peru apps',
    'antifraude inteligencia artificial',
    'verificaya peru'
  ],
  authors: [{ name: 'VerificaYa Perú' }],
  creator: 'VerificaYa',
  publisher: 'VerificaYa',
  metadataBase: new URL('https://verificaya.pe'),
  openGraph: {
    title: 'VerificaYa - Detecta Estafas con Inteligencia Artificial en Perú',
    description: '¿Recibiste un mensaje sospechoso? Pégalo aquí y descubre con IA si es una estafa antes de perder tu dinero. 100% Gratis.',
    url: 'https://verificaya.pe',
    siteName: 'VerificaYa',
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VerificaYa - Detecta Estafas con Inteligencia Artificial',
    description: 'Protege tu dinero y el de tu familia contra estafas digitales en Perú.',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: '9zy-wCKRv9bVyqMpLrQpGvUWIs3n146pk4RCFG0uS6o',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
