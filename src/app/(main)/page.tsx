'use client';
import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { useListings, usePriceDrops } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { api } from '@/lib/api';
import { Search, ChevronRight, ChevronDown, Star, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { CategoryIcon } from '@/components/icons/CategoryIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { matchCategories, CategorySuggestionsDropdown } from '@/components/ui/CategorySuggestions';

interface Category { id: string; name: string; slug: string; parentId: string | null; }

function PriceDropPanel() {
  const { data } = usePriceDrops(10);
  const items = data ?? [];
  if (items.length === 0) return null;

  return (
    <div
      className="m-hide-mobile"
      style={{ width: 280, flexShrink: 0 }}
    >
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-soft)', borderRadius: 16, padding: '14px 14px 4px', height: 360, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12, flexShrink: 0 }}>
          <TrendingDown size={15} style={{ color: 'var(--bad)' }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>Fiyatı Düştü</span>
        </div>
        <div className="m-marquee-wrap" style={{ flex: 1, maskImage: 'linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)' }}>
          <div className="m-marquee-track-v" style={{ '--marquee-duration': `${items.length * 4}s` } as React.CSSProperties}>
            {[...items, ...items].map((l: any, i: number) => {
              const discount = Math.round((1 - Number(l.price) / Number(l.originalPrice)) * 100);
              return (
                <Link key={`${l.id}-${i}`} href={`/ilan/${l.slug ?? l.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '6px 4px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-2)', overflow: 'hidden', flexShrink: 0 }}>
                    {l.images?.[0] && <img src={l.images[0].url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, color: 'var(--ink-2)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</p>
                    <p style={{ fontSize: 11.5, margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ color: 'var(--ink-3)', textDecoration: 'line-through' }}>{Number(l.originalPrice).toLocaleString('tr-TR')}₺</span>
                      <span style={{ color: 'var(--bad)', fontWeight: 700 }}>{Number(l.price).toLocaleString('tr-TR')}₺</span>
                    </p>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--bad)', flexShrink: 0 }}>%{discount}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection({ onSearch, categories }: { onSearch: (q: string) => void; categories: Category[] }) {
  const [val, setVal] = useState('');
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const matches = matchCategories(categories, val);

  const handleFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setFocused(true);
  };
  const handleBlur = () => {
    blurTimer.current = setTimeout(() => setFocused(false), 120);
  };

  return (
    <section style={{ position: 'relative', borderBottom: '1px solid var(--line-soft)' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background:
        'radial-gradient(80% 120% at 12% -10%, color-mix(in oklch, var(--accent) 22%, transparent), transparent 55%),' +
        'radial-gradient(70% 100% at 100% 110%, color-mix(in oklch, var(--accent-2) 18%, transparent), transparent 55%)',
        zIndex: 0 }} />
      <div className="m-wrap" style={{ position: 'relative', zIndex: 1, paddingTop: 'clamp(28px, 6vw, 54px)', paddingBottom: 'clamp(24px, 4vw, 46px)', display: 'flex', gap: 32, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ maxWidth: 620, flex: 1 }} className="m-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span className="m-kicker">Türkiye'nin motosiklet ekipman pazarı</span>
          </div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', margin: 0 }}>
            Garajındaki ekipman,<br /><span className="m-accent">başkasının</span> sıradaki yolculuğu.
          </h1>
          <p style={{ fontSize: 'clamp(14px, 3vw, 17px)', maxWidth: 480, marginTop: 18, lineHeight: 1.55, color: 'var(--ink-2)' }}>
            İkinci el kask, mont, egzoz ve parça al-sat. Güvenli ödeme, kargo takibi
            ya da güvenli buluşma noktasında yüz yüze.
          </p>
          <form onSubmit={e => { e.preventDefault(); onSearch(val); }} style={{ marginTop: 28, maxWidth: 540 }}>
            <div ref={searchBoxRef} style={{ display: 'flex', flex: 1, height: 54, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 11, padding: '0 8px 0 16px', gap: 8, alignItems: 'center' }}>
              <Search size={20} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
              <input value={val} onChange={e => setVal(e.target.value)} onFocus={handleFocus} onBlur={handleBlur} placeholder="Ne arıyorsun?"
                style={{ flex: 1, background: 'none', border: 0, color: 'var(--ink)', fontSize: 15, outline: 'none', minWidth: 0 }} />
              <button type="submit" className="m-btn m-btn-primary" style={{ height: 38, padding: '0 14px', fontSize: 14, flexShrink: 0 }}>Ara</button>
            </div>
            {focused && <CategorySuggestionsDropdown query={val} matches={matches} anchorRef={searchBoxRef} onSearchQuery={onSearch} />}
          </form>
        </div>
        <PriceDropPanel />
      </div>
    </section>
  );
}

function PriceDropMobileStrip() {
  const { data } = usePriceDrops(10);
  const items = data ?? [];
  if (items.length === 0) return null;

  return (
    <div className="m-pricedrop-mobile">
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <TrendingDown size={15} style={{ color: 'var(--bad)' }} />
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>Fiyatı Düştü</span>
      </div>
      <div className="m-pricedrop-mobile-track">
        {items.map((l: any) => {
          const discount = Math.round((1 - Number(l.price) / Number(l.originalPrice)) * 100);
          return (
            <Link key={l.id} href={`/ilan/${l.slug ?? l.id}`} className="m-pricedrop-mobile-card">
              <div className="m-pricedrop-mobile-img">
                {l.images?.[0] && <img src={l.images[0].url} alt="" />}
                <span className="m-pricedrop-mobile-badge">%{discount}</span>
              </div>
              <p className="m-pricedrop-mobile-title">{l.title}</p>
              <p className="m-pricedrop-mobile-price">
                <span className="old">{Number(l.originalPrice).toLocaleString('tr-TR')}₺</span>
                <span className="new">{Number(l.price).toLocaleString('tr-TR')}₺</span>
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function CategoryGrid({ categories, allCategories, activeSlug, onSelect }: {
  categories: Category[]; allCategories: Category[]; activeSlug: string; onSelect: (slug: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const scheduleExpand = (id: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setExpandedId(id), 200);
  };
  const scheduleCollapse = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setExpandedId(null), 200);
  };
  const cancelPending = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  if (!categories.length) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 className="m-display" style={{ fontSize: 18, margin: 0 }}>Kategoriler</h2>
        <Link href="/ara" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          Tümü <ChevronRight size={14} />
        </Link>
      </div>
      <div className="m-category-grid-wrap">
      <div className="m-category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
        {categories.map((c, i) => {
          const active = activeSlug === c.slug;
          const children = allCategories.filter(ch => ch.parentId === c.id);
          const hasChildren = children.length > 0;
          const alignRight = i % 7 >= 4;
          return (
            <div
              key={c.id}
              style={{
                position: 'relative', borderRadius: 14,
                background: active ? 'color-mix(in oklch, var(--accent) 12%, var(--bg-1))' : 'var(--bg-1)',
                border: '1px solid ' + (active ? 'var(--accent)' : 'var(--line-soft)'),
                transition: 'all .15s ease',
              }}
              onMouseEnter={() => hasChildren ? scheduleExpand(c.id) : cancelPending()}
              onMouseLeave={scheduleCollapse}
            >
              <button onClick={() => onSelect(active ? '' : c.slug)}
                className="m-cat-select-btn"
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '14px 10px', background: 'transparent', border: 0, cursor: 'pointer' }}>
                <CategoryIcon slug={c.slug} size={52} alt={c.name} />
                <span style={{
                  fontSize: 12, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--ink-2)',
                  textAlign: 'center', lineHeight: 1.2, height: 'calc(1.2em * 2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{c.name}</span>
              </button>
              {hasChildren && (
                <button
                  className="m-subcat-toggle"
                  onClick={(e) => { e.stopPropagation(); cancelPending(); setExpandedId(prev => (prev === c.id ? null : c.id)); }}
                  aria-label="Alt kategorileri göster"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    padding: '6px 4px', background: 'var(--bg-2)', border: 0, borderTop: '1px solid var(--line-soft)',
                    borderRadius: '0 0 13px 13px',
                    color: 'var(--ink-3)', cursor: 'pointer', fontSize: 10.5, fontWeight: 600,
                  }}
                >
                  <ChevronDown size={11} style={{ transform: expandedId === c.id ? 'rotate(180deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }} />
                  <span className="m-subcat-toggle-label">Alt kategoriler</span>
                </button>
              )}
              <AnimatePresence>
                {expandedId === c.id && hasChildren && (
                  <>
                    <motion.div
                      key="backdrop"
                      className="m-subcat-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => { cancelPending(); setExpandedId(null); }}
                      style={{ position: 'fixed', inset: 0, zIndex: 25, background: 'transparent' }}
                    />
                    <motion.div
                      key="panel"
                      className="m-subcat-panel"
                      initial={isMobile ? { opacity: 0, y: 80 } : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={isMobile ? { opacity: 0, y: 80 } : { opacity: 0, y: -6 }}
                      transition={isMobile ? { duration: 0.28, ease: [0.32, 0.72, 0, 1] } : { duration: 0.15, ease: 'easeOut' }}
                      onMouseEnter={cancelPending}
                      onMouseLeave={scheduleCollapse}
                      style={{
                        position: 'absolute', top: 'calc(100% + 8px)', [alignRight ? 'right' : 'left']: 0,
                        zIndex: 30, minWidth: 220, maxWidth: 320,
                      }}
                    >
                      <div className="m-subcat-panel-inner" style={{ background: 'var(--bg-1)', border: '1px solid var(--line-soft)', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.18)' }}>
                        {children.map(ch => (
                          <button
                            key={ch.id}
                            onClick={() => { cancelPending(); onSelect(ch.slug); setExpandedId(null); }}
                            style={{
                              textAlign: 'left', padding: '7px 10px', borderRadius: 8, border: 0, background: 'transparent',
                              color: 'var(--ink-2)', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-2)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            {ch.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

function FeaturedSection() {
  const { data } = useListings({ isFeatured: true, limit: 12, sort: 'newest' });
  const items = data?.items ?? [];
  const [touchPaused, setTouchPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setTouchPaused(true);
  };
  const handleTouchEnd = () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setTouchPaused(false), 1500);
  };

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}
      >
        <motion.span
          initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'backOut', delay: 0.1 }}
          style={{ display: 'flex' }}
        >
          <Star size={18} fill="var(--accent)" strokeWidth={0} style={{ color: 'var(--accent)' }} />
        </motion.span>
        <h2 className="m-display" style={{ fontSize: 18, margin: 0 }}>Öne Çıkan İlanlar</h2>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="m-marquee-wrap"
        style={{ paddingTop: 10, paddingBottom: 10, margin: '-10px 0' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div
          className="m-marquee-track"
          style={{ '--marquee-duration': `${items.length * 6}s`, animationPlayState: touchPaused ? 'paused' : undefined } as React.CSSProperties}
        >
          {[...items, ...items].map((l: any, i: number) => (
            <motion.div
              key={`${l.id}-${i}`}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.97 }}
              style={{ width: 220, minWidth: 220, maxWidth: 220, flexShrink: 0 }}
            >
              <ListingCard listing={l} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function HomeContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const handleRefresh = useCallback(() => queryClient.refetchQueries({ type: 'active' }), [queryClient]);

  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/listings/meta/categories').then(r => r.data),
  });

  const l1Categories = allCategories.filter(c => !c.parentId);

  const handleSearch = (val: string) => router.push(`/ara?q=${encodeURIComponent(val)}`);

  // Kategori seçildiğinde anasayfada filtrelemek yerine direkt kategori sayfasına gidiyoruz —
  // anasayfa artık sadece öne çıkanlar + kategori vitrini, ağır ilan listesi/sayfalama taşımıyor.
  const handleSelect = (slug: string) => {
    if (slug) router.push(`/kategori/${slug}`);
  };

  return (
    <div>
      <PullToRefresh onRefresh={handleRefresh} />
      <HeroSection onSearch={handleSearch} categories={allCategories} />
      <div className="m-wrap" style={{ paddingTop: 32, paddingBottom: 48 }}>

        <PriceDropMobileStrip />

        <FeaturedSection />

        <div style={{ height: 28 }} />

        {/* Kategori grid */}
        <CategoryGrid categories={l1Categories} allCategories={allCategories} activeSlug="" onSelect={handleSelect} />

      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="m-wrap" style={{ paddingTop: 48 }}>
        <div className="m-listing-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="m-card" style={{ opacity: 0.4 }}>
              <div className="m-card-media" style={{ background: 'var(--bg-2)' }} />
              <div className="m-card-body">
                <div style={{ height: 12, background: 'var(--bg-3)', borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 10, background: 'var(--bg-3)', borderRadius: 6, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
