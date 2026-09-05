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
        ],
      },
    ],
    sitemap: 'https://motorya.com.tr/sitemap.xml',
  };
}
