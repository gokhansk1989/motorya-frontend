'use client';
import { usePathname, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

// İlan detay, mesajlaşma ve chat sayfalarında FAB'ı gösterme
// (zaten kendi mobile action bar'ları var)
const HIDDEN_PATHS = ['/ilan/', '/mesajlarim'];

export function IlanVerFAB() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  const hidden = HIDDEN_PATHS.some(p => pathname.startsWith(p));
  if (hidden) return null;

  const handleClick = () => {
    router.push(user ? '/ilan-ver' : '/giris?next=/ilan-ver');
  };

  return (
    <button
      onClick={handleClick}
      aria-label="İlan Ver"
      className="m-fab"
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );
}
