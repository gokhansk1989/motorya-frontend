'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Clock, ChevronRight, ArrowRight, Newspaper } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

// Unsplash'a bağımlı fallback kaldırıldı; motosikletsiz görseller
// (masa tenisi vb.) çıkabiliyordu. Post'un kendi coverImage'i yoksa
// gradient + icon placeholder gösteriliyor.

function getCover(post: any): string | null {
  return post.coverImage || null;
}

function useBlogPosts(category?: string) {
  return useQuery({
    queryKey: ['blog', category],
    queryFn: () => api.get('/blog', { params: { limit: 50, ...(category ? { category } : {}) } }).then(r => r.data),
  });
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const { data, isLoading } = useBlogPosts(activeCategory);
  const posts: any[] = data?.items ?? [];
  // Featured hero kaldirildi; tum yazilar esit grid'de listelenir.
  const rest = posts;

  const allCategories = Array.from(new Set(posts.map((p: any) => p.category)));

  return (
    <div className="m-wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span className="m-badge new">BLOG</span>
          <span className="m-kicker">Motosiklet rehberleri & incelemeler</span>
        </div>
        <h1 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', margin: 0 }}>Motorya Blog</h1>
        <p style={{ marginTop: 12, fontSize: 16, color: 'var(--ink-2)', maxWidth: 540 }}>
          Ekipman seçimi, güvenlik rehberleri, bakım ipuçları ve Türkiye'nin en güzel motosiklet rotaları.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
        <button
          onClick={() => setActiveCategory(undefined)}
          className={'m-chip' + (!activeCategory ? ' active' : '')}
          style={{ height: 34 }}
        >Tümü</button>
        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat === activeCategory ? undefined : cat)}
            className={'m-chip' + (activeCategory === cat ? ' active' : '')}
            style={{ height: 34 }}
          >{cat}</button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: 280, background: 'var(--bg-1)', borderRadius: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState icon={<Newspaper size={44} />} title="Henüz blog yazısı yok" sub="Yakında burada olacak." />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {rest.map((post: any) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <article className="m-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {getCover(post) && (
                    <div style={{
                      background: 'var(--bg-2)',
                      height: 140, flexShrink: 0, overflow: 'hidden', position: 'relative',
                    }}>
                      <img src={getCover(post)!} alt={post.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div className="m-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: 10 }}>
                      <span className="m-badge verify" style={{ fontSize: 10 }}>{post.category}</span>
                    </div>
                    <h3 className="m-card-title" style={{ fontSize: 15, flex: 1 }}>{post.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.excerpt}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-3)', fontSize: 12 }}>
                      <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <Clock size={12} />{post.readTime} dk
                      </span>
                      <span>{new Date(post.publishedAt).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}</span>
                      <div style={{ flex: 1 }} />
                      <ChevronRight size={14} style={{ color: 'var(--accent)' }} />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
