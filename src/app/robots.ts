import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/profilim',
          '/ilanlarim',
          '/mesajlarim',
          '/bildirimler',
          '/favoriler',
          '/tekliflerim',
          '/giris',
          '/kayit',
          '/api/',
          '/api-backend/',
          // Yalnizca mobil uygulamanin WebView'i icin var; dizine girmesi
          // kullaniciyi yaniltir.
          '/turnstile-mobil',
        ],
      },
    ],
    sitemap: 'https://motorya.com.tr/sitemap.xml',
  };
}
