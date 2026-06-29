'use client';
import { useEffect, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { CategoryIcon } from '@/components/icons/CategoryIcons';

export interface CategoryLite { id: string; name: string; slug: string; parentId: string | null; }
export interface BrandLite { id: string; name: string; }

export function matchCategories(categories: CategoryLite[], query: string, limit = 5): CategoryLite[] {
  const q = query.trim().toLocaleLowerCase('tr');
  if (!q) return [];
  return categories.filter(c => c.name.toLocaleLowerCase('tr').includes(q)).slice(0, limit);
}

export function matchBrands(brands: BrandLite[], query: string, limit = 4): BrandLite[] {
  const q = query.trim().toLocaleLowerCase('tr');
  if (!q) return [];
  return brands.filter(b => b.name.toLocaleLowerCase('tr').includes(q)).slice(0, limit);
}

interface Props {
  query: string;
  matches: CategoryLite[];
  brandMatches?: BrandLite[];
  anchorRef: RefObject<HTMLElement | null>;
  onSearchQuery: (q: string) => void;
}

// Portal'a taşınıyor çünkü kapsayıcı sayfa bölümleri (Hero, header) farklı stacking
// context'lere sahip — z-index ile yarışmak yerine document.body'de sabit konumlandırıp
// her zaman en üstte göstermek daha güvenilir (MobileBarPortal ile aynı yaklaşım).
export function CategorySuggestionsDropdown({ query, matches, brandMatches = [], anchorRef, onSearchQuery }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const visible = query.trim().length > 0;

  useEffect(() => {
    if (!visible) return;
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setRect({ top: r.bottom + 6, left: r.left, width: r.width });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [visible, anchorRef]);

  if (!mounted || !visible || !rect) return null;

  return createPortal(
    <div style={{
      position: 'fixed', top: rect.top, left: rect.left, width: rect.width, zIndex: 9999,
      background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 11,
      boxShadow: '0 12px 32px -10px rgba(0,0,0,0.22)', overflow: 'hidden',
    }}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onSearchQuery(query)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px', background: 'transparent', border: 0, cursor: 'pointer',
          fontSize: 14, color: 'var(--ink)', textAlign: 'left',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-2)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        <Search size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
        <span><strong>{query}</strong> ara</span>
      </button>
      {matches.length > 0 && (
        <>
          <div style={{ height: 1, background: 'var(--line-soft)' }} />
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', margin: 0, padding: '10px 16px 6px' }}>Kategoriler</p>
          {matches.map(c => (
            <button
              key={c.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => router.push(`/kategori/${c.slug}`)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px', background: 'transparent', border: 0, cursor: 'pointer',
                fontSize: 14, color: 'var(--ink)', textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <CategoryIcon slug={c.slug} size={24} alt={c.name} />
              {c.name}
            </button>
          ))}
        </>
      )}
      {brandMatches.length > 0 && (
        <>
          <div style={{ height: 1, background: 'var(--line-soft)' }} />
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', margin: 0, padding: '10px 16px 6px' }}>Markalar</p>
          {brandMatches.map(b => (
            <button
              key={b.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => router.push(`/ara?brandId=${b.id}`)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px', background: 'transparent', border: 0, cursor: 'pointer',
                fontSize: 14, color: 'var(--ink)', textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Search size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
              {b.name}
            </button>
          ))}
        </>
      )}
    </div>,
    document.body,
  );
}
