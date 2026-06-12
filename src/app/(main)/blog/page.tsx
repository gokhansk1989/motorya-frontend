import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/data/blog';
import { Clock, ChevronRight, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Motosiklet Blog — Rehberler, İncelemeler & Rotalar | Motorya',
  description: 'Motosiklet ekipman rehberleri, kask ve mont incelemeleri, Türkiye rota önerileri ve bakım ipuçları. Motorya blog ile daha bilinçli bir sürücü ol.',
  openGraph: {
    title: 'Motosiklet Blog | Motorya',
    description: 'Ekipman rehberleri, güvenlik ipuçları ve Türkiye motosiklet rotaları.',
    url: 'https://motorya.com.tr/blog',
    type: 'website',
  },
};

export default function BlogPage() {
  const featured = BLOG_POSTS[0];
  const rest = BLOG_POSTS.slice(1);

  return (
    <div className="m-wrap" style={{ paddingTop: 40, paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span className="m-badge new">BLOG</span>
          <span className="m-kicker">Motosiklet rehberleri & incelemeler</span>
        </div>
        <h1 className="m-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', margin: 0 }}>
          Motorya Blog
        </h1>
        <p style={{ marginTop: 12, fontSize: 16, color: 'var(--ink-2)', maxWidth: 540 }}>
          Ekipman seçimi, güvenlik rehberleri, bakım ipuçları ve Türkiye'nin en güzel motosiklet rotaları.
        </p>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
        {['Tümü', ...BLOG_CATEGORIES].map(cat => (
          <span key={cat} className="m-chip" style={{ height: 34, cursor: 'default' }}>{cat}</span>
        ))}
      </div>

      {/* Featured post */}
      <Link href={`/blog/${featured.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 32 }}>
        <article style={{
          background: 'var(--bg-1)', border: '1px solid var(--line-soft)', borderRadius: 'var(--radius-l)',
          overflow: 'hidden', transition: 'transform .16s ease, box-shadow .16s ease',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
        }}
          className="m-card"
        >
          <div style={{
            background: 'repeating-linear-gradient(45deg, var(--bg-2) 0 20px, var(--bg-3) 20px 40px)',
            display: 'grid', placeItems: 'center', minHeight: 280, fontSize: 80,
            position: 'relative',
          }}>
            {featured.coverEmoji}
            <div style={{ position: 'absolute', top: 16, left: 16 }}>
              <span className="m-badge solid">ÖNE ÇIKAN</span>
            </div>
          </div>
          <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span className="m-badge verify">{featured.category}</span>
            </div>
            <h2 className="m-display" style={{ fontSize: 24, margin: '0 0 14px', lineHeight: 1.2 }}>
              {featured.title}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 20 }}>
              {featured.excerpt}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--ink-3)', fontSize: 12.5 }}>
              <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <Clock size={13} />{featured.readTime} dakika okuma
              </span>
              <span>{new Date(featured.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <div style={{ flex: 1 }} />
              <span className="m-accent" style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>
                Oku <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </article>
      </Link>

      {/* Post grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {rest.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
            <article className="m-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                background: 'repeating-linear-gradient(45deg, var(--bg-2) 0 12px, var(--bg-3) 12px 24px)',
                display: 'grid', placeItems: 'center', height: 140, fontSize: 52, flexShrink: 0,
              }}>
                {post.coverEmoji}
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
                  <span>{new Date(post.date).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })}</span>
                  <div style={{ flex: 1 }} />
                  <ChevronRight size={14} style={{ color: 'var(--accent)' }} />
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
