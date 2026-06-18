'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSavedSearches, useCreateSavedSearch } from '@/hooks/useSavedSearches';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { BellPlus, Bell, Trash2, Loader2, ChevronRight, Tag } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
          <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
          <p style={{ fontSize: 16, marginBottom: 8 }}>Henüz alarm kurulmamış</p>
          <p style={{ fontSize: 14 }}>Arama kriterlerine uyan ilan çıkınca seni haberdar edelim.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alarms.map(alarm => (
            <div key={alarm.id} className="m-surface"
              style={{ padding: '16px 20px', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'color-mix(in oklch, var(--accent) 15%, var(--bg-2))', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Bell size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 4px', color: 'var(--ink)' }}>{alarm.label}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {alarm.search && <span className="m-chip" style={{ height: 22, fontSize: 11 }}>🔍 {alarm.search}</span>}
                  {alarm.minPrice && <span className="m-chip" style={{ height: 22, fontSize: 11 }}>Min {Number(alarm.minPrice).toLocaleString('tr-TR')}₺</span>}
                  {alarm.maxPrice && <span className="m-chip" style={{ height: 22, fontSize: 11 }}>Max {Number(alarm.maxPrice).toLocaleString('tr-TR')}₺</span>}
                  {alarm.city && <span className="m-chip" style={{ height: 22, fontSize: 11 }}>📍 {alarm.city}</span>}
                  {alarm.condition && <span className="m-chip" style={{ height: 22, fontSize: 11 }}>{CONDITION_LABELS[alarm.condition]}</span>}
                </div>
                {alarm.lastNotifiedAt && (
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
                    Son bildirim: {timeAgo(alarm.lastNotifiedAt)}
                  </p>
                )}
              </div>
              <button onClick={() => deleteMut.mutate(alarm.id)} disabled={deleteMut.isPending}
                style={{ padding: 8, background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', borderRadius: 8 }}
                className="hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hızlı alarm kur — kategori linkleri */}
      {!showForm && alarms.length === 0 && (
        <div style={{ marginTop: 48 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 14 }}>Popüler kategori alarmları:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {l1Categories.slice(0, 8).map(c => (
              <button key={c.id} onClick={() => {
                setForm(f => ({ ...f, label: `${c.name} Alarmı`, categoryId: c.id }));
                setShowForm(true);
              }} className="m-chip" style={{ height: 34, fontSize: 13 }}>
                + {c.name} alarmı
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
