'use client';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useListings, usePriceDrops } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { AdSlot } from '@/components/ui/AdSlot';
import { api } from '@/lib/api';
import { Search, Flame, ChevronRight, Star, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { CategoryIcon } from '@/components/icons/CategoryIcons';
import { motion } from 'framer-motion';

const SORT_OPTIONS = [
  { value: 'newest', label: 'En yeni' },
  { value: 'price_asc', label: 'Fiyat ↑' },
  { value: 'price_desc', label: 'Fiyat ↓' },
];

const TREND_TAGS = ['AGV K6', 'Akrapovic', 'Alpinestars', 'Dainese', 'Shoei', 'Rev\'it'];

interface Category { id: string; name: string; slug: string; parentId: string | null; }

function PriceDropPanel() {
  const { data } = usePriceDrops(10);
  const items = data ?? [];
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
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
    </motion.div>
  );
}

function HeroSection({ onSearch }: { onSearch: (q: string) => void }) {
  const [val, setVal] = useState('');
  return (
    <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line-soft)' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background:
        'radial-gradient(80% 120% at 12% -10%, color-mix(in oklch, var(--accent) 22%, transparent), transparent 55%),' +
        'radial-gradient(70% 100% at 100% 110%, color-mix(in oklch, var(--accent-2) 18%, transparent), transparent 55%)',
        zIndex: 0 }} />
      <div className="m-wrap" style={{ position: 'relative', zIndex: 1, paddingTop: 'clamp(28px, 6vw, 54px)', paddingBottom: 'clamp(24px, 4vw, 46px)', display: 'flex', gap: 32, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ maxWidth: 620, flex: 1 }} className="m-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span className="m-badge new" style={{ display: 'inline-flex', gap: 5 }}>
              <Flame size={12} fill="currentColor" strokeWidth={0} />
              HAFTANIN FIRSATLARI
            </span>
            <span className="m-kicker">Türkiye'nin motosiklet ekipman pazarı</span>
          </div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', margin: 0 }}>
            Garajındaki ekipman,<br /><span className="m-accent">başkasının</span> sıradaki yolculuğu.
          </h1>
          <p style={{ fontSize: 'clamp(14px, 3vw, 17px)', maxWidth: 480, marginTop: 18, lineHeight: 1.55, color: 'var(--ink-2)' }}>
            İkinci el kask, mont, egzoz ve parça al-sat. Güvenli ödeme, kargo takibi
            ya da güvenli buluşma noktasında yüz yüze.
          </p>
          <form onSubmit={e => { e.preventDefault(); onSearch(val); }}
            style={{ marginTop: 28, maxWidth: 540, display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', flex: 1, height: 54, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 11, padding: '0 8px 0 16px', gap: 8, alignItems: 'center' }}>
              <Search size={20} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
              <input value={val} onChange={e => setVal(e.target.value)} placeholder="Ne arıyorsun?"
                style={{ flex: 1, background: 'none', border: 0, color: 'var(--ink)', fontSize: 15, outline: 'none', minWidth: 0 }} />
              <button type="submit" className="m-btn m-btn-primary" style={{ height: 38, padding: '0 14px', fontSize: 14, flexShrink: 0 }}>Ara</button>
            </div>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            <span className="m-kicker" style={{ marginRight: 4 }}>Trend:</span>
            {TREND_TAGS.map(t => (
              <button key={t} onClick={() => onSearch(t)} className="m-chip" style={{ height: 30, fontSize: 12.5 }}>{t}</button>
            ))}
          </div>
        </div>
        <PriceDropPanel />
      </div>
    </section>
  );
}

function CategoryGrid({ categories, activeSlug, onSelect }: {
  categories: Category[]; activeSlug: string; onSelect: (slug: string) => void;
}) {
  if (!categories.length) return null;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 className="m-display" style={{ fontSize: 18, margin: 0 }}>Kategoriler</h2>
        <Link href="/ara" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          Tümü <ChevronRight size={14} />
        </Link>
      </div>
      <div className="m-category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
        {categories.map(c => {
          const active = activeSlug === c.slug;
          return (
            <div key={c.id} style={{ position: 'relative' }}>
              <button onClick={() => onSelect(active ? '' : c.slug)}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '14px 10px', background: active ? 'color-mix(in oklch, var(--accent) 12%, var(--bg-1))' : 'var(--bg-1)',
                  border: '1px solid ' + (active ? 'var(--accent)' : 'var(--line-soft)'),
                  borderRadius: 14, cursor: 'pointer', transition: 'all .15s ease' }}>
                <CategoryIcon slug={c.slug} size={52} alt={c.name} />
                <span style={{ fontSize: 12, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--ink-2)', textAlign: 'center', lineHeight: 1.2 }}>{c.name}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="m-listing-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="m-card" style={{ opacity: 0.5 }}>
          <div className="m-card-media" style={{ background: 'var(--bg-2)' }} />
          <div className="m-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ height: 12, background: 'var(--bg-3)', borderRadius: 6, width: '70%' }} />
            <div style={{ height: 10, background: 'var(--bg-3)', borderRadius: 6, width: '45%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function FeaturedSection() {
  const { data } = useListings({ isFeatured: true, limit: 12, sort: 'newest' });
  const items = data?.items ?? [];
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
      >
        <div className="m-marquee-track" style={{ '--marquee-duration': `${items.length * 6}s` } as React.CSSProperties}>
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
  const [categorySlug, setCategorySlug] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/listings/meta/categories').then(r => r.data),
  });

  const l1Categories = allCategories.filter(c => !c.parentId);

  const { data, isLoading } = useListings({
    categorySlug: categorySlug || undefined,
    sort: sort as any,
    page,
    limit: 24,
  });

  const handleSearch = (val: string) => router.push(`/ara?q=${encodeURIComponent(val)}`);

  const handleSelect = (slug: string) => { setCategorySlug(slug); setPage(1); };

  return (
    <div>
      <HeroSection onSearch={handleSearch} />
      <div className="m-wrap" style={{ paddingTop: 32, paddingBottom: 48 }}>

        {/* Kategori grid */}
        <CategoryGrid categories={l1Categories} activeSlug={categorySlug} onSelect={handleSelect} />

        <div style={{ height: 28 }} />
        <FeaturedSection />

        <div style={{ height: 24 }} />

        {/* Listeleme başlığı + sıralama */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 className="m-display" style={{ fontSize: 22, margin: 0 }}>
              {categorySlug
                ? (l1Categories.find(c => c.slug === categorySlug)?.name ?? 'İlanlar')
                : 'Tüm İlanlar'}
            </h2>
            {data && (
              <span className="m-badge" style={{ background: 'var(--bg-2)', color: 'var(--ink-2)' }}>
                {(data.meta?.total ?? data.items?.length ?? 0).toLocaleString('tr-TR')} ilan
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {SORT_OPTIONS.map(s => (
              <button key={s.value} className={'m-chip' + (sort === s.value ? ' active' : '')}
                onClick={() => { setSort(s.value); setPage(1); }} style={{ height: 36 }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <SkeletonGrid />
        ) : data?.items?.length ? (
          <>
            <div className="m-listing-grid">
              {data.items.map((l: any, i: number) => (
                <>
                  <ListingCard key={l.id} listing={l} />
                  {(i + 1) % 8 === 0 && (
                    <div key={`ad-${i}`} style={{ gridColumn: '1/-1' }}>
                      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LISTING ?? ''} format="auto" />
                    </div>
                  )}
                </>
              ))}
            </div>

            {/* Kategori sayfasına git */}
            {categorySlug && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Link href={`/kategori/${categorySlug}`} className="m-btn"
                  style={{ textDecoration: 'none', display: 'inline-flex' }}>
                  {l1Categories.find(c => c.slug === categorySlug)?.name} ilanlarının tümünü gör
                </Link>
              </div>
            )}

            {(data.meta?.totalPages ?? 1) > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                <button className="m-btn m-btn-ghost sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Önceki</button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 14, color: 'var(--ink-2)' }}>
                  {page} / {data.meta.totalPages}
                </span>
                <button className="m-btn m-btn-ghost sm" disabled={page === data.meta?.totalPages} onClick={() => setPage(p => p + 1)}>Sonraki</button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '96px 0', color: 'var(--ink-3)' }}>
            <img src="/icons/no-results.png" alt="" width={120} height={120} style={{ objectFit: 'contain', marginBottom: 16, opacity: 0.85, display: 'block', margin: '0 auto 16px' }} />
            <p className="m-display" style={{ fontSize: 20, color: 'var(--ink-2)', margin: '0 0 8px' }}>Uygun ilan bulunamadı</p>
            <p style={{ fontSize: 14 }}>Farklı bir kategori dene</p>
          </div>
        )}

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
