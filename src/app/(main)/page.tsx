'use client';
import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { AdSlot } from '@/components/ui/AdSlot';
import { api } from '@/lib/api';
import { Search, Flame, ChevronRight, Bell } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { CategoryIcon } from '@/components/icons/CategoryIcons';

const SORT_OPTIONS = [
  { value: 'newest', label: 'En yeni' },
  { value: 'price_asc', label: 'Fiyat ↑' },
  { value: 'price_desc', label: 'Fiyat ↓' },
];

const TREND_TAGS = ['AGV K6', 'Akrapovic', 'Alpinestars', 'Dainese', 'Shoei', 'Rev\'it'];

interface Category { id: string; name: string; slug: string; parentId: string | null; }

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
            <span className="m-kicker">Türkiye'nin motosiklet ekipman pazarı</span>
          </div>
          <h1 className="m-display" style={{ fontSize: 'clamp(36px, 5vw, 60px)', margin: 0 }}>
            Garajındaki ekipman,<br />birinin{' '}
            <span className="m-accent">bir sonraki</span> yolculuğu.
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
                <CategoryIcon slug={c.slug} size={36} alt={c.name} />
                <span style={{ fontSize: 12, fontWeight: 600, color: active ? 'var(--accent)' : 'var(--ink-2)', textAlign: 'center', lineHeight: 1.2 }}>{c.name}</span>
              </button>
              <Link href={`/kategori/${c.slug}`}
                style={{ position: 'absolute', bottom: 4, right: 6, fontSize: 10, color: 'var(--ink-3)', textDecoration: 'none' }}>
                →
              </Link>
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

function FiyatAlarmBanner() {
  const { user } = useAuthStore();
  return (
    <Link href="/fiyat-alarm" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'color-mix(in oklch, var(--accent) 10%, var(--bg-1))', border: '1px solid color-mix(in oklch, var(--accent) 25%, var(--line-soft))', borderRadius: 14, cursor: 'pointer' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'color-mix(in oklch, var(--accent) 18%, var(--bg-2))', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Bell size={18} style={{ color: 'var(--accent)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: 'var(--ink)' }}>Fiyat Alarmları</p>
          <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, marginTop: 2 }}>
            {user ? 'Kayıtlı aramalarını yönet' : 'Kriterlere uyan ilan çıkınca haber al'}
          </p>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
      </div>
    </Link>
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

        <div style={{ height: 16 }} />
        <FiyatAlarmBanner />
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
                  {l1Categories.find(c => c.slug === categorySlug)?.name} ilanlarının tümünü gör →
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
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏍️</div>
            <p className="m-display" style={{ fontSize: 20, color: 'var(--ink-2)', margin: '0 0 8px' }}>Uygun ilan bulunamadı</p>
            <p style={{ fontSize: 14 }}>Farklı bir kategori dene</p>
          </div>
        )}

        {/* Hızlı kategori linkleri — SEO iç linkleme */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--line-soft)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 16 }}>Kategorileri Keşfet</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {l1Categories.map(c => (
              <Link key={c.slug} href={`/kategori/${c.slug}`} className="m-chip"
                style={{ height: 34, fontSize: 13, textDecoration: 'none' }}>
                <CategoryIcon slug={c.slug} size={16} alt={c.name} /> {c.name}
              </Link>
            ))}
          </div>
        </div>
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
