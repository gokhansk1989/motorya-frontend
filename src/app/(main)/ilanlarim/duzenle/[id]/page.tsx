'use client';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Upload, X, ChevronDown, Save, Camera, ImagePlus, ArrowLeft } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { IL_ILCE, ALL_CITIES } from '@/lib/il-ilce';
import { FotografYoneticisi, type FotografDurumu } from '@/components/listings/FotografYoneticisi';
import { kadrajOku, type Kadraj } from '@/lib/gorselOran';

const schema = z.object({
  title: z.string().min(5, 'En az 5 karakter'),
  description: z.string().min(20, 'En az 20 karakter'),
  categoryId: z.string().min(1, 'Kategori seçin'),
  brandId: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
  price: z.string().min(1, 'Fiyat giriniz').transform(Number),
  originalPrice: z.string().optional().transform(v => v ? Number(v) : undefined),
  city: z.string().optional(),
  district: z.string().optional(),
  sizeLabel: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CONDITIONS = [
  { value: 'NEW', label: 'Sıfır' },
  { value: 'LIKE_NEW', label: 'Sıfır Gibi' },
  { value: 'GOOD', label: 'İyi' },
  { value: 'FAIR', label: 'Makul' },
];

const MAX_IMAGES = 8;

const card: React.CSSProperties = {
  background: 'var(--bg-1)', border: '1px solid var(--line)',
  borderRadius: 'var(--radius-m)', padding: 24, marginBottom: 16,
};
const label: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: 'var(--ink-2)', marginBottom: 7, fontFamily: 'var(--font-display)',
};
const inputSt = (err?: boolean): React.CSSProperties => ({
  width: '100%', height: 44, padding: '0 14px',
  background: 'var(--bg-0)', border: `1px solid ${err ? 'var(--bad)' : 'var(--line)'}`,
  borderRadius: 'var(--radius-s)', color: 'var(--ink)', fontSize: 14, outline: 'none',
});
const selectSt: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 36px 0 14px',
  background: 'var(--bg-0)', border: '1px solid var(--line)',
  borderRadius: 'var(--radius-s)', color: 'var(--ink)', fontSize: 14,
  outline: 'none', appearance: 'none',
};
const errTxt: React.CSSProperties = { marginTop: 5, fontSize: 12, color: 'var(--bad)', fontFamily: 'var(--font-mono)' };

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  /** Adres -> kadraj eslemesi; ilan verme ekranindakiyle ayni bicim. */
  const [kadrajlar, setKadrajlar] = useState<Record<string, Kadraj>>({});
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => api.get(`/listings/${id}`).then(r => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/listings/meta/categories').then(r => r.data),
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api.get('/listings/meta/brands').then(r => r.data),
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(schema),
  });
  const watchedCity = watch('city');

  useEffect(() => {
    if (listing && !initialized) {
      reset({
        title: listing.title ?? '',
        description: listing.description ?? '',
        categoryId: listing.categoryId ?? '',
        brandId: listing.brandId ?? '',
        condition: listing.condition ?? 'GOOD',
        price: String(listing.price ?? ''),
        originalPrice: listing.originalPrice ? String(listing.originalPrice) : '',
        city: listing.city ?? '',
        district: listing.district ?? '',
        sizeLabel: listing.sizeLabel ?? '',
      });
      setImageUrls(listing.images?.map((img: any) => img.url) ?? []);
      // Kayitli kadrajlar geri yukleniyor: duzenlemeye giren kullanici
      // daha once sectigi kadraji kaybetmiyor ve yeniden duzenlerken
      // ORIJINAL fotograf uzerinden calisiyor.
      setKadrajlar(
        Object.fromEntries(
          (listing.images ?? [])
            .map((img: any) => [img.url, kadrajOku(img.crop)])
            .filter(([, k]: any) => k),
        ) as Record<string, Kadraj>,
      );
      setInitialized(true);
    }
  }, [listing, initialized, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/listings/${id}`, data).then(r => r.data),
    onSuccess: () => {
      toast.success('İlan güncellendi, onay bekleniyor');
      qc.invalidateQueries({ queryKey: ['myListings'] });
      qc.invalidateQueries({ queryKey: ['listing', id] });
      router.push('/ilanlarim');
    },
    // Hata durumunda yonlendirme YOK: kullanicinin yaptigi
    // degisiklikler formda duruyor, tekrar deneyebiliyor.
    onError: (e: any) =>
      toast.error(e?.response?.data?.message || 'İlan güncellenemedi — değişikliklerin duruyor, tekrar deneyebilirsin'),
  });


  const onSubmit = async (data: FormData) => {
    if (imageUrls.length === 0) { toast.error('En az bir fotoğraf ekleyin'); return; }
    updateMutation.mutate({ ...data, imageUrls, imageCrops: kadrajlar });
  };

  if (isLoading) {
    return (
      <div className="m-wrap" style={{ maxWidth: 720, paddingTop: 36 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ height: 100, background: 'var(--bg-1)', borderRadius: 14, border: '1px solid var(--line)', marginBottom: 16, animation: 'pulse 1.5s ease infinite' }} />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="m-wrap" style={{ maxWidth: 720, paddingTop: 60, textAlign: 'center' }}>
        <p style={{ color: 'var(--ink-3)' }}>İlan bulunamadı.</p>
        <Link href="/ilanlarim" style={{ color: 'var(--accent)', fontSize: 14 }}>← İlanlarıma dön</Link>
      </div>
    );
  }

  return (
    <div className="m-wrap" style={{ maxWidth: 720, paddingTop: 36, paddingBottom: 90 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href="/ilanlarim" style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink-2)', textDecoration: 'none' }}>
          <ArrowLeft size={17} />
        </Link>
        <div>
          <h1 className="m-display" style={{ fontSize: 24, color: 'var(--ink)', marginBottom: 2 }}>İlanı Düzenle</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>Değişiklikler admin onayına gönderilir.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Fotograflar — ilan verme ekraniyla AYNI bilesen.
            Onceden burada kapak secme, siralama ve kadraj yoktu:
            kullanici ilani duzenlemeye girdiginde yeni ilan
            ekranindaki yeteneklerin yarisini kaybediyordu. */}
        <div style={card}>
          <FotografYoneticisi
            deger={{ urller: imageUrls, kadrajlar }}
            onDegis={(d: FotografDurumu) => { setImageUrls(d.urller); setKadrajlar(d.kadrajlar); }}
            onMesgul={setUploading}
          />
          <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 14, lineHeight: 1.55 }}>
            Fotoğraf veya kadraj değişikliği moderasyon onayına gider. Onaylanana kadar
            ilanında <strong>şu anki onaylı görseller</strong> yayında kalmaya devam eder.
          </p>
        </div>

        {/* İlan Bilgileri */}
        <div style={card}>
          <p style={{ ...label, fontSize: 15, marginBottom: 16 }}>İlan Bilgileri</p>
          <div style={{ marginBottom: 16 }}>
            <label style={label}>Başlık *</label>
            <input {...register('title')} style={inputSt(!!errors.title)} />
            {errors.title && <p style={errTxt}>{errors.title.message as string}</p>}
          </div>
          <div>
            <label style={label}>Açıklama *</label>
            <textarea {...register('description')} rows={4} style={{ ...inputSt(!!errors.description), height: 'auto', padding: '12px 14px', resize: 'vertical' }} />
            {errors.description && <p style={errTxt}>{errors.description.message as string}</p>}
          </div>
        </div>

        {/* Kategori & Marka */}
        <div className="m-grid-1-mobile" style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={label}>Kategori *</label>
            <div style={{ position: 'relative' }}>
              <select {...register('categoryId')} style={selectSt}>
                <option value="">Seçin…</option>
                {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
            </div>
            {errors.categoryId && <p style={errTxt}>{errors.categoryId.message as string}</p>}
          </div>
          <div>
            <label style={label}>Marka</label>
            <div style={{ position: 'relative' }}>
              <select {...register('brandId')} style={selectSt}>
                <option value="">Seçin…</option>
                {brands?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* Durum, Beden, Şehir */}
        <div className="m-grid-2-mobile" style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <label style={label}>Durum *</label>
            <div style={{ position: 'relative' }}>
              <select {...register('condition')} style={selectSt}>
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={label}>Beden</label>
            <input {...register('sizeLabel')} style={inputSt()} placeholder="S, M, 42, XL…" />
          </div>
          <div>
            <label style={label}>İl</label>
            <div style={{ position: 'relative' }}>
              <select {...register('city', { onChange: () => setValue('district', '') })} style={selectSt}>
                <option value="">İl seçiniz</option>
                {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={label}>İlçe</label>
            <div style={{ position: 'relative' }}>
              <select {...register('district')} disabled={!watchedCity} style={selectSt}>
                <option value="">{watchedCity ? 'İlçe seçiniz' : 'İl seçiniz'}</option>
                {(watchedCity ? IL_ILCE[watchedCity] ?? [] : []).map((d: string) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* Fiyat */}
        <div className="m-grid-1-mobile" style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={label}>Fiyat (₺) *</label>
            <input {...register('price')} type="number" style={inputSt(!!errors.price)} />
            {errors.price && <p style={errTxt}>{errors.price.message as string}</p>}
          </div>
          <div>
            <label style={label}>Orijinal Fiyat (₺) <span style={{ fontWeight: 400, opacity: 0.5 }}>opsiyonel</span></label>
            <input {...register('originalPrice')} type="number" style={inputSt()} />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || updateMutation.isPending}
          className="m-btn m-btn-primary"
          style={{ width: '100%', height: 52, fontSize: 16, fontWeight: 700, borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}
        >
          {(isSubmitting || updateMutation.isPending) ? (
            <span style={{ width: 20, height: 20, border: '2px solid var(--accent-ink)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
          ) : (
            <><Save size={18} />Değişiklikleri Kaydet</>
          )}
        </button>
      </form>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} option{background:var(--bg-1);color:var(--ink)}`}</style>
    </div>
  );
}
