'use client';
import { Suspense, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearch } from '@/hooks/useSearch';
import { useCreateSavedSearch } from '@/hooks/useSavedSearches';
import { ListingCard } from '@/components/listings/ListingCard';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Search, SlidersHorizontal, X, BellPlus } from 'lucide-react';
import { AdSlot } from '@/components/ui/AdSlot';
import toast from 'react-hot-toast';

const CONDITIONS = [
  { value: '', label: 'Tümü' },
  { value: 'NEW', label: 'Sıfır' },
  { value: 'LIKE_NEW', label: 'Sıfır gibi' },
  { value: 'GOOD', label: 'İyi' },
  { value: 'FAIR', label: 'Makul' },
];

const GENDERS = [
  { value: '', label: 'Tümü' },
  { value: 'ERKEK', label: 'Erkek' },
  { value: 'KADIN', label: 'Kadın' },
  { value: 'UNISEX', label: 'Unisex' },
  { value: 'COCUK', label: 'Çocuk' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'En yeni' },
  { value: 'price_asc', label: 'Fiyat (düşük→yüksek)' },
  { value: 'price_desc', label: 'Fiyat (yüksek→düşük)' },
  { value: 'oldest', label: 'En eski' },
];

function FilterFields({
  categories,
  brands,
  categoryId,
  brandId,
  condition,
  gender,
  priceFrom,
  priceTo,
  setPriceFrom,
  setPriceTo,
  push,
  router,
  q,
  selectedL1Id,
}: {
  categories: any[];
  brands: any[];
  categoryId: string;
  brandId: string;
  condition: string;
  gender: string;
  priceFrom: string;
  priceTo: string;
  setPriceFrom: (v: string) => void;
  setPriceTo: (v: string) => void;
  push: (overrides: Record<string, string | number | undefined>) => void;
  router: any;
  q: string;
  selectedL1Id: (cats: any[]) => string;
}) {
  const l1id = selectedL1Id(categories);
  const l2cats = categories.filter((c: any) => c.parentId === l1id);
  const l2val = categoryId && categories.find((c: any) => c.id === categoryId)?.parentId ? categoryId : '';

  return (
    <>
      {/* Ana Kategori */}
      <div>
        <label className="m-label">Ana Kategori</label>
        <select
          value={l1id}
          onChange={e => push({ categoryId: e.target.value, page: 1 })}
          className="m-field"
          style={{ height: 38 }}
        >
          <option value="">Tümü</option>
          {categories.filter((c: any) => !c.parentId).map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Alt Kategori */}
      <div style={{ opacity: l1id ? 1 : 0.4, transition: 'opacity .15s' }}>
        <label className="m-label">Alt Kategori</label>
        <select
          value={l2val}
          onChange={e => push({ categoryId: e.target.value || l1id, page: 1 })}
          disabled={!l1id}
          className="m-field"
          style={{ height: 38, cursor: l1id ? 'pointer' : 'not-allowed' }}
        >
          <option value="">{l1id ? 'Tümü' : '—'}</option>
          {l2cats.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Marka */}
      <div>
        <label className="m-label">Marka</label>
        <select
          value={brandId}
          onChange={e => push({ brandId: e.target.value, page: 1 })}
          className="m-field"
          style={{ height: 38 }}
        >
          <option value="">Tümü</option>
          {brands.map((b: any) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Durum */}
      <div>
        <label className="m-label">Durum</label>
        <select
          value={condition}
          onChange={e => push({ condition: e.target.value, page: 1 })}
          className="m-field"
          style={{ height: 38 }}
        >
          {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Cinsiyet */}
      <div>
        <label className="m-label">Cinsiyet</label>
        <select
          value={gender}
          onChange={e => push({ gender: e.target.value, page: 1 })}
          className="m-field"
          style={{ height: 38 }}
        >
          {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>

      {/* Fiyat hızlı seçim chipleri */}
      <div style={{ gridColumn: '1 / -1' }}>
        <label className="m-label">Fiyat Aralığı</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {([
            { label: '0–500 ₺',      min: 0,    max: 500 },
            { label: '500–2.000 ₺',  min: 500,  max: 2000 },
            { label: '2.000–5.000 ₺',min: 2000, max: 5000 },
            { label: '5.000 ₺+',     min: 5000, max: undefined },
          ] as const).map(chip => {
            const pf = Number(priceFrom);
            const pt = priceTo ? Number(priceTo) : undefined;
            const active = pf === chip.min && pt === chip.max;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  const newFrom = chip.min > 0 ? chip.min.toString() : '';
                  const newTo   = chip.max?.toString() ?? '';
                  setPriceFrom(newFrom);
                  setPriceTo(newTo);
                  push({ minPrice: chip.min || undefined, maxPrice: chip.max, page: 1 });
                }}
                className={'m-chip' + (active ? ' active' : '')}
                style={{ height: 30, fontSize: 12 }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Min Fiyat */}
      <div>
        <label className="m-label">Min Fiyat (₺)</label>
        <input
          type="number"
          value={priceFrom}
          onChange={e => setPriceFrom(e.target.value)}
          onBlur={() => push({ minPrice: priceFrom ? Number(priceFrom) : undefined, page: 1 })}
          placeholder="0"
          className="m-field"
          style={{ height: 38 }}
        />
      </div>

      {/* Max Fiyat */}
      <div>
        <label className="m-label">Max Fiyat (₺)</label>
        <input
          type="number"
          value={priceTo}
          onChange={e => setPriceTo(e.target.value)}
          onBlur={() => push({ maxPrice: priceTo ? Number(priceTo) : undefined, page: 1 })}
          placeholder="—"
          className="m-field"
          style={{ height: 38 }}
        />
      </div>
    </>
  );
}

function SearchPageInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user } = useAuthStore();
  const createSavedSearch = useCreateSavedSearch();

  const q = sp.get('q') ?? '';
  const categoryId = sp.get('categoryId') ?? '';
  const brandId = sp.get('brandId') ?? '';
  const condition = sp.get('condition') ?? '';
  const gender = sp.get('gender') ?? '';
  const city = sp.get('city') ?? '';
  const minPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined;
  const maxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined;
  const sort = sp.get('sort') ?? 'newest';
  const page = Number(sp.get('page') ?? 1);

  const [inputVal, setInputVal] = useState(q);
  const [priceFrom, setPriceFrom] = useState(minPrice?.toString() ?? '');
  const [priceTo, setPriceTo] = useState(maxPrice?.toString() ?? '');
  const [showFilters, setShowFilters] = useState(false);

  const selectedL1Id = (cats: any[]) => {
    const cat = cats.find((c: any) => c.id === categoryId);
    if (!cat) return '';
    return cat.parentId ? cat.parentId : cat.id;
  };

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/listings/meta/categories').then((r) => r.data),
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api.get('/listings/meta/brands').then((r) => r.data),
  });

  const { data, isLoading } = useSearch({
    q: q || undefined,
    categoryId: categoryId || undefined,
    brandId: brandId || undefined,
    condition: condition || undefined,
    city: city || undefined,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: 20,
  });

  const push = useCallback((overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q, categoryId, brandId, condition, gender, city, sort, page: 1, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 1) params.set(k, String(v));
      else if (k === 'page' && v === 1) {} // skip page=1
    });
    router.push(`/ara?${params.toString()}`);
  }, [q, categoryId, brandId, condition, gender, city, sort, page, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    push({ q: inputVal, page: 1 });
  };

  const handleReset = () => {
    setPriceFrom('');
    setPriceTo('');
    router.push(`/ara${q ? `?q=${q}` : ''}`);
    setShowFilters(false);
  };

  const hasActiveFilters = !!(categoryId || brandId || condition || city || minPrice || maxPrice);

  const items = data?.items ?? [];
  const meta = data?.meta;
  const cats = categories ?? [];
  const brnds = brands ?? [];

  const filterFieldProps = {
    categories: cats,
    brands: brnds,
    categoryId,
    brandId,
    condition,
    gender,
    priceFrom,
    priceTo,
    setPriceFrom,
    setPriceTo,
    push,
    router,
    q,
    selectedL1Id,
  };

  return (
    <div className="m-wrap" style={{ paddingTop: 28, paddingBottom: 60 }}>

      {/* Search bar — sticky on mobile */}
      <div className="m-search-bar-wrap">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, height: 48, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 10, padding: '0 8px 0 14px' }}>
            <Search size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Kask, mont, egzoz ara…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)' }}
            />
            {inputVal && (
              <button type="button" onClick={() => { setInputVal(''); push({ q: '', page: 1 }); }} style={{ background: 'none', border: 'none', padding: 4, color: 'var(--ink-3)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="m-btn m-btn-primary">Ara</button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="m-btn"
            style={{ gap: 6, position: 'relative' }}
          >
            <SlidersHorizontal size={16} />
            Filtre
            {hasActiveFilters && (
              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
            )}
          </button>
          {(q || categoryId || brandId || condition || city || minPrice || maxPrice) && (
            <button
              type="button"
              disabled={createSavedSearch.isPending}
              onClick={() => {
                if (!user) { toast.error('Aramayı kaydetmek için giriş yapmalısın'); return; }
                const categoryName = cats.find((c: any) => c.id === categoryId)?.name;
                const brandName = brnds.find((b: any) => b.id === brandId)?.name;
                const label = [q, brandName, categoryName, city].filter(Boolean).join(' · ') || 'Tüm ilanlar';
                createSavedSearch.mutate(
                  { label, search: q || undefined, categoryId: categoryId || undefined, brandId: brandId || undefined, condition: condition || undefined, city: city || undefined, minPrice, maxPrice },
                  {
                    onSuccess: () => toast.success('Arama kaydedildi — uyan yeni ilan girince haber vereceğiz'),
                    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Arama kaydedilemedi'),
                  }
                );
              }}
              className="m-btn"
              style={{ gap: 6 }}
            >
              <BellPlus size={16} />
              Bu aramayı kaydet
            </button>
          )}
        </form>
      </div>

      {/* Filter panel — desktop only (4 col × 2 row) */}
      {showFilters && (
        <div className="m-filter-panel--desktop" style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px', marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 16px' }}>
          <FilterFields {...filterFieldProps} />
          {/* Reset */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={handleReset}
              className="m-btn m-btn-ghost"
              style={{ width: '100%', height: 38, fontSize: 13 }}
            >
              Filtreleri sıfırla
            </button>
          </div>
        </div>
      )}

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="m-filter-drawer--mobile">
          {/* Overlay */}
          <div
            onClick={() => setShowFilters(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 100,
            }}
          />
          {/* Drawer card */}
          <div
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 101,
              background: 'var(--bg-0, #fff)',
              borderRadius: '20px 20px 0 0',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '12px 20px 32px',
            }}
          >
            {/* Handle bar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line, #ddd)' }} />
            </div>

            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>Filtreler</span>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--ink-3)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter fields — single column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FilterFields {...filterFieldProps} />
            </div>

            {/* Actions */}
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => setShowFilters(false)}
                className="m-btn m-btn-primary"
                style={{ width: '100%', height: 46, fontSize: 15, fontWeight: 600 }}
              >
                Filtreleri Uygula
              </button>
              <button
                onClick={handleReset}
                className="m-btn m-btn-ghost"
                style={{ width: '100%', height: 42, fontSize: 14 }}
              >
                Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>
          {isLoading ? 'Aranıyor…' : (
            meta?.total !== undefined
              ? <><strong style={{ color: 'var(--ink)' }}>{meta.total.toLocaleString('tr-TR')}</strong> sonuç{q ? ` — "${q}"` : ''}</>
              : null
          )}
        </p>
        <select
          value={sort}
          onChange={e => push({ sort: e.target.value, page: 1 })}
          className="m-field"
          style={{ width: 'auto', height: 36, fontSize: 13, paddingRight: 28 }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Active filter chips */}
      {(categoryId || brandId || condition || gender || city) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {categoryId && (() => {
            const cat = cats.find((c: any) => c.id === categoryId);
            const l1 = cat?.parentId ? cats.find((c: any) => c.id === cat.parentId) : cat;
            const label = cat?.parentId ? `${l1?.name} › ${cat.name}` : cat?.name ?? categoryId;
            return (
              <span className="m-chip active" onClick={() => push({ categoryId: '', page: 1 })}>
                {label} <X size={13} />
              </span>
            );
          })()}
          {brandId && (
            <span className="m-chip active" onClick={() => push({ brandId: '', page: 1 })}>
              {brnds.find((b: any) => b.id === brandId)?.name ?? brandId} <X size={13} />
            </span>
          )}
          {condition && (
            <span className="m-chip active" onClick={() => push({ condition: '', page: 1 })}>
              {CONDITIONS.find(c => c.value === condition)?.label} <X size={13} />
            </span>
          )}
          {gender && (
            <span className="m-chip active" onClick={() => push({ gender: '', page: 1 })}>
              {GENDERS.find(g => g.value === gender)?.label} <X size={13} />
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="m-listing-grid" style={{ gap: 12 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: '4/5', background: 'var(--bg-1)', borderRadius: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Search size={44} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <p style={{ fontWeight: 600, color: 'var(--ink-2)' }}>Sonuç bulunamadı</p>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>Farklı anahtar kelime veya filtre deneyin</p>
        </div>
      ) : (
        <>
          <div className="m-listing-grid" style={{ gap: 12 }}>
            {items.map((item: any, i: number) => (
              <>
                <ListingCard key={item.id} listing={item} />
                {(i + 1) % 6 === 0 && (
                  <div key={`ad-${i}`} style={{ gridColumn: '1/-1' }}>
                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LISTING ?? ''} format="auto" />
                  </div>
                )}
              </>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 36, flexWrap: 'wrap' }}>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => push({ page: p })}
                  className="m-btn sm"
                  style={p === page ? { background: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'transparent' } : {}}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
