/** @type {import('next').NextConfig} */
const nextConfig = {
  // V-05: Headers de seguridad HTTP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Previene clickjacking: no permitir embeber en iframes de otros sitios
          { key: 'X-Frame-Options', value: 'DENY' },
          // Previene MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Controla qué información de referrer se envía
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Deshabilita APIs del navegador no necesarias
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), interest-cohort=()' },
          // XSS Protection (legacy, pero no estorba)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // HSTS: forzar HTTPS (solo aplica en producción con certificado)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // CSP básica: permitir solo recursos propios y las fuentes/APIs externas necesarias
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net https://unpkg.com",
              "worker-src 'self' blob: https://cdn.jsdelivr.net https://unpkg.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self' https://api.mistral.ai https://integrate.api.nvidia.com https://opencode.ai https://www.virustotal.com https://www.hybrid-analysis.com https://tessdata.projectnaptha.com https://cdn.jsdelivr.net https://unpkg.com blob:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
