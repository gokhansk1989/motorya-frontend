'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Plus, MessageCircle, User, ListPlus } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useNotifications } from '@/hooks/useNotifications';

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
  const { data: notifs } = useNotifications();
  const unreadCount = notifs?.meta?.unreadCount ?? 0;

  if (HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const tabs: Tab[] = [
    { href: '/', icon: <Home size={22} />, label: 'Ana Sayfa' },
    { href: '/tekliflerim', icon: <ListPlus size={22} />, label: 'Teklifler' },
    { href: '/mesajlarim', icon: <MessageCircle size={22} />, label: 'Mesajlar', badge: unreadCount },
    { href: user ? '/profilim' : '/giris', icon: <User size={22} />, label: 'Profil' },
  ];

  const handleIlanVer = () => {
    router.push(user ? '/ilan-ver' : '/giris?next=/ilan-ver');
  };

  return (
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
  );
}
