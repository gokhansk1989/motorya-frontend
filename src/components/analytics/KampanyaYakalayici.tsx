'use client';
import { useEffect } from 'react';
import { kampanyayiKur, kampanyaAcilisiniOlc } from '@/lib/olcum';

/**
 * Kampanya kaynagini sayfa acilisinda yakalar.
 *
 * Uygulama kabugunda, sayfa iceriginden ONCE duruyor. Sebep: React'te
 * ust bilesenin RENDER'i cocuklardan once, ama EFFECT'i cocuklardan
 * SONRA calisiyor. Kampanyayi effect'te kursaydik, ilan detay sayfasinin
 * goruntuleme olayi kampanyasiz gidecekti.
 *
 * Bu yuzden kurulum render sirasinda (asagidaki dogrudan cagri), olay
 * uretimi effect'te. Kurulum fonksiyonu kendi icinde bir kez calisacak
 * sekilde korumali, StrictMode'un ikinci render'i sorun cikarmiyor.
 */
export function KampanyaYakalayici() {
  kampanyayiKur();

  useEffect(() => {
    kampanyaAcilisiniOlc();
  }, []);

  return null;
}
