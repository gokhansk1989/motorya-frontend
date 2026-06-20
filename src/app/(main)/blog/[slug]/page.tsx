import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, ChevronLeft, Tag, ArrowRight } from 'lucide-react';
import { AdSlot } from '@/components/ui/AdSlot';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://motorya.com.tr/api-backend';

async function getPost(slug: string) {
  try {
    const res = await fetch(`${API}/blog/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getRelated(category: string, currentSlug: string) {
  try {
    const res = await fetch(`${API}/blog?limit=50`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items as any[]).filter(p => p.slug !== currentSlug && p.category === category).slice(0, 3);
  } catch {
    return [];
  }
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Motorya Blog`,
    description: post.excerpt,
    keywords: post.tags?.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title, description: post.excerpt,
      url: `https://motorya.com.tr/blog/${post.slug}`, type: 'article',
      publishedTime: post.publishedAt, tags: post.tags,
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt },
  };
}

function renderMarkdown(content: string) {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="m-display" style={{ fontSize: 22, margin: '32px 0 12px', color: 'var(--ink)' }}>{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="m-display" style={{ fontSize: 17, margin: '24px 0 10px', color: 'var(--ink)' }}>{line.slice(4)}</h3>);
    } else if (line.startsWith('| ')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) { tableLines.push(lines[i]); i++; }
      const [header, , ...rows] = tableLines;
      const headers = header.split('|').filter(s => s.trim());
      elements.push(
        <div key={`table-${i}`} style={{ overflowX: 'auto', margin: '16px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr>{headers.map((h, hi) => <th key={hi} style={{ padding: '10px 14px', background: 'var(--bg-2)', border: '1px solid var(--line)', textAlign: 'left', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13 }}>{h.trim()}</th>)}</tr></thead>
            <tbody>{rows.map((row, ri) => <tr key={ri}>{row.split('|').filter(s => s.trim()).map((cell, ci) => <td key={ci} style={{ padding: '10px 14px', border: '1px solid var(--line-soft)', color: 'var(--ink-2)', fontSize: 13.5 }}>{cell.trim()}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) { items.push(lines[i].slice(2)); i++; }
      elements.push(<ul key={`ul-${i}`} style={{ margin: '12px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>{items.map((item, li) => <li key={li} style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: renderInline(item) }} />)}</ul>);
      continue;
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++; }
      elements.push(<ol key={`ol-${i}`} style={{ margin: '12px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>{items.map((item, li) => <li key={li} style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: renderInline(item) }} />)}</ol>);
      continue;
    } else if (line.trim() !== '') {
      elements.push(<p key={i} style={{ margin: '12px 0', color: 'var(--ink-2)', lineHeight: 1.7, fontSize: 15 }} dangerouslySetInnerHTML={{ __html: renderInline(line) }} />);
    }
    i++;
  }
  return elements;
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--ink);font-weight:700">$1</strong>')
    .replace(/`(.+?)`/g, '<code style="background:var(--bg-2);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:13px">$1</code>');
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, related] = await Promise.all([getPost(slug), getRelated('', slug)]);
  if (!post) notFound();

  const relatedPosts = related.length ? related : await getRelated(post.category, slug);

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: post.title, description: post.excerpt,
    author: { '@type': 'Organization', name: 'Motorya' },
    publisher: { '@type': 'Organization', name: 'Motorya', url: 'https://motorya.com.tr' },
    datePublished: post.publishedAt, keywords: post.tags?.join(', '),
    url: `https://motorya.com.tr/blog/${post.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="m-wrap" style={{ paddingTop: 28, paddingBottom: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-3)', fontSize: 13, marginBottom: 28 }}>
          <Link href="/" style={{ color: 'var(--ink-3)' }}>Ana Sayfa</Link>
          <ChevronLeft size={13} style={{ opacity: 0.5, transform: 'rotate(180deg)' }} />
          <Link href="/blog" style={{ color: 'var(--ink-3)' }}>Blog</Link>
          <ChevronLeft size={13} style={{ opacity: 0.5, transform: 'rotate(180deg)' }} />
          <span style={{ color: 'var(--ink-2)' }}>{post.category}</span>
        </div>

        <div className="m-blog-layout">
          <article>
            <div style={{ background: 'repeating-linear-gradient(45deg, var(--bg-2) 0 20px, var(--bg-3) 20px 40px)', borderRadius: 'var(--radius)', display: 'grid', placeItems: 'center', height: 240, fontSize: 96, marginBottom: 32, border: '1px solid var(--line-soft)' }}>
              {post.coverEmoji}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <span className="m-badge verify">{post.category}</span>
              <span style={{ display: 'flex', gap: 5, alignItems: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                <Clock size={13} />{post.readTime} dakika okuma
              </span>
              <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>
                {new Date(post.publishedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1 className="m-display" style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', margin: '0 0 16px', lineHeight: 1.15 }}>{post.title}</h1>
            <p style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid var(--line-soft)' }}>{post.excerpt}</p>
            <div>{renderMarkdown(post.content)}</div>
            <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG ?? ''} format="fluid" style={{ margin: '28px 0' }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 40, paddingTop: 28, borderTop: '1px solid var(--line-soft)' }}>
              <Tag size={15} style={{ color: 'var(--ink-3)' }} />
              {(post.tags ?? []).map((tag: string) => <span key={tag} className="m-chip" style={{ height: 30, fontSize: 12 }}>#{tag}</span>)}
            </div>
            <div className="m-surface-2" style={{ padding: '28px 32px', marginTop: 36, borderRadius: 'var(--radius-l)' }}>
              <h3 className="m-display" style={{ fontSize: 20, margin: '0 0 10px' }}>İkinci el ekipman arıyor musun?</h3>
              <p style={{ color: 'var(--ink-2)', fontSize: 14.5, marginBottom: 20 }}>Motorya'da binlerce ikinci el motosiklet ekipmanı seni bekliyor. Güvenli ödeme, kargo takibi.</p>
              <Link href="/" className="m-btn m-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', gap: 8, alignItems: 'center', height: 44, padding: '0 24px', borderRadius: 8 }}>
                İlanları Gör <ArrowRight size={16} />
              </Link>
            </div>
          </article>

          <aside style={{ position: 'sticky', top: 88 }}>
            {relatedPosts.length > 0 && (
              <div className="m-surface" style={{ padding: '20px 22px', marginBottom: 20 }}>
                <div className="m-kicker" style={{ marginBottom: 14 }}>İlgili Yazılar</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {relatedPosts.map((p: any) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`} style={{ textDecoration: 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 28, flexShrink: 0 }}>{p.coverEmoji}</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 13.5, fontFamily: 'var(--font-display)', fontWeight: 600, lineHeight: 1.3, color: 'var(--ink)' }}>{p.title}</p>
                        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.readTime} dk</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="m-surface" style={{ padding: '20px 22px' }}>
              <div className="m-kicker" style={{ marginBottom: 14 }}>Kategoriler</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Güvenlik', 'Ekipman', 'Bakım', 'Rota & Seyahat', 'Ürün İnceleme', 'Hukuk & Sigorta'].map(cat => (
                  <Link key={cat} href="/blog" style={{ fontSize: 14, color: 'var(--ink-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--line-soft)', textDecoration: 'none' }}>
                    {cat}<ChevronLeft size={14} style={{ transform: 'rotate(180deg)', color: 'var(--ink-3)' }} />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
