import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://motorya.com.tr/api-backend';

async function getPage(slug: string) {
  try {
    const res = await fetch(`${API}/pages/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  return {
    title: `${page.title} | Motorya`,
    description: page.content.slice(0, 160).replace(/[#*`]/g, ''),
  };
}

function renderMarkdown(content: string) {
  const lines = content.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="m-display" style={{ fontSize: 20, margin: '32px 0 12px', color: 'var(--ink)', borderBottom: '1px solid var(--line-soft)', paddingBottom: 8 }}>
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="m-display" style={{ fontSize: 16, margin: '24px 0 8px', color: 'var(--ink)' }}>
          {line.slice(4)}
        </h3>
      );
    } else if (line.match(/^---+$/)) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid var(--line-soft)', margin: '24px 0' }} />);
    } else if (line.startsWith('| ')) {
      // Tablo — başlık satırı + ayırıcı + veri satırları
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      const [headerRow, , ...dataRows] = tableLines;
      const headers = headerRow.split('|').map(c => c.trim()).filter(Boolean);
      const rows = dataRows.map(r => r.split('|').map(c => c.trim()).filter(Boolean));
      elements.push(
        <div key={`tbl-${i}`} style={{ overflowX: 'auto', margin: '16px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr>
                {headers.map((h, hi) => (
                  <th key={hi} style={{ textAlign: 'left', padding: '10px 14px', background: 'var(--bg-2)', borderBottom: '2px solid var(--line)', fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '10px 14px', color: 'var(--ink-2)', verticalAlign: 'top' }}
                      dangerouslySetInnerHTML={{ __html: renderInline(cell) }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: '10px 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, li) => (
            <li key={li} style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
          ))}
        </ul>
      );
      continue;
    } else if (line.trim() !== '') {
      elements.push(
        <p key={i} style={{ margin: '10px 0', color: 'var(--ink-2)', lineHeight: 1.75, fontSize: 15 }}
          dangerouslySetInnerHTML={{ __html: renderInline(line) }} />
      );
    }
    i++;
  }
  return elements;
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--ink);font-weight:700">$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--accent);text-decoration:underline">$1</a>')
    .replace(/`(.+?)`/g, '<code style="background:var(--bg-2);padding:2px 6px;border-radius:4px;font-size:13px">$1</code>');
}

export default async function StaticPageDetail({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <div className="m-wrap" style={{ paddingTop: 28, paddingBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-3)', fontSize: 13, marginBottom: 32 }}>
        <Link href="/" style={{ color: 'var(--ink-3)' }}>Ana Sayfa</Link>
        <ChevronLeft size={13} style={{ opacity: 0.5, transform: 'rotate(180deg)' }} />
        <span style={{ color: 'var(--ink-2)' }}>{page.title}</span>
      </div>

      <div style={{ maxWidth: 720 }}>
        <h1 className="m-display" style={{ fontSize: 'clamp(24px, 3vw, 32px)', margin: '0 0 8px', lineHeight: 1.2 }}>
          {page.title}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 40 }}>
          Son güncelleme:{' '}
          {new Date(page.updatedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div>{renderMarkdown(page.content)}</div>
      </div>
    </div>
  );
}
