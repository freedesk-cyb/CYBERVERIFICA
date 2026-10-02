import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Canonical y Open Graph: siempre el dominio de producción.
// En Vercel, definir NEXT_PUBLIC_SITE_URL (ej. https://verificaya.pe) para evitar
// que los deploys de preview generen URLs distintas por VERCEL_URL.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verificaya.pe';

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
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'VerificaYa - Detecta Estafas con Inteligencia Artificial en Perú',
    description: '¿Recibiste un mensaje sospechoso? Pégalo aquí y descubre con IA si es una estafa antes de perder tu dinero. 100% Gratis.',
    url: siteUrl,
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VerificaYa',
    alternateName: ['VerificaYa Perú', 'Verifica Ya'],
    url: siteUrl,
  };

  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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

