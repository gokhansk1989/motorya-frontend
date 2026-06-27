'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/* Sayfaya özel sticky CTA bar'ları MobileNav'ın tek fixed kapsayıcısındaki
   #m-mobile-bar-slot'a taşır — böylece iki bağımsız position:fixed eleman
   yerine tek kapsayıcı olur, iOS WebKit scroll/adres-çubuğu senkron kayması önlenir. */
export function MobileBarPortal({ children }: { children: React.ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.getElementById('m-mobile-bar-slot'));
  }, []);

  if (!slot) return null;
  return createPortal(children, slot);
}
