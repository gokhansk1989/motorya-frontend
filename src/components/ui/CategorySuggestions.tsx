'use client';
import { useRouter } from 'next/navigation';
import { CategoryIcon } from '@/components/icons/CategoryIcons';

export interface CategoryLite { id: string; name: string; slug: string; parentId: string | null; }

export function matchCategories(categories: CategoryLite[], query: string, limit = 5): CategoryLite[] {
  const q = query.trim().toLocaleLowerCase('tr');
  if (!q) return [];
  return categories.filter(c => c.name.toLocaleLowerCase('tr').includes(q)).slice(0, limit);
}

export function CategorySuggestionsDropdown({ matches }: { matches: CategoryLite[] }) {
  const router = useRouter();
  if (matches.length === 0) return null;

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 70,
      background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 11,
      boxShadow: '0 12px 32px -10px rgba(0,0,0,0.22)', overflow: 'hidden',
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', margin: 0, padding: '10px 16px 6px' }}>Kategoriler</p>
      {matches.map(c => (
        <button
          key={c.id}
          type="button"
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
    </div>
  );
}
