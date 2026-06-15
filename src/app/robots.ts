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
          '/siparislerim',
          '/giris',
          '/kayit',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://motorya.com.tr/sitemap.xml',
  };
}
