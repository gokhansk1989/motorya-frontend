'use client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCreateListing } from '@/hooks/useListings';
import { Upload, X, ChevronDown, Zap, Camera, ImagePlus } from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { CoverCropModal } from '@/components/listings/CoverCropModal';

const schema = z.object({
  title: z.string().min(5, 'En az 5 karakter'),
  description: z.string().min(20, 'En az 20 karakter'),
  categoryId: z.string().min(1, 'Kategori seçin'),
  brandId: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  price: z.string().min(1, 'Fiyat giriniz').transform(Number),
  originalPrice: z.string().optional().transform(v => v ? Number(v) : undefined),
  city: z.string().optional(),
  sizeLabel: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CONDITIONS = [
  { value: 'NEW', label: 'Sıfır', color: 'var(--good)' },
  { value: 'LIKE_NEW', label: 'Sıfır Gibi', color: 'var(--accent-2)' },
  { value: 'GOOD', label: 'İyi', color: 'var(--accent)' },
  { value: 'FAIR', label: 'Orta', color: '#f59e0b' },
  { value: 'POOR', label: 'Kötü', color: 'var(--bad)' },
];

const MAX_IMAGES = 8;

const CITIES = [
  'Adana','Adıyaman','Afyonkarahisar','Ağrı','Aksaray','Amasya','Ankara','Antalya','Ardahan','Artvin',
  'Aydın','Balıkesir','Bartın','Batman','Bayburt','Bilecik','Bingöl','Bitlis','Bolu','Burdur',
  'Bursa','Çanakkale','Çankırı','Çorum','Denizli','Diyarbakır','Düzce','Edirne','Elazığ','Erzincan',
  'Erzurum','Eskişehir','Gaziantep','Giresun','Gümüşhane','Hakkari','Hatay','Iğdır','Isparta','İstanbul',
  'İzmir','Kahramanmaraş','Karabük','Karaman','Kars','Kastamonu','Kayseri','Kilis','Kırıkkale','Kırklareli',
  'Kırşehir','Kocaeli','Konya','Kütahya','Malatya','Manisa','Mardin','Mersin','Muğla','Muş',
  'Nevşehir','Niğde','Ordu','Osmaniye','Rize','Sakarya','Samsun','Şanlıurfa','Siirt','Sinop',
  'Şırnak','Sivas','Tekirdağ','Tokat','Trabzon','Tunceli','Uşak','Van','Yalova','Yozgat','Zonguldak',
];

const card: React.CSSProperties = {
  background: 'var(--bg-1)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-m)',
  padding: 24,
  marginBottom: 16,
};

const label: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: 'var(--ink-2)', marginBottom: 7,
  fontFamily: 'var(--font-display)',
};

const inputSt = (err?: boolean): React.CSSProperties => ({
  width: '100%', height: 44, padding: '0 14px',
  background: 'var(--bg-0)', border: `1px solid ${err ? 'var(--bad)' : 'var(--line)'}`,
  borderRadius: 'var(--radius-s)', color: 'var(--ink)', fontSize: 14, outline: 'none',
});

const errTxt: React.CSSProperties = { marginTop: 5, fontSize: 12, color: 'var(--bad)', fontFamily: 'var(--font-mono)' };

export default function CreateListingPage() {
  const router = useRouter();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [cropQueue, setCropQueue] = useState<{ coverFile: File; rest: File[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const createListing = useCreateListing();

  const uploadFiles = async (toUpload: File[]) => {
    setUploading(true);
    try {
      const form = new FormData();
      toUpload.forEach(f => form.append('files', f));
      const res = await api.post('/upload/images', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrls(prev => [...prev, ...res.data.urls]);
    } catch {
      toast.error('Fotoğraf yüklenemedi');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_IMAGES - imageUrls.length;
    if (remaining <= 0) { toast.error(`En fazla ${MAX_IMAGES} fotoğraf ekleyebilirsiniz`); return; }
    const selected = Array.from(files).slice(0, remaining);

    // İlk (kapak) fotoğraf seçiliyorsa önce kırpma fırsatı ver
    if (imageUrls.length === 0) {
      const [coverFile, ...rest] = selected;
      setCropQueue({ coverFile, rest });
      return;
    }

    await uploadFiles(selected);
  };

  const handleCropConfirm = async (cropped: File) => {
    if (!cropQueue) return;
    const { rest } = cropQueue;
    setCropQueue(null);
    await uploadFiles([cropped, ...rest]);
  };

  const handleCropSkip = async () => {
    if (!cropQueue) return;
    const { coverFile, rest } = cropQueue;
    setCropQueue(null);
    await uploadFiles([coverFile, ...rest]);
  };

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/listings/meta/categories').then(r => r.data),
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api.get('/listings/meta/brands').then(r => r.data),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: { condition: 'GOOD' },
  });

  const onSubmit = async (data: FormData) => {
    if (imageUrls.length === 0) { toast.error('En az bir fotoğraf ekleyin'); return; }
    try {
      const listing = await createListing.mutateAsync({
        ...data,
        brandId: data.brandId || undefined,
        city: data.city || undefined,
        sizeLabel: data.sizeLabel || undefined,
        imageUrls,
      });
      toast.success('İlanınız oluşturuldu, onay bekleniyor');
      router.push(`/ilan/${listing.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'İlan oluşturulamadı'));
    }
  };

  const selectSt: React.CSSProperties = {
    width: '100%', height: 44, padding: '0 36px 0 14px',
    background: 'var(--bg-0)', border: '1px solid var(--line)',
    borderRadius: 'var(--radius-s)', color: 'var(--ink)', fontSize: 14,
    outline: 'none', appearance: 'none',
  };

  return (
    <div className="m-wrap" style={{ maxWidth: 720, paddingTop: 36, paddingBottom: 60 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="m-display" style={{ fontSize: 28, color: 'var(--ink)', marginBottom: 6 }}>İlan Ver</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Ekipmanını hızlıca sat, topluluğa katıl.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Fotoğraflar */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ ...label, fontSize: 15, margin: 0 }}>Fotoğraflar</p>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: imageUrls.length >= MAX_IMAGES ? 'var(--bad)' : 'var(--ink-3)' }}>
              {imageUrls.length}/{MAX_IMAGES} görsel
            </span>
          </div>

          {/* Gizli input'lar */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />

          {/* Butonlar */}
          {imageUrls.length < MAX_IMAGES && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="m-btn"
                style={{ flex: 1, gap: 8, justifyContent: 'center' }}
              >
                <ImagePlus size={17} />
                <span>Galeriden Seç</span>
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
                className="m-btn"
                style={{ flex: 1, gap: 8, justifyContent: 'center' }}
              >
                <Camera size={17} />
                <span>Kamera</span>
              </button>
            </div>
          )}

          {/* Yükleme göstergesi */}
          {uploading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 8, marginBottom: 12, fontSize: 13, color: 'var(--ink-3)' }}>
              <span style={{ width: 16, height: 16, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
              Fotoğraflar yükleniyor…
            </div>
          )}

          {/* Önizleme grid */}
          {imageUrls.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10 }}>
              {imageUrls.map((url, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: 'var(--bg-2)', border: i === 0 ? '2px solid var(--accent)' : '1px solid var(--line)' }}>
                  <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  <button
                    type="button"
                    onClick={() => setImageUrls(p => p.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, background: 'oklch(0 0 0 / 0.65)', border: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#fff', backdropFilter: 'blur(4px)' }}
                  >
                    <X size={12} />
                  </button>
                  {i === 0 && (
                    <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 10, fontFamily: 'var(--font-mono)', background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: 4, padding: '2px 5px', letterSpacing: '0.04em' }}>KAPAK</span>
                  )}
                </div>
              ))}
            </div>
          ) : !uploading && (
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed var(--line)', borderRadius: 12, padding: '36px 0', textAlign: 'center', color: 'var(--ink-3)', cursor: 'pointer', transition: 'border-color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}
            >
              <Upload size={30} style={{ margin: '0 auto 10px', opacity: 0.35 }} />
              <p style={{ fontSize: 14, fontWeight: 500 }}>Fotoğraf ekle</p>
              <p style={{ fontSize: 12, opacity: 0.55, marginTop: 4 }}>En fazla {MAX_IMAGES} fotoğraf · JPG, PNG, WebP · Maks 10 MB</p>
            </div>
          )}
        </div>

        {/* İlan Bilgileri */}
        <div style={card}>
          <p style={{ ...label, fontSize: 15, marginBottom: 16 }}>İlan Bilgileri</p>
          <div style={{ marginBottom: 16 }}>
            <label style={label}>Başlık *</label>
            <input {...register('title')} style={inputSt(!!errors.title)} placeholder="Örn: Shoei GT-Air II M beden kask" />
            {errors.title && <p style={errTxt}>{errors.title.message as string}</p>}
          </div>
          <div>
            <label style={label}>Açıklama *</label>
            <textarea
              {...register('description')}
              rows={4}
              style={{ ...inputSt(!!errors.description), height: 'auto', padding: '12px 14px', resize: 'vertical' }}
              placeholder="Ürün hakkında detaylı bilgi verin — kullanım süresi, hasar durumu, satış nedeni…"
            />
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
            <label style={label}>Şehir</label>
            <div style={{ position: 'relative' }}>
              <select {...register('city')} style={selectSt}>
                <option value="">Seçin…</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>

        {/* Fiyat */}
        <div className="m-grid-1-mobile" style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={label}>Fiyat (₺) *</label>
            <input {...register('price')} type="number" style={inputSt(!!errors.price)} placeholder="0" />
            {errors.price && <p style={errTxt}>{errors.price.message as string}</p>}
          </div>
          <div>
            <label style={label}>Orijinal Fiyat (₺) <span style={{ fontWeight: 400, opacity: 0.5 }}>opsiyonel</span></label>
            <input {...register('originalPrice')} type="number" style={inputSt()} placeholder="0" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || createListing.isPending}
          className="m-btn m-btn-primary"
          style={{ width: '100%', height: 52, fontSize: 16, fontWeight: 700, borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}
        >
          {(isSubmitting || createListing.isPending) ? (
            <span style={{ width: 20, height: 20, border: '2px solid var(--accent-ink)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
          ) : (
            <><Zap size={20} fill="currentColor" strokeWidth={0} />İlanı Yayınla</>
          )}
        </button>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } option { background: var(--bg-1); color: var(--ink); }`}</style>

      {cropQueue && (
        <CoverCropModal
          file={cropQueue.coverFile}
          onConfirm={handleCropConfirm}
          onSkip={handleCropSkip}
        />
      )}
    </div>
  );
}
