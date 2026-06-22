'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSavedSearches, useCreateSavedSearch } from '@/hooks/useSavedSearches';
import { useMyFavorites } from '@/hooks/useListings';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { BellPlus, Bell, Trash2, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

function savedSearchToUrl(alarm: import('@/hooks/useSavedSearches').SavedSearch) {
  const p = new URLSearchParams();
  if (alarm.search) p.set('q', alarm.search);
  if (alarm.categoryId) p.set('categoryId', alarm.categoryId);
  if (alarm.city) p.set('city', alarm.city);
  if (alarm.condition) p.set('condition', alarm.condition);
  if (alarm.minPrice) p.set('minPrice', alarm.minPrice);
  if (alarm.maxPrice) p.set('maxPrice', alarm.maxPrice);
  const qs = p.toString();
  return `/ara${qs ? `?${qs}` : ''}`;
}

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Sıfır', LIKE_NEW: 'Sıfır Gibi', GOOD: 'İyi', FAIR: 'Makul', POOR: 'Kullanılmış',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

export default function FiyatAlarmPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const { data: alarms = [], isLoading } = useSavedSearches();
  const createAlarm = useCreateSavedSearch();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', search: '', categoryId: '', maxPrice: '', minPrice: '', city: '' });
  const { data: favoritesData } = useMyFavorites();
  const favorites: any[] = Array.isArray(favoritesData) ? favoritesData : (favoritesData?.items ?? []);

  const { data: categories = [] } = useQuery<{ id: string; name: string; slug: string; parentId: string | null }[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/listings/meta/categories').then(r => r.data),
  });
  const l1Categories = categories.filter(c => !c.parentId);

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/saved-searches/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['saved-searches'] }); toast.success('Alarm silindi'); },
  });

  if (!user) {
    return (
      <div className="m-wrap" style={{ paddingTop: 48, paddingBottom: 48, textAlign: 'center' }}>
        <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
        <h1 className="m-display" style={{ fontSize: 24, marginBottom: 8 }}>Fiyat Alarmları</h1>
        <p style={{ color: 'var(--ink-3)', marginBottom: 24 }}>Alarmlarını görmek için giriş yapmalısın.</p>
        <Link href="/giris" className="m-btn m-btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
          Giriş Yap
        </Link>
      </div>
    );
  }

  function handleCreate() {
    if (!form.label.trim()) { toast.error('Alarm adı zorunlu'); return; }
    createAlarm.mutate({
      label: form.label,
      search: form.search || undefined,
      categoryId: form.categoryId || undefined,
      minPrice: form.minPrice ? Number(form.minPrice) : undefined,
      maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
      city: form.city || undefined,
    }, {
      onSuccess: () => {
        toast.success('Alarm kuruldu! Uygun ilan çıkınca haber vereceğiz.');
        setShowForm(false);
        setForm({ label: '', search: '', categoryId: '', maxPrice: '', minPrice: '', city: '' });
      },
      onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Alarm kurulamadı'),
    });
  }

  return (
    <div className="m-wrap" style={{ paddingTop: 32, paddingBottom: 48 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="m-display" style={{ fontSize: 26, margin: '0 0 6px' }}>Fiyat Alarmları</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>
            Kriterlere uyan ilan yayınlandığında sana bildirim gönderelim.
          </p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="m-btn m-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BellPlus size={16} /> Alarm Kur
        </button>
      </div>

      {/* Alarm oluşturma formu */}
      {showForm && (
        <div className="m-surface" style={{ padding: '24px', marginBottom: 28, borderRadius: 'var(--radius-l)' }}>
          <h3 className="m-display" style={{ fontSize: 17, marginBottom: 20 }}>Yeni Alarm</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label className="m-label">Alarm Adı *</label>
              <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="örn. Shoei kask 2000₺ altı"
                className="m-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label className="m-label">Anahtar Kelime</label>
              <input value={form.search} onChange={e => setForm(f => ({ ...f, search: e.target.value }))}
                placeholder="Shoei, Alpinestars..."
                className="m-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label className="m-label">Kategori</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="m-input" style={{ width: '100%' }}>
                <option value="">Tüm kategoriler</option>
                {l1Categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="m-label">Min Fiyat (₺)</label>
              <input type="number" value={form.minPrice} onChange={e => setForm(f => ({ ...f, minPrice: e.target.value }))}
                placeholder="0" className="m-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label className="m-label">Max Fiyat (₺)</label>
              <input type="number" value={form.maxPrice} onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))}
                placeholder="Üst sınır yok" className="m-input" style={{ width: '100%' }} />
            </div>
            <div>
              <label className="m-label">Şehir</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="İstanbul, Ankara..." className="m-input" style={{ width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={() => setShowForm(false)} className="m-btn" style={{ flex: 1 }}>İptal</button>
            <button onClick={handleCreate} disabled={createAlarm.isPending}
              className="m-btn m-btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {createAlarm.isPending && <Loader2 size={14} className="animate-spin" />}
              Alarm Kur
            </button>
          </div>
        </div>
      )}

      {/* Alarm listesi */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 80, background: 'var(--bg-2)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : alarms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--ink-3)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'color-mix(in oklch, var(--accent) 10%, var(--bg-2))', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
            <Bell size={32} style={{ color: 'var(--accent)', opacity: 0.6 }} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>Henüz alarm kurulmamış</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 320, margin: '0 auto 28px' }}>Kriterlere uyan ilan yayınlandığında anında haber verelim — fiyat, marka, kategori veya şehir bazlı alarm kurabilirsin.</p>
          <button onClick={() => setShowForm(true)} className="m-btn m-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <BellPlus size={16} /> İlk Alarmını Kur
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alarms.map(alarm => (
            <div key={alarm.id} className="m-surface"
              style={{ padding: '16px 20px', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}
              onMouseEnter={e => { const btn = e.currentTarget.querySelector<HTMLElement>('[data-hover-btn]'); if (btn) btn.style.opacity = '1'; }}
              onMouseLeave={e => { const btn = e.currentTarget.querySelector<HTMLElement>('[data-hover-btn]'); if (btn) btn.style.opacity = '0'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'color-mix(in oklch, var(--accent) 15%, var(--bg-2))', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Bell size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 4px', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {alarm.label}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {alarm.search && <span className="m-chip" style={{ height: 22, fontSize: 11 }}>🔍 {alarm.search}</span>}
                  {alarm.minPrice && <span className="m-chip" style={{ height: 22, fontSize: 11 }}>Min {Number(alarm.minPrice).toLocaleString('tr-TR')}₺</span>}
                  {alarm.maxPrice && <span className="m-chip" style={{ height: 22, fontSize: 11 }}>Max {Number(alarm.maxPrice).toLocaleString('tr-TR')}₺</span>}
                  {alarm.city && <span className="m-chip" style={{ height: 22, fontSize: 11 }}>📍 {alarm.city}</span>}
                  {alarm.condition && <span className="m-chip" style={{ height: 22, fontSize: 11 }}>{CONDITION_LABELS[alarm.condition]}</span>}
                </div>
                {alarm.lastNotifiedAt ? (
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
                    Son eşleşme: {timeAgo(alarm.lastNotifiedAt)}
                  </p>
                ) : (
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>Henüz eşleşme yok</p>
                )}
              </div>
              <Link
                href={savedSearchToUrl(alarm)}
                data-hover-btn
                style={{ position: 'absolute', right: 52, top: '50%', transform: 'translateY(-50%)', opacity: 0, transition: 'opacity .15s', height: 30, padding: '0 12px', borderRadius: 8, border: '1px solid var(--accent)', background: 'color-mix(in oklch, var(--accent) 10%, transparent)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}
              >
                <ExternalLink size={12} /> Sonuçları Gör
              </Link>
              <button onClick={() => deleteMut.mutate(alarm.id)} disabled={deleteMut.isPending}
                style={{ padding: 8, background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', borderRadius: 8, flexShrink: 0 }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hızlı alarm kur — kategori linkleri */}
      {!showForm && alarms.length === 0 && l1Categories.length > 0 && (
        <div style={{ marginTop: 40, padding: '24px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>Popüler kategori alarmları</p>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>Bir kategoriye tıkla, alarm otomatik pre-fill edilsin.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {l1Categories.slice(0, 8).map(c => (
              <button key={c.id} onClick={() => {
                setForm(f => ({ ...f, label: `${c.name} Alarmı`, categoryId: c.id }));
                setShowForm(true);
              }} style={{ height: 36, padding: '0 16px', borderRadius: 20, border: '1px solid var(--line)', background: 'var(--bg-0)', color: 'var(--ink-2)', fontSize: 13, cursor: 'pointer', fontWeight: 500, transition: 'border-color .12s, color .12s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
              >
                + {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Favorilerden hızlı alarm kur */}
      {favorites.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={16} style={{ color: 'var(--accent)' }} /> Favorilediğin ilanlar için alarm kur
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>Takip ettiğin ilanların fiyatı değişince haberdar ol.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {favorites.slice(0, 6).map((listing: any) => {
              const thumb = listing.images?.[0]?.url ?? listing.imageUrl;
              return (
                <div key={listing.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-2)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {thumb ? <img src={thumb} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <Bell size={16} style={{ color: 'var(--ink-3)' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{Number(listing.price).toLocaleString('tr-TR')} ₺</p>
                  </div>
                  <button
                    onClick={() => {
                      setForm(f => ({ ...f, label: listing.title ?? 'İlan Alarmı', search: listing.title ?? '' }));
                      setShowForm(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{ flexShrink: 0, height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid var(--accent)', background: 'color-mix(in oklch, var(--accent) 10%, transparent)', color: 'var(--accent)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Bell size={12} /> Takip et
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }`}</style>
    </div>
  );
}
