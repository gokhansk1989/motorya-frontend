'use client';
import { Suspense, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { Search, Flame, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { id: 'kask', label: 'Kask', slug: 'kask', icon: '🪖', count: 312 },
  { id: 'mont', label: 'Mont & Koruma', slug: 'mont', icon: '🧥', count: 241 },
  { id: 'eldiven', label: 'Eldiven', slug: 'eldiven', icon: '🧤', count: 198 },
  { id: 'bot', label: 'Bot', slug: 'bot', icon: '👢', count: 153 },
  { id: 'koruyucu', label: 'Koruyucu', slug: 'koruyucu', icon: '🛡️', count: 117 },
  { id: 'egzoz', label: 'Egzoz', slug: 'egzoz', icon: '🔧', count: 94 },
  { id: 'aksesuar', label: 'Aksesuar', slug: 'aksesuar', icon: '⚙️', count: 208 },
];

const SORT_OPTIONS = [
  { value: 'recommend', label: 'Önerilen' },
  { value: 'newest', label: 'En yeni' },
  { value: 'price_asc', label: 'Fiyat ↑' },
  { value: 'price_desc', label: 'Fiyat ↓' },
];

const TREND_TAGS = ['AGV K6', 'Akrapovic', 'Alpinestars', 'Dainese', 'Brembo', 'Shoei'];

function HeroSection({ onSearch }: { onSearch: (q: string) => void }) {
  const [val, setVal] = useState('');
  return (
    <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line-soft)' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background:
        'radial-gradient(80% 120% at 12% -10%, color-mix(in oklch, var(--accent) 22%, transparent), transparent 55%),' +
        'radial-gradient(70% 100% at 100% 110%, color-mix(in oklch, var(--accent-2) 18%, transparent), transparent 55%)',
        zIndex: 0 }} />
      <div className="m-wrap" style={{ position: 'relative', zIndex: 1, paddingTop: 'clamp(28px, 6vw, 54px)', paddingBottom: 'clamp(24px, 4vw, 46px)' }}>
        <div style={{ maxWidth: 620 }} className="m-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span className="m-badge new" style={{ display: 'inline-flex', gap: 5 }}>
              <Flame size={12} fill="currentColor" strokeWidth={0} />
              HAFTANIN FIRSATLARI
            </span>
            <span className="m-kicker">1.300+ aktif ilan · 7 kategori</span>
          </div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', margin: 0 }}>
            Garajındaki ekipman,<br />birinin{' '}
            <span className="m-accent">bir sonraki</span> yolculuğu.
          </h1>
          <p style={{ fontSize: 'clamp(14px, 3vw, 17px)', maxWidth: 480, marginTop: 18, lineHeight: 1.55, color: 'var(--ink-2)' }}>
            İkinci el kask, mont, egzoz ve parça al-sat. Güvenli ödeme, kargo takibi
            ya da güvenli buluşma noktasında yüz yüze.
          </p>

          <form onSubmit={e => { e.preventDefault(); onSearch(val); }} style={{ marginTop: 28, maxWidth: 540, display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', flex: 1, height: 54, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 11, padding: '0 8px 0 16px', gap: 8, alignItems: 'center' }}>
              <Search size={20} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
              <input
                value={val}
                onChange={e => setVal(e.target.value)}
                placeholder="Ne arıyorsun?"
                style={{ flex: 1, background: 'none', border: 0, color: 'var(--ink)', fontSize: 15, outline: 'none', minWidth: 0 }}
              />
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
      </div>
    </section>
  );
}

function CategoryStrip({ active, setActive }: { active: string; setActive: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
      {CATEGORIES.map(c => {
        const on = active === c.id;
        return (
          <button
            key={c.id}
            onClick={() => setActive(on ? '' : c.id)}
            style={{
              flex: '1 0 0', minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              gap: 10, padding: '14px 16px',
              background: on ? 'var(--bg-2)' : 'var(--bg-1)',
              border: '1px solid ' + (on ? 'var(--accent)' : 'var(--line-soft)'),
              borderRadius: 14, cursor: 'pointer', transition: 'all .15s ease',
            }}
          >
            <span style={{
              width: 40, height: 40, borderRadius: 10, display: 'grid', placeItems: 'center',
              background: on ? 'var(--accent)' : 'var(--bg-3)',
              fontSize: 20,
            }}>
              {c.icon}
            </span>
            <div style={{ textAlign: 'left' }}>
              <div className="m-display" style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
              <div className="m-kicker" style={{ marginTop: 3, fontSize: 10 }}>{c.count} ilan</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(160px, 40vw, 220px), 1fr))', gap: 'clamp(10px, 2vw, 18px)' }}>
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

function HomeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const q = params.get('q') || params.get('search') || undefined;

  const { data, isLoading } = useListings({
    search: q,
    categoryId: category || undefined,
    sort: sort === 'recommend' ? 'newest' : sort as any,
    page,
    limit: 24,
  });

  const handleSearch = (val: string) => {
    router.push(`/ara?q=${encodeURIComponent(val)}`);
  };

  return (
    <div>
      <HeroSection onSearch={handleSearch} />
      <div className="m-wrap" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <CategoryStrip active={category} setActive={id => { setCategory(id); setPage(1); }} />

        <div style={{ height: 28 }} />

        {/* Sort bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 className="m-display" style={{ fontSize: 22, margin: 0 }}>Keşfet</h2>
            {data && (
              <span className="m-badge" style={{ background: 'var(--bg-2)', color: 'var(--ink-2)' }}>
                {data.meta?.total ?? data.items?.length} ilan
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
            {SORT_OPTIONS.map(s => (
              <button
                key={s.value}
                className={'m-chip' + (sort === s.value ? ' active' : '')}
                onClick={() => setSort(s.value)}
                style={{ height: 36 }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 20 }} />

        {isLoading ? (
          <SkeletonGrid />
        ) : data?.items?.length ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(155px, 42vw, 240px), 1fr))', gap: 'clamp(10px, 2vw, 18px)' }}>
              {data.items.map((l: any) => <ListingCard key={l.id} listing={l} />)}
            </div>
            {(data.meta?.totalPages ?? 1) > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                <button
                  className="m-btn m-btn-ghost sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Önceki
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 14, color: 'var(--ink-2)' }}>
                  {page} / {data.meta.totalPages}
                </span>
                <button
                  className="m-btn m-btn-ghost sm"
                  disabled={page === data.meta?.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '96px 0', color: 'var(--ink-3)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏍️</div>
            <p className="m-display" style={{ fontSize: 20, color: 'var(--ink-2)', margin: '0 0 8px' }}>Uygun ilan bulunamadı</p>
            <p style={{ fontSize: 14 }}>Farklı bir kategori veya arama terimi dene</p>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(155px, 42vw, 240px), 1fr))', gap: 'clamp(10px, 2vw, 18px)' }}>
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
