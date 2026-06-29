'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Clock, ChevronRight, ArrowRight, Newspaper } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

const COVER_IMAGES: Record<string, string> = {
  'motosiklet-botu-rehberi':
    'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?auto=format&fit=crop&w=800&q=80',
  'motosiklet-ekipman-bakimi-uzun-omur':
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
  'motosiklet-fotograflari-iyi-cekmek':
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80',
  'alpinestars-vs-dainese-koruyucu-giysi':
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
  'motosiklet-suruse-baslangi%C3%A7-rehberi':
    'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=800&q=80',
  'motosiklet-suruse-baslangic-rehberi':
    'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=800&q=80',
  'motosiklet-depolama-ve-kis-uykusu':
    'https://images.unsplash.com/photo-1526139334526-f591a54b477c?auto=format&fit=crop&w=800&q=80',
  'ikinci-el-motosiklet-nasil-alinir':
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
  'motosiklet-zinciri-bakimi-ve-yagi':
    'https://images.unsplash.com/photo-1547549082-6bc09f2049ae?auto=format&fit=crop&w=800&q=80',
  'kis-motosiklet-surmenin-ipuclari':
    'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?auto=format&fit=crop&w=800&q=80',
  'shoei-vs-agv-vs-arai-kask-karsilastirmasi':
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=80',
  'motosiklet-lastigi-secimi-ve-bakimi':
    'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=800&q=80',
  'ikinci-el-kask-alirken-dikkat-edilmesi-gerekenler':
    'https://images.unsplash.com/photo-1573435567032-ff5669b13abb?auto=format&fit=crop&w=800&q=80',
  'motosiklet-montu-secimi-rehberi':
    'https://images.unsplash.com/photo-1581093458791-9d15482b8b53?auto=format&fit=crop&w=800&q=80',
  'akrapovic-egzoz-rehberi':
    'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?auto=format&fit=crop&w=800&q=80',
  'motosiklet-eldiveni-secimi':
    'https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?auto=format&fit=crop&w=800&q=80',
  'motosiklet-koruyucu-ekipman-rehberi':
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
  'motosiklet-bakim-ipuclari':
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
  'turkiyede-motosiklet-turizmi':
    'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=800&q=80',
  'agv-kask-modelleri-karsilastirma':
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=800&q=80',
  'motosiklet-sigortasi-ve-ekipman-korumasi':
    'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
};

function getCover(post: any): string | null {
  return post.coverImage || COVER_IMAGES[post.slug] || null;
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
  const featured = posts[0];
  const rest = posts.slice(1);

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
          {featured && (
            <Link href={`/blog/${featured.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
              <article className="m-card m-blog-hero" style={{
                background: 'var(--bg-1)', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-l)',
              }}>
                <div className="m-blog-hero-media" style={{
                  background: 'var(--bg-2)',
                  display: 'grid', placeItems: 'center', minHeight: 280, fontSize: 80, position: 'relative',
                  overflow: 'hidden',
                }}>
                  {getCover(featured)
                    ? <img src={getCover(featured)!} alt={featured.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    : featured.coverEmoji}

                  <div style={{ position: 'absolute', top: 16, left: 16 }}>
                    <span className="m-badge solid">ÖNE ÇIKAN</span>
                  </div>
                </div>
                <div className="m-blog-hero-body" style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    <span className="m-badge verify">{featured.category}</span>
                  </div>
                  <h2 className="m-display" style={{ fontSize: 24, margin: '0 0 14px', lineHeight: 1.2 }}>{featured.title}</h2>
                  <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 20 }}>{featured.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--ink-3)', fontSize: 12.5 }}>
                    <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <Clock size={13} />{featured.readTime} dakika okuma
                    </span>
                    <span>{new Date(featured.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <div style={{ flex: 1 }} />
                    <span className="m-accent" style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>
                      Oku <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {rest.map((post: any) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <article className="m-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{
                    background: 'var(--bg-2)',
                    display: 'grid', placeItems: 'center', height: 140, fontSize: 52, flexShrink: 0,
                    overflow: 'hidden', position: 'relative',
                  }}>
                    {getCover(post)
                      ? <img src={getCover(post)!} alt={post.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : post.coverEmoji}
                  </div>
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
