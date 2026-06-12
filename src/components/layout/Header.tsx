'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { Search, Bell, MessageSquare, User, Plus, Zap, SlidersHorizontal, LogOut } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" style={{ background: 'none', border: 0, padding: 0, textDecoration: 'none' }}>
      <span style={{
        width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center',
        background: 'var(--accent)', color: 'var(--accent-ink)', boxShadow: '0 6px 18px -8px var(--accent)',
        flexShrink: 0,
      }}>
        <Zap size={20} fill="currentColor" strokeWidth={0} />
      </span>
      <span className="m-display" style={{ fontSize: 22, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
        MOTOR<span className="m-accent">YA</span>
      </span>
    </Link>
  );
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout: clearAuth } = useAuthStore();
  const [searchVal, setSearchVal] = useState('');
  const { data: notifs } = useNotifications();
  const unreadCount = notifs?.filter((n: any) => !n.isRead).length ?? 0;

  const badgeDot: React.CSSProperties = {
    position: 'absolute', top: -3, right: -3, minWidth: 17, height: 17, padding: '0 4px',
    borderRadius: 9, background: 'var(--accent)', color: 'var(--accent-ink)',
    fontSize: 10.5, fontWeight: 800, display: 'grid', placeItems: 'center',
    fontFamily: 'var(--font-mono)', border: '2px solid var(--bg-0)',
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/?q=${encodeURIComponent(searchVal)}`);
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} style={{
      background: 'none', border: 0, color: pathname === href ? 'var(--ink)' : 'var(--ink-3)',
      fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14.5, padding: '6px 2px',
      borderBottom: '2px solid ' + (pathname === href ? 'var(--accent)' : 'transparent'),
      textDecoration: 'none', whiteSpace: 'nowrap',
    }}>{children}</Link>
  );

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'oklch(0.155 0.008 255 / 0.86)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--line-soft)',
    }}>
      <div className="m-wrap" style={{ display: 'flex', alignItems: 'center', height: 'var(--header-h)', gap: 22 }}>
        <Logo />

        <form onSubmit={handleSearch} style={{
          display: 'flex', alignItems: 'center',
          flex: 1, maxWidth: 560, height: 46,
          background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 10,
          padding: '0 6px 0 14px', gap: 8,
        }}>
          <Search size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder="Marka, model, ekipman ara… (AGV, Akrapovic, mont)"
            style={{
              flex: 1, background: 'none', border: 0, color: 'var(--ink)',
              fontSize: 14, padding: '0', outline: 'none',
            }}
          />
          <button type="submit" style={{
            background: 'var(--bg-3)', border: 0, borderRadius: 7,
            height: 34, width: 34, display: 'grid', placeItems: 'center', color: 'var(--ink-2)',
            cursor: 'pointer', flexShrink: 0,
          }}>
            <SlidersHorizontal size={17} />
          </button>
        </form>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 4 }}>
          <NavLink href="/">Keşfet</NavLink>
          <NavLink href="/kategoriler">Kategoriler</NavLink>
          <NavLink href="/blog">Blog</NavLink>
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <>
              <Link href="/bildirimler" style={{ position: 'relative', display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 8, background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink)', textDecoration: 'none' }}>
                <Bell size={20} />
                {unreadCount > 0 && <span style={{ ...badgeDot, background: 'var(--accent-2)', color: 'var(--accent-2-ink)' }}>{unreadCount}</span>}
              </Link>
              <Link href="/mesajlarim" style={{ position: 'relative', display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 8, background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink)', textDecoration: 'none' }}>
                <MessageSquare size={20} />
              </Link>
              <Link href="/profilim" style={{ position: 'relative', display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 8, background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink)', textDecoration: 'none' }}>
                <User size={20} />
              </Link>
              <button onClick={() => clearAuth()} style={{
                display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 8,
                background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink-3)',
              }}>
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link href="/giris" className="m-btn m-btn-ghost" style={{ height: 40, padding: '0 16px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', borderRadius: 8 }}>Giriş Yap</Link>
            </>
          )}
          <Link href="/ilan-ver" className="m-btn m-btn-primary" style={{ marginLeft: 6, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, padding: '0 20px', borderRadius: 8 }}>
            <Plus size={18} strokeWidth={2.4} />İlan Ver
          </Link>
        </div>
      </div>
    </header>
  );
}
