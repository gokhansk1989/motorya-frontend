'use client';

import { useEffect } from 'react';
import { API_URL } from '@/lib/apiBase';

/**
 * Blog yazisinin okunma sayisini bildirir.
 *
 * Neden tarayicidan: yazi sayfasi ISR ile 5 dakika onbellekte tutuluyor,
 * yani kac kisi okursa okusun backend'e 5 dakikada en fazla bir istek
 * gidiyor. Sunucu tarafinda saymak okuyucuyu degil onbellek yenilemesini
 * olcerdi.
 *
 * sessionStorage ile ayni sekmede ayni yazi bir kez sayiliyor: yenileme
 * tusuna basmak ya da yaziya geri donmek sayiyi sisirmesin.
 *
 * keepalive, kullanici hemen baska sayfaya gecse bile istegin gitmesini
 * saglar. Hata sessizce yutuluyor - bir sayac ugruna okuma deneyimi
 * bozulmaz ve hata gunlugu dolmaz.
 */
export function OkunmaSayaci({ slug }: { slug: string }) {
  useEffect(() => {
    const anahtar = `blog-goruntulendi:${slug}`;
    try {
      if (sessionStorage.getItem(anahtar)) return;
      sessionStorage.setItem(anahtar, '1');
    } catch {
      // Gizli sekmede sessionStorage erisimi hata verebilir; sayim yine de
      // yapilsin, yalnizca tekrar korumasi calismaz.
    }
    fetch(`${API_URL}/blog/${encodeURIComponent(slug)}/view`, {
      method: 'POST',
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}
