'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import {
  Search, Bell, MessageSquare, User, Plus, Zap, LogOut,
  Menu, X, Home, Tag, Newspaper, Heart, ListPlus,
  Moon, Sun, BellPlus,
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export function Logo() {
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
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
  const { theme, toggle: toggleTheme } = useThemeStore();
  const [searchVal, setSearchVal] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: notifs } = useNotifications();
  const unreadCount = notifs?.meta?.unreadCount ?? 0;
  const isDark = theme === 'dark';

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    router.push(`/ara?q=${encodeURIComponent(searchVal)}`);
  };

  const badgeDot: React.CSSProperties = {
    position: 'absolute', top: -3, right: -3, minWidth: 17, height: 17, padding: '0 4px',
    borderRadius: 9, background: 'var(--accent)', color: 'var(--accent-ink)',
    fontSize: 10.5, fontWeight: 800, display: 'grid', placeItems: 'center',
    fontFamily: 'var(--font-mono)', border: '2px solid var(--bg-0)',
  };

  const iconBtn: React.CSSProperties = {
    display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: 8,
    background: 'transparent', border: '1px solid var(--line)', color: 'var(--ink)',
    textDecoration: 'none', position: 'relative', flexShrink: 0,
  };

  const mobileNavLinks = [
    { href: '/', label: 'Keşfet', icon: <Home size={19} /> },
    { href: '/blog', label: 'Blog', icon: <Newspaper size={19} /> },
    ...(user ? [
      { href: '/ilanlarim', label: 'İlanlarım', icon: <Tag size={19} /> },
      { href: '/favoriler', label: 'Favorilerim', icon: <Heart size={19} /> },
      { href: '/tekliflerim', label: 'Tekliflerim', icon: <ListPlus size={19} /> },
      { href: '/mesajlarim', label: 'Mesajlarım', icon: <MessageSquare size={19} /> },
      { href: '/fiyat-alarm', label: 'Fiyat Alarmları', icon: <BellPlus size={19} /> },
      { href: '/profilim', label: 'Profilim', icon: <User size={19} /> },
    ] : []),
  ];

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--line-soft)',
      }}>
        <div className="m-wrap" style={{ display: 'flex', alignItems: 'center', height: 'var(--header-h)', gap: 12 }}>
          <Logo />

          {/* Desktop arama */}
          <form onSubmit={handleSearch} className="desktop-search" style={{
            display: 'flex', alignItems: 'center',
            flex: 1, maxWidth: 520, height: 44,
            background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 10,
            padding: '0 10px 0 14px', gap: 8,
          }}>
            <Search size={17} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Kask, mont, egzoz ara…"
              style={{ flex: 1, background: 'none', border: 0, color: 'var(--ink)', fontSize: 14, outline: 'none' }}
            />
          </form>

          {/* Desktop nav */}
          <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {[
              { href: '/', label: 'Keşfet' },
              { href: '/blog', label: 'Blog' },
              ...(user ? [{ href: '/ilanlarim', label: 'İlanlarım' }] : []),
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                color: pathname === href ? 'var(--ink)' : 'var(--ink-3)',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                padding: '6px 2px', textDecoration: 'none', whiteSpace: 'nowrap',
                borderBottom: '2px solid ' + (pathname === href ? 'var(--accent)' : 'transparent'),
              }}>{label}</Link>
            ))}
          </nav>

          <div style={{ flex: 1 }} />

          {/* Desktop sağ */}
          <div className="desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
              style={{ ...iconBtn, cursor: 'pointer' }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <Link href="/bildirimler" style={iconBtn}>
                  <Bell size={19} />
                  {unreadCount > 0 && <span style={{ ...badgeDot, background: 'var(--accent-2)', color: 'var(--accent-2-ink)' }}>{unreadCount}</span>}
                </Link>
                <Link href="/mesajlarim" style={iconBtn}><MessageSquare size={19} /></Link>
                <Link href="/profilim" style={iconBtn}><User size={19} /></Link>
                <button onClick={() => { clearAuth(); router.push('/'); }} style={{ ...iconBtn, cursor: 'pointer' }}>
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link href="/giris" className="m-btn m-btn-ghost" style={{ height: 40, padding: '0 16px', fontSize: 14, textDecoration: 'none' }}>Giriş Yap</Link>
            )}
            <Link href="/ilan-ver" className="m-btn m-btn-primary" style={{ textDecoration: 'none', height: 42, padding: '0 18px', marginLeft: 4 }}>
              <Plus size={17} strokeWidth={2.5} />İlan Ver
            </Link>
          </div>

          {/* Mobil sağ */}
          <div className="mobile-actions" style={{ display: 'none', alignItems: 'center', gap: 6 }}>
            <button onClick={toggleTheme} style={{ ...iconBtn, cursor: 'pointer', border: 'none', background: 'none' }} aria-label="Tema">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setSearchOpen(v => !v)} style={{ ...iconBtn, cursor: 'pointer', border: 'none', background: 'none' }} aria-label="Ara">
              {searchOpen ? <X size={21} /> : <Search size={21} />}
            </button>
            {user && (
              <Link href="/bildirimler" style={iconBtn}>
                <Bell size={21} />
                {unreadCount > 0 && <span style={{ ...badgeDot, background: 'var(--accent-2)', color: 'var(--accent-2-ink)' }}>{unreadCount}</span>}
              </Link>
            )}
            <button onClick={() => setMenuOpen(v => !v)} style={{ ...iconBtn, cursor: 'pointer' }} aria-label="Menü">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobil arama genişletme */}
        {searchOpen && (
          <div style={{ borderTop: '1px solid var(--line-soft)', padding: '10px 16px', background: 'var(--header-bg)' }}>
            <form onSubmit={handleSearch} style={{
              display: 'flex', alignItems: 'center', height: 46,
              background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 10,
              padding: '0 10px 0 14px', gap: 8,
            }}>
              <Search size={17} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
              <input
                autoFocus
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Kask, mont, egzoz ara…"
                style={{ flex: 1, background: 'none', border: 0, color: 'var(--ink)', fontSize: 15, outline: 'none' }}
              />
              <button type="submit" className="m-btn m-btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 13, flexShrink: 0 }}>Ara</button>
            </form>
          </div>
        )}
      </header>

      {/* Mobil tam ekran menü */}
      {menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 49,
          background: 'var(--bg-0)',
          backdropFilter: 'blur(8px)',
          paddingTop: 'var(--header-h)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}>
          <nav style={{ padding: '8px 0', flex: 1 }}>
            {mobileNavLinks.map(({ href, label, icon }) => (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '15px 20px',
                color: pathname === href ? 'var(--accent)' : 'var(--ink-2)',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
                textDecoration: 'none',
                borderLeft: `3px solid ${pathname === href ? 'var(--accent)' : 'transparent'}`,
                background: pathname === href ? 'color-mix(in oklch, var(--accent) 8%, transparent)' : 'none',
              }}>
                <span style={{ color: pathname === href ? 'var(--accent)' : 'var(--ink-3)', flexShrink: 0 }}>{icon}</span>
                {label}
              </Link>
            ))}
          </nav>

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--line-soft)' }}>
            <Link href="/ilan-ver" className="m-btn m-btn-primary" style={{ textDecoration: 'none', height: 52, fontSize: 16, borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              <Plus size={20} strokeWidth={2.5} />İlan Ver
            </Link>
            {user ? (
              <button onClick={() => { clearAuth(); setMenuOpen(false); router.push('/'); }} className="m-btn m-btn-ghost" style={{ height: 48, fontSize: 15, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, width: '100%' }}>
                <LogOut size={18} />Çıkış Yap
              </button>
            ) : (
              <Link href="/giris" className="m-btn m-btn-ghost" style={{ textDecoration: 'none', height: 48, fontSize: 15, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-search, .desktop-nav, .desktop-actions { display: none !important; }
          .mobile-actions { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-actions { display: none !important; }
        }
      `}</style>
    </>
  );
}
