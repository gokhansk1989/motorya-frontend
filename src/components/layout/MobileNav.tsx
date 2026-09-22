'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Plus, MessageCircle, User, Newspaper } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useNotifications, useOzet } from '@/hooks/useNotifications';

const HIDDEN_PATHS: string[] = [];

type Tab = {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
};

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  // Mesaj rozeti okunmamis MESAJ sayisini gostermeli; burada bildirim
  // sayaci kullaniliyordu. Mesajlar zilden cikarildi (bkz. backend
  // messages.service.ts), yani bu sayi artik mesajla hic ilgili degildi.
  const { data: ozet } = useOzet();
  const okunmamisMesaj = ozet?.unreadMessages ?? 0;

  if (HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // Alt cubuk, kullanicinin durumuna gore degisiyor.
  //
  // "Ara" ikinci siraya alindi: bir pazaryerinde en cok kullanilan eylem
  // arama ve webde yalnizca ust bardaki kucuk buytecte sakliydi. Teklifler
  // buradan cikti - zaten Profil altindan erisilebiliyor.
  //
  // Cikis yapmis ziyaretciye Teklifler ve Mesajlar gosteriliyordu; ikisi de
  // giris isteyen sayfalar, yani bes yuvanin ikisi siteye ilk gelen birine
  // hicbir ise yaramiyordu. Onlarin yerine kimlik istemeyen iki hedef.
  const tabs: Tab[] = user
    ? [
        { href: '/', icon: <Home size={22} />, label: 'Ana Sayfa' },
        { href: '/ara', icon: <Search size={22} />, label: 'Ara' },
        { href: '/mesajlarim', icon: <MessageCircle size={22} />, label: 'Mesajlar', badge: okunmamisMesaj },
        { href: '/profilim', icon: <User size={22} />, label: 'Profil' },
      ]
    : [
        { href: '/', icon: <Home size={22} />, label: 'Ana Sayfa' },
        { href: '/ara', icon: <Search size={22} />, label: 'Ara' },
        { href: '/blog', icon: <Newspaper size={22} />, label: 'Blog' },
        { href: '/giris', icon: <User size={22} />, label: 'Giriş' },
      ];

  const handleIlanVer = () => {
    router.push(user ? '/ilan-ver' : '/giris?next=/ilan-ver');
  };

  return (
    /* Sayfaya özel sticky CTA bar (ör. ilan detay) ile bottom nav, iOS WebKit'te
       adres çubuğu açılıp kapanırken iki BAĞIMSIZ position:fixed eleman birbirinden
       bağımsız hesaplanıp senkron kayıyordu (scroll'da çakışma/bozulma).
       Tek bir fixed kapsayıcı altında birleştirip her zaman birlikte hareket etmelerini
       sağlıyoruz — sayfa-özel bar buraya portal ile (#m-mobile-bar-slot) render edilir. */
    <div className="m-fixed-bottom-stack">
      <div id="m-mobile-bar-slot" />
      <nav className="m-bottom-nav">
        {/* Sol 2 tab */}
        {tabs.slice(0, 2).map((tab) => (
          <Link key={tab.href} href={tab.href} className="m-bottom-nav__tab" data-active={isActive(tab.href)}>
            <span className="m-bottom-nav__icon">{tab.icon}</span>
            <span className="m-bottom-nav__label">{tab.label}</span>
          </Link>
        ))}

        {/* Merkez FAB — İlan Ver (barın kendi içinde, normal flex akışında) */}
        <button onClick={handleIlanVer} className="m-bottom-nav__fab" aria-label="İlan Ver">
          <Plus size={26} strokeWidth={2.5} />
        </button>

        {/* Sağ 2 tab */}
        {tabs.slice(2).map((tab) => (
          <Link key={tab.href} href={tab.href} className="m-bottom-nav__tab" data-active={isActive(tab.href)}>
            <span className="m-bottom-nav__icon" style={{ position: 'relative' }}>
              {tab.icon}
              {tab.badge ? (
                <span style={{
                  position: 'absolute', top: -4, right: -6,
                  minWidth: 16, height: 16, borderRadius: 8,
                  background: 'var(--accent-2)', color: 'var(--accent-2-ink)',
                  fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center',
                  padding: '0 3px', lineHeight: 1,
                }}>
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              ) : null}
            </span>
            <span className="m-bottom-nav__label">{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
