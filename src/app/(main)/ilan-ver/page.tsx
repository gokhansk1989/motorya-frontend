'use client';
import { useRouter } from 'next/navigation';
import { girisAdresi } from '@/lib/donus';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCreateListing, usePriceGuide } from '@/hooks/useListings';
import { Upload, X, ChevronDown, Zap, Camera, ImagePlus, ChevronRight, Check } from 'lucide-react';
import { useRef, useState, useMemo, useEffect } from 'react';
import { gecerliTcKimlik } from '@/lib/tcKimlik';
import toast from 'react-hot-toast';
import { CoverCropModal } from '@/components/listings/CoverCropModal';
import { IL_ILCE, ALL_CITIES } from '@/lib/il-ilce';
import { analytics } from '@/lib/analytics';
import { olc, olcumBosalt, rastgeleKimlik, fotoHataKodu } from '@/lib/olcum';
import { olcuAlani, cinsiyetAlaniGosterilsinMi } from '@/lib/kategoriAlanlari';
import { markalariGrupla } from '@/lib/markaGruplama';
import { taslagiGetir, taslagiKaydet, taslagiSil, taslakDoluMu, taslakZamani, type Taslak } from '@/lib/taslak';
import { useAuthStore } from '@/store/auth';
import { formatPrice } from '@/lib/utils';

type Category = { id: string; name: string; slug: string; parentId: string | null; };

function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/listings/meta/categories').then(r => r.data),
  });
}

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
  background: 'var(--bg-1)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--radius-m)',
  padding: 24,
  marginBottom: 16,
};

const lbl: React.CSSProperties = {
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

const selectSt: React.CSSProperties = {
  width: '100%', height: 44, padding: '0 36px 0 14px',
  background: 'var(--bg-0)', border: '1px solid var(--line)',
  borderRadius: 'var(--radius-s)', color: 'var(--ink)', fontSize: 14,
  outline: 'none', appearance: 'none',
};

const STEPS = ['Kategori', 'Fotoğraflar', 'Detaylar', 'Fiyat'];

function WizardProgress({ step }: { step: number }) {
  return (
    <div className="wizard-steps">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="wizard-step" style={{ flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div
              className={`wizard-step__dot ${done ? 'wizard-step__dot--done' : active ? 'wizard-step__dot--active' : 'wizard-step__dot--inactive'}`}
            >
              {done ? <Check size={14} strokeWidth={2.5} /> : n}
            </div>
            <span className="wizard-step__label" style={{ color: active ? 'var(--ink)' : undefined, fontWeight: active ? 600 : 400 }}>{label}</span>
            {i < STEPS.length - 1 && (
              <div className={`wizard-step__line ${done ? 'wizard-step__line--done' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Gonderim oncesi ozet.
 *
 * Son adimda fiyat alanlarindan dogrudan gonder dugmesine geciliyordu:
 * kullanici uc adim once sectigi kategoriyi ya da yukledigi fotografi
 * gormeden ilani gonderiyordu. Ozet, gonderilecek seyin tamamini tek
 * ekranda gosteriyor ve her bolum duzenlemeye geri donuyor - veriler
 * korunuyor, cunku adimlar DOM'dan cikmiyor, yalnizca gizleniyor.
 */
function OzetSatiri({ etiket, deger, adim, adimaGit }: {
  etiket: string; deger?: React.ReactNode; adim: number; adimaGit: (n: number) => void;
}) {
  const bos = deger === undefined || deger === null || deger === '' ;
  return (
    <div className="m-ozet-satir">
      <span className="m-ozet-etiket" style={{ fontSize: 12.5, color: 'var(--ink-3)', fontFamily: 'var(--font-display)' }}>{etiket}</span>
      <span className="m-ozet-deger" style={{ fontSize: 13.5, color: bos ? 'var(--ink-3)' : 'var(--ink)', minWidth: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>
        {bos ? '—' : deger}
      </span>
      <button
        type="button"
        onClick={() => adimaGit(adim)}
        aria-label={`${etiket} alanını düzenle`}
        style={{ background: 'none', border: 0, padding: '0 0 0 8px', color: 'var(--accent)', fontSize: 12.5, cursor: 'pointer', fontFamily: 'var(--font-display)' }}
        className="m-ozet-eylem"
      >
        Düzenle
      </button>
    </div>
  );
}

export default function CreateListingPage() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);
  // Kullanici login degilse dogrudan girise gonder; formu doldurup submitte
  // 401 gormek yerine baslangicta yonlendiriyoruz. Zustand persist henuz
  // hydrate olmadan kontrol edilirse false pozitif redirect olur; hydrate'i
  // bekliyoruz.
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    const check = () => {
      setAuthReady(true);
      if (!useAuthStore.getState().user) router.replace(girisAdresi({ hedef: '/ilan-ver', niyet: 'ilan-ver' }));
    };
    if (useAuthStore.persist.hasHydrated()) check();
    else return useAuthStore.persist.onFinishHydration(check);
  }, [router]);
  // TC Kimlik yoksa backend POST /listings 400 doner. Formu doldurup submit
  // ettikten sonra hata almaktansa acilista kontrol edelim.
  const { data: me, isLoading: meYukleniyor, isError: meHata } = useQuery({
    queryKey: ['me-tc-check'],
    queryFn: () => api.get('/users/me').then(r => r.data),
    enabled: !!user,
    staleTime: 30_000,
  });

  // Akis kimligi: tek bir ilan verme girisiminin olaylarini birbirine
  // bagliyor. Yalnizca bellekte duruyor - cerez/localStorage kullanilmiyor,
  // bu yuzden yeni bir takip mekanizmasi baslatmiyor. Sayfa yenilenince yeni
  // bir kimlik dogar; sunucu ayni kullanicinin 30 dakika icindeki akislarini
  // tek girisim sayarak yenilemenin sayilari sismesini engelliyor.
  const akisId = useRef<string>('');
  if (!akisId.current) akisId.current = rastgeleKimlik();
  const akisBasladi = useRef(false);
  // Cift tiklama ve Enter tekrarlari ayni ilani iki kez olusturmasin.
  // Dugmenin disabled olmasi tek basina yetmiyor: iki tiklama ayni render
  // doneminde gelirse ikisi de gecer. Ref senkron okunup yazildigi icin
  // arada render beklemiyor.
  const gonderimDevamEdiyor = useRef(false);

  // ── Taslak ────────────────────────────────────────────────────────
  // Taslak sunucuda duruyor (lib/taslak.ts). Burada uc durum var:
  //   null     -> henuz bakilmadi
  //   Taslak   -> dolu bir taslak bulundu, kullaniciya soruluyor
  //   'yok'    -> taslak yok ya da karar verildi, form normal acik
  const [taslak, setTaslak] = useState<Taslak | null>(null);
  const [taslakDurumu, setTaslakDurumu] = useState<'bakiliyor' | 'soruluyor' | 'hazir'>('bakiliyor');

  const [step, setStep] = useState(1);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [cropQueue, setCropQueue] = useState<{ coverFile: File; rest: File[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const createListing = useCreateListing();

  const [selL1, setSelL1] = useState('');
  const [selL2, setSelL2] = useState('');
  const [gender, setGender] = useState('');

  // Formun gercekten acildigi an olculuyor: oturum hazir, T.C. kapisi
  // gecilmis. Aksi halde girise yonlendirilen ya da kapiya dusen kullanici da
  // "ilan vermeye baslamis" sayilir ve tamamlama orani oldugundan dusuk
  // gorunurdu.
  useEffect(() => {
    if (akisBasladi.current) return;
    if (!authReady || !user || !me || !me.tcKimlikVar) return;
    akisBasladi.current = true;
    olc('ilan_akis_basladi', undefined, akisId.current);
  }, [authReady, user, me]);

  const uploadFiles = async (toUpload: File[]) => {
    setUploading(true);
    try {
      const form = new FormData();
      toUpload.forEach(f => form.append('files', f));
      const res = await api.post('/upload/images', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrls(prev => [...prev, ...res.data.urls]);
      olc('ilan_foto_yuklendi', { adet: res.data.urls?.length ?? toUpload.length }, akisId.current);
    } catch (err) {
      // Yalnizca kaba hata kodu olculuyor; dosya adi, boyut ve sunucu mesaji
      // gonderilmiyor.
      olc('ilan_foto_hata', { hataKodu: fotoHataKodu(err) }, akisId.current);
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

  const { data: allCategories = [] } = useCategories();
  // Marka listesi secilen kategoriye gore SIRALANIYOR, kisalmiyor: 154
  // markanin tamami geliyor, o kategoride yaygin olanlar basa aliniyor.
  // Kategori henuz secilmemisse duz alfabetik liste.
  const { data: brands } = useQuery({
    queryKey: ['brands', selL2 || selL1 || ''],
    queryFn: () => api
      .get('/listings/meta/brands', { params: (selL2 || selL1) ? { categoryId: selL2 || selL1 } : {} })
      .then(r => r.data),
  });
  const markaGruplari = useMemo(() => markalariGrupla(brands), [brands]);

  const l1Cats = useMemo(() => allCategories.filter(c => !c.parentId), [allCategories]);
  const l2Cats = useMemo(() => allCategories.filter(c => c.parentId === selL1), [allCategories, selL1]);
  // Alt kategorisi olan bir ana kategori secildiyse alt kategori ZORUNLU.
  // Arama ana kategoriyi alt kategorileriyle cozuyor, yani ana kategoriye
  // yazilan ilan "Topcase" filtresinde hic gorunmuyor - satici icin sessiz
  // bir kayip. Sunucu da ayni kurali uyguluyor.
  const altKategoriZorunlu = l2Cats.length > 0;

  // Ozellik alanlari ana kategoriye gore belirleniyor (lib/kategoriAlanlari).
  // Onceki liste 'casual-giyim' ve 'mx-off-road' gibi artik var olmayan
  // slug'lar tasiyordu; beden alani ise hic kosula bagli degildi, Topcase
  // ilaninda bile "S, M, 42, XL…" ornegi cikiyordu.
  const l1Slug = useMemo(() => allCategories.find(c => c.id === selL1)?.slug ?? '', [allCategories, selL1]);
  const olcu = olcuAlani(l1Slug);
  const showGender = cinsiyetAlaniGosterilsinMi(l1Slug);

  const { register, handleSubmit, setValue, watch, trigger, clearErrors, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: { condition: 'GOOD' },
  });
  const watchedCategoryId = watch('categoryId');
  const watchedBrandId = watch('brandId');
  const watchedCity = watch('city');
  // Ozet icin: gonderim oncesi kullaniciya ne gonderecegini gostermek
  // istiyoruz, bu yuzden alanlari izliyoruz.
  const ozetDegerleri = watch(['title', 'description', 'condition', 'price', 'originalPrice', 'city', 'district', 'sizeLabel']);
  const { data: priceGuide } = usePriceGuide(watchedCategoryId, watchedBrandId || undefined);

  useEffect(() => {
    const finalId = selL2 || selL1 || '';
    setValue('categoryId', finalId, { shouldValidate: !!finalId });
  }, [selL1, selL2, setValue]);

  function handleL1Change(id: string) {
    setSelL1(id); setSelL2(''); setGender('');
    // Olcu alani kategoriye gore degistigi icin eski deger tasinmamali:
    // mont icin "L" yazip cantaya gecen kullanicinin ilani "L kapasiteli
    // topcase" olarak kaydedilirdi.
    setValue('sizeLabel', '');
  }

  // Taslagi bir kez oku. Oturum hazir olmadan okumak anlamsiz: taslak
  // kullaniciya ait, jetonsuz istek bos doner.
  useEffect(() => {
    if (!authReady || !user || !me?.tcKimlikVar) return;
    let iptal = false;
    (async () => {
      const t = await taslagiGetir();
      if (iptal) return;
      if (taslakDoluMu(t)) { setTaslak(t); setTaslakDurumu('soruluyor'); }
      else setTaslakDurumu('hazir');
    })();
    return () => { iptal = true; };
  }, [authReady, user, me?.tcKimlikVar]);

  // Otomatik kaydetme: adim degisince ve yazmaya ara verilince.
  //
  // Her tusa basista kaydetmek sunucuyu gereksiz mesgul eder; hic
  // kaydetmemek de sayfa yenilenince formu kaybettirir. 1,5 saniyelik
  // bekleme ikisinin arasi.
  const kaydetZamani = useRef<ReturnType<typeof setTimeout> | null>(null);
  const izlenen = watch();
  useEffect(() => {
    if (taslakDurumu !== 'hazir') return;          // karar verilmeden yazma
    if (gonderimDevamEdiyor.current) return;       // gonderim sirasinda yazma
    // Bos formu kaydetme. Formu acip hicbir sey yazmadan cikan herkes
    // icin bir taslak satiri acmak hem gereksiz, hem de bir sonraki
    // ziyarette "devam et" teklifi gosterilmese bile tabloyu sisirir.
    const doluMu =
      imageUrls.length > 0 ||
      !!selL1 ||
      Object.values(izlenen as Record<string, unknown>).some(
        (v) => typeof v === 'string' && v.trim().length > 0 && v !== 'GOOD',
      );
    if (!doluMu) return;

    if (kaydetZamani.current) clearTimeout(kaydetZamani.current);
    kaydetZamani.current = setTimeout(() => {
      void taslagiKaydet({
        payload: {
          ...izlenen,
          categoryId: selL1 || '',
          altKategoriId: selL2 || '',
          gender: gender || '',
        },
        imageUrls,
        step,
      });
    }, 1500);
    return () => { if (kaydetZamani.current) clearTimeout(kaydetZamani.current); };
  }, [taslakDurumu, izlenen, imageUrls, step, selL1, selL2, gender]);

  /** "Taslagina devam et": kaydedilmis degerleri forma yaz. */
  const taslagaDevamEt = () => {
    if (!taslak) return;
    const p = (taslak.payload ?? {}) as Record<string, string>;
    if (p.categoryId) setSelL1(p.categoryId);
    if (p.altKategoriId) setSelL2(p.altKategoriId);
    if (p.gender) setGender(p.gender);
    for (const alan of ['title', 'description', 'brandId', 'condition', 'sizeLabel', 'city', 'district', 'price', 'originalPrice'] as const) {
      if (p[alan]) setValue(alan, p[alan]);
    }
    setImageUrls(taslak.imageUrls ?? []);
    setStep(Math.min(Math.max(taslak.step ?? 1, 1), 4));
    setTaslakDurumu('hazir');
  };

  /** "Yeni ilan baslat": taslagi sil, formu bos birak. */
  const yeniIlanBaslat = async () => {
    setTaslakDurumu('hazir');
    setTaslak(null);
    await taslagiSil();
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!selL1) {
        olc('ilan_form_hatasi', { alan: 'categoryId', kod: 'zorunlu' }, akisId.current);
        toast.error('Lütfen bir kategori seçin'); return;
      }
      if (altKategoriZorunlu && !selL2) {
        olc('ilan_form_hatasi', { alan: 'altKategori', kod: 'zorunlu' }, akisId.current);
        toast.error('Lütfen alt kategori seçin — ilanın doğru listede görünmesi için gerekli');
        return;
      }
    }
    if (step === 2) {
      if (imageUrls.length === 0) {
        olc('ilan_form_hatasi', { alan: 'imageUrls', kod: 'zorunlu' }, akisId.current);
        toast.error('En az bir fotoğraf ekleyin'); return;
      }
    }
    if (step === 3) {
      const ok = await trigger(['title', 'description']);
      if (!ok) {
        // Alan adi ve hata turu; kullanicinin yazdigi metin hicbir zaman
        // gonderilmiyor.
        for (const alan of ['title', 'description'] as const) {
          const tur = (errors as any)?.[alan]?.type;
          if (tur) olc('ilan_form_hatasi', { alan, kod: String(tur) }, akisId.current);
        }
        return;
      }
    }
    olc('ilan_adim_tamamlandi', { adim: step }, akisId.current);
    // Yeni adim temiz acilsin: o adimin alanlarinda onceki bir dogrulamadan
    // kalmis hata varsa kullanici henuz hicbir sey yapmadan hatayla
    // karsilasiyor.
    if (step === 3) clearErrors(['price', 'originalPrice']);
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ozetten bir bolume donus. Adimlar DOM'dan cikmadigi icin girilen
  // bilgiler korunuyor; dogrulama hatasi tasimamak icin o adimin
  // alanlarindaki eski hatalar temizleniyor.
  const adimaGit = (n: number) => {
    if (n === 4) clearErrors(['price', 'originalPrice']);
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (data: FormData) => {
    if (imageUrls.length === 0) { toast.error('En az bir fotoğraf ekleyin'); return; }
    if (gonderimDevamEdiyor.current) return;
    gonderimDevamEdiyor.current = true;
    try {
      const olusan = await createListing.mutateAsync({
        ...data,
        brandId: data.brandId || undefined,
        city: data.city || undefined,
        sizeLabel: data.sizeLabel || undefined,
        gender: gender || undefined,
        imageUrls,
      });
      // Basari dugmeye tiklamayla degil, sunucunun ilani olusturup kimligini
      // dondurmesiyle sayiliyor. 4. adim (Fiyat) ayri "adim tamamlandi"
      // olayi uretmiyor; onun tamamlanmasi bu olayin kendisi.
      olc('ilan_gonderildi', { listingId: (olusan as any)?.id }, akisId.current);
      olcumBosalt();
      // Ilan olustu; taslak artik gereksiz. BASARISIZ gonderimde
      // silinmiyor (catch dalinda yok) - kullanici formu kaybetmesin.
      void taslagiSil();
      analytics.listingCreated({ price: Number(data.price) || undefined });
      // "Yayinlandi" demiyoruz: ilan PENDING_REVIEW durumunda, moderasyondan
      // gecmeden kimse goremiyor. Gonderildi ile yayinlandi ayri.
      toast.success('İlanın onaya gönderildi. Onaylandığında yayına alınacak ve sana haber vereceğiz.');
      router.push('/ilanlarim');
    } catch (err: any) {
      olc('ilan_form_hatasi', { alan: 'gonderim', kod: String(err?.response?.status ?? 'ag') }, akisId.current);
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'İlan oluşturulamadı'));
      // Hata halinde kilidi birak: kullanici duzeltip tekrar gonderebilsin.
      // Basaride birakmiyoruz, zaten /ilanlarim'a gidiyoruz.
      gonderimDevamEdiyor.current = false;
    }
  };

  // Tum hook'lar cagrildiktan sonra guard: hooks order kuralini bozmuyoruz.
  if (!authReady || !user) return null;

  // Uygunluk BILINMEDEN form gosterilmiyor.
  //
  // Onceden kosul `me && !me.tcKimlikVar` idi: sorgu ucarken `me` undefined
  // oldugu icin kosul false kaliyor ve KATEGORI FORMU aciliyordu. Yanit
  // gelince ekran T.C. adimina atliyordu. Yerelde 76 ms, gercek agda
  // 300-800 ms suren bir kirpisma; kullanici yanlis formu goruyor ve
  // yazmaya baslayabiliyor.
  if (meYukleniyor || !me) {
    return (
      <div className="m-wrap" style={{ maxWidth: 720, paddingTop: 28, paddingBottom: 80 }}>
        <div style={{ marginBottom: 20 }}>
          <h1 className="m-display" style={{ fontSize: 26, color: 'var(--ink)', marginBottom: 4 }}>İlan Ver</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Hesabın hazırlanıyor…</p>
        </div>
        {/* Iskelet: formun yerini tutuyor, boylece yanit gelince sayfa
            zıplamiyor. */}
        <div className="m-form-card" style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }} aria-busy="true" aria-live="polite">
          <span style={{ width: 18, height: 18, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>İlan verme bilgileri kontrol ediliyor…</span>
        </div>
      </div>
    );
  }

  // Kontrol basarisizsa da form acilmiyor: eksik bilgiyle doldurulan formun
  // gonderimde reddedilmesi, en bastan soylemekten daha kotu.
  if (meHata) {
    return (
      <div className="m-wrap" style={{ maxWidth: 720, paddingTop: 28, paddingBottom: 80 }}>
        <div className="m-form-card" style={card}>
          <p className="m-display" style={{ fontSize: 18, marginBottom: 8 }}>Bilgilerine ulaşamadık</p>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 16, lineHeight: 1.6 }}>
            İlan verme kontrolü yapılamadı. Bağlantını kontrol edip tekrar dene.
          </p>
          <button type="button" onClick={() => window.location.reload()} className="m-btn m-btn-primary" style={{ height: 44, padding: '0 20px' }}>
            Tekrar dene
          </button>
        </div>
      </div>
    );
  }
  // TC kimlik numarasi ilan vermek icin gerekli. Onceden kullanici profile
  // yonlendiriliyordu: baska bir sayfaya gidip donmek, akisi kiriyordu.
  // Artik numara burada, akistan cikmadan alinabiliyor.
  // /users/me artik ham T.C. numarasini dondurmuyor (maskeleme sonrasi);
  // yalnizca tcKimlikVar bayragi geliyor. Eski alan adi okundugu surece
  // numarasi kayitli kullanicilar da bu kapiya dusuyordu.
  if (!me.tcKimlikVar) {
    return <TcKimlikAdimi />;
  }

  // Taslaga bakilirken formu acmiyoruz: acip sonra uzerine taslak yazmak,
  // kullanicinin yazdigini silmek olurdu.
  if (taslakDurumu === 'bakiliyor') {
    return (
      <div className="m-wrap" style={{ maxWidth: 720, paddingTop: 28, paddingBottom: 80 }}>
        <div className="m-form-card" style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }} aria-busy="true">
          <span style={{ width: 18, height: 18, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>Kayıtlı taslağın kontrol ediliyor…</span>
        </div>
      </div>
    );
  }

  if (taslakDurumu === 'soruluyor' && taslak) {
    const p = (taslak.payload ?? {}) as Record<string, string>;
    const ozet = [
      allCategories.find(c => c.id === (p.altKategoriId || p.categoryId))?.name,
      p.title,
      taslak.imageUrls?.length ? `${taslak.imageUrls.length} fotoğraf` : null,
    ].filter(Boolean);

    return (
      <div className="m-wrap" style={{ maxWidth: 560, paddingTop: 40, paddingBottom: 80 }}>
        <div className="m-form-card" style={card}>
          <h1 className="m-display" style={{ fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>
            Yarım kalmış bir ilanın var
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.6, marginBottom: 16 }}>
            {taslakZamani(taslak.updatedAt)} kaydedildi. Kaldığın yerden devam edebilir
            ya da sıfırdan başlayabilirsin.
          </p>

          {ozet.length > 0 && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 14px', background: 'var(--bg-2)', borderRadius: 10, marginBottom: 20 }}>
              {taslak.imageUrls?.[0] && (
                <img src={taslak.imageUrls[0]} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              )}
              <span style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, minWidth: 0 }}>
                {ozet.join(' · ')}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" onClick={taslagaDevamEt} className="m-btn m-btn-primary"
              style={{ flex: 1, minWidth: 170, height: 46, fontSize: 15, fontWeight: 700 }}>
              Taslağına devam et
            </button>
            <button type="button" onClick={() => { void yeniIlanBaslat(); }} className="m-btn m-btn-ghost"
              style={{ flex: 1, minWidth: 150, height: 46, fontSize: 15 }}>
              Yeni ilan başlat
            </button>
          </div>
          {/* "Yeni ilan baslat" taslagi siliyor; bunu soylemeden yapmak,
              kullanicinin isini geri alinamaz sekilde silmek olurdu. */}
          <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.5 }}>
            Yeni ilan başlatırsan kaydedilmiş taslak silinir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="m-wrap" style={{ maxWidth: 720, paddingTop: 28, paddingBottom: 80, overflowX: 'hidden' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 className="m-display" style={{ fontSize: 26, color: 'var(--ink)', marginBottom: 4 }}>İlan Ver</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Ekipmanını hızlıca sat, topluluğa katıl.</p>
      </div>

      <WizardProgress step={step} />

      {/* Ortulu gonderim son adimdan ONCE kesiliyor.

          Tarayici, metin alaninda Enter'a basildiginda formu submit ediyor.
          Dort adim tek <form> icinde durdugu icin handleSubmit TUM semayi
          dogruluyordu: kullanici 1. adimdayken fiyat hatasi GIZLI 4. adima
          yaziliyor, hicbir uyari gorunmuyor, sonra fiyat adimina gecince
          "Fiyat giriniz" hazir bekliyordu.

          Korumayi onSubmit'in ICINE koymak yetmiyor - olculdu, hata devam
          etti: handleSubmit dogrulamayi once yapiyor ve dogrulama
          basarisizsa onSubmit'i hic cagirmiyor, yani oradaki kontrol
          ulasilamaz. Kesme handleSubmit'ten ONCE olmali.

          Ortulu gonderimi "Devam"a cevirmek hem karismayi bitiriyor hem de
          Enter'in beklenen davranisini veriyor. */}
      <form
        onSubmit={(e) => {
          if (step < 4) {
            e.preventDefault();
            void handleNext();
            return;
          }
          return handleSubmit(onSubmit)(e);
        }}
      >

        {/* ── STEP 1: Kategori ── */}
        <div className="m-form-card" style={{ ...card, display: step === 1 ? 'block' : 'none' }}>
            <p style={{ ...lbl, fontSize: 15, marginBottom: 18 }}>Hangi kategoriye uyuyor?</p>
            <input type="hidden" {...register('categoryId')} />

            {/* L1 */}
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Ana Kategori</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selL1}
                  onChange={e => handleL1Change(e.target.value)}
                  style={{ ...selectSt, borderColor: errors.categoryId && !selL1 ? 'var(--bad)' : 'var(--line)' }}
                >
                  <option value="">Seçin…</option>
                  {l1Cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* L2 */}
            <div style={{ marginBottom: 14, opacity: l2Cats.length === 0 ? 0.35 : 1, transition: 'opacity .2s' }}>
              <label style={lbl}>
                Alt Kategori
                {selL1 && l2Cats.length === 0 && <span style={{ fontWeight: 400, color: 'var(--ink-3)', marginLeft: 6 }}>(yok)</span>}
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selL2}
                  onChange={e => setSelL2(e.target.value)}
                  disabled={l2Cats.length === 0}
                  style={{ ...selectSt, cursor: l2Cats.length === 0 ? 'not-allowed' : 'pointer' }}
                >
                  <option value="">Seçin…</option>
                  {l2Cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Cinsiyet */}
            {showGender && (
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Cinsiyet</label>
                <div style={{ position: 'relative' }}>
                  <select value={gender} onChange={e => setGender(e.target.value)} style={selectSt}>
                    <option value="">Belirtme</option>
                    <option value="ERKEK">Erkek</option>
                    <option value="KADIN">Kadın</option>
                    <option value="UNISEX">Unisex</option>
                    <option value="COCUK">Çocuk</option>
                  </select>
                  <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
                </div>
              </div>
            )}

            {selL1 && (
              <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ color: 'var(--accent)', fontSize: 10 }}>●</span>
                {[selL1, selL2].filter(Boolean).map(id => allCategories.find(c => c.id === id)?.name).filter(Boolean).join(' › ')}
                {gender && ` · ${gender === 'ERKEK' ? 'Erkek' : gender === 'KADIN' ? 'Kadın' : gender === 'COCUK' ? 'Çocuk' : 'Unisex'}`}
              </div>
            )}
          </div>

        {/* ── STEP 2: Fotoğraflar ── */}
        {/* Hidden inputs her zaman DOM'da kalmalı */}
        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />

        <div className="m-form-card" style={{ ...card, display: step === 2 ? 'block' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
              <p style={{ ...lbl, fontSize: 15, margin: 0 }}>Fotoğraflar</p>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: imageUrls.length >= MAX_IMAGES ? 'var(--bad)' : 'var(--ink-3)' }}>
                {imageUrls.length}/{MAX_IMAGES}
              </span>
            </div>

            {/* Empty state — big pick buttons */}
            {imageUrls.length === 0 && !uploading && (
              <div className="m-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <button type="button" className="photo-pick-btn" onClick={() => cameraInputRef.current?.click()}>
                  <Camera size={32} strokeWidth={1.5} />
                  <span>Fotoğraf Çek</span>
                </button>
                <button type="button" className="photo-pick-btn" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus size={32} strokeWidth={1.5} />
                  <span>Galeriden Seç</span>
                </button>
              </div>
            )}

            {/* Add more buttons */}
            {imageUrls.length > 0 && imageUrls.length < MAX_IMAGES && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="m-btn" style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
                  <ImagePlus size={17} /><span>Galeriden Seç</span>
                </button>
                <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={uploading} className="m-btn" style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
                  <Camera size={17} /><span>Kamera</span>
                </button>
              </div>
            )}

            {uploading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 8, marginBottom: 12, fontSize: 13, color: 'var(--ink-3)' }}>
                <span style={{ width: 16, height: 16, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                Fotoğraflar yükleniyor…
              </div>
            )}

            {imageUrls.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10 }}>
                {imageUrls.map((url, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: 'var(--bg-2)', border: i === 0 ? '2px solid var(--accent)' : '1px solid var(--line)' }}>
                    <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    <button type="button" onClick={() => setImageUrls(p => p.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, background: 'oklch(0 0 0 / 0.65)', border: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#fff' }}>
                      <X size={12} />
                    </button>
                    {i === 0 && <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 10, fontFamily: 'var(--font-mono)', background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: 4, padding: '2px 5px' }}>KAPAK</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* ── STEP 3: Detaylar — display:none ile gizle, DOM'dan çıkarma ── */}
        <div style={{ display: step === 3 ? 'block' : 'none' }}>
            {/* Başlık + Açıklama */}
            <div className="m-form-card" style={card}>
              <p style={{ ...lbl, fontSize: 15, marginBottom: 16 }}>İlan Bilgileri</p>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Başlık *</label>
                <input {...register('title')} style={inputSt(!!errors.title)} placeholder="Örn: Shoei GT-Air II M beden kask" />
                {errors.title && <p style={errTxt}>{errors.title.message as string}</p>}
              </div>
              <div>
                <label style={lbl}>Açıklama *</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  style={{ ...inputSt(!!errors.description), height: 'auto', padding: '12px 14px', resize: 'vertical' }}
                  placeholder="Ürün hakkında detaylı bilgi verin — kullanım süresi, hasar durumu, satış nedeni…"
                />
                {errors.description && <p style={errTxt}>{errors.description.message as string}</p>}
              </div>
            </div>

            {/* Marka */}
            <div className="m-form-card" style={card}>
              <p style={{ ...lbl, fontSize: 15, marginBottom: 14 }}>Marka</p>
              <div style={{ position: 'relative' }}>
                {/* optgroup: mobil tarayicilarin kendi secicisi de basliklari
                    gosteriyor, yani gruplama telefonda da calisiyor. Ozel bir
                    acilir liste yazmiyoruz - yerel secici erisilebilirlik ve
                    dokunma davranisi acisindan daha saglam. */}
                <select {...register('brandId')} style={selectSt}>
                  <option value="">Seçin…</option>
                  {markaGruplari.oneCikan.length > 0 && (
                    <optgroup label="Bu kategoride yaygın">
                      {markaGruplari.oneCikan.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </optgroup>
                  )}
                  {markaGruplari.oneCikan.length > 0 ? (
                    <optgroup label="Tüm markalar">
                      {markaGruplari.digerleri.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </optgroup>
                  ) : (
                    markaGruplari.digerleri.map(b => <option key={b.id} value={b.id}>{b.name}</option>)
                  )}
                </select>
                <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Durum, Beden, Şehir */}
            <div className="m-form-card" style={card}>
              <p style={{ ...lbl, fontSize: 15, marginBottom: 16 }}>Ürün Özellikleri</p>
              <div className="m-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={lbl}>Durum *</label>
                  <div style={{ position: 'relative' }}>
                    <select {...register('condition')} style={selectSt}>
                      {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
                  </div>
                </div>
                {olcu.tur !== 'yok' && (
                  <div>
                    <label style={lbl}>{olcu.etiket}</label>
                    <input {...register('sizeLabel')} style={inputSt()} placeholder={olcu.ipucu} />
                  </div>
                )}
                <div>
                  <label style={lbl}>İl</label>
                  <div style={{ position: 'relative' }}>
                    <select {...register('city', { onChange: () => setValue('district', '') })} style={selectSt}>
                      <option value="">İl seçiniz</option>
                      {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>İlçe</label>
                  <div style={{ position: 'relative' }}>
                    <select {...register('district')} disabled={!watchedCity} style={selectSt}>
                      <option value="">{watchedCity ? 'İlçe seçiniz' : 'İl seçiniz'}</option>
                      {(watchedCity ? IL_ILCE[watchedCity] ?? [] : []).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* ── STEP 4: Fiyat — display:none ile gizle ── */}
        <div className="m-form-card" style={{ ...card, display: step === 4 ? 'block' : 'none' }}>
            <p style={{ ...lbl, fontSize: 15, marginBottom: 18 }}>Fiyat Belirle</p>
            <div className="m-form-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 4 }}>
              <div>
                <label style={lbl}>Fiyat (₺) *</label>
                <input {...register('price')} type="number" style={inputSt(!!errors.price)} placeholder="0" />
                {errors.price && <p style={errTxt}>{errors.price.message as string}</p>}
              </div>
              <div>
                <label style={lbl}>Liste Fiyatı (₺) <span style={{ fontWeight: 400, opacity: 0.5 }}>opsiyonel</span></label>
                <input {...register('originalPrice')} type="number" style={inputSt()} placeholder="0" />
                <p style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 5, lineHeight: 1.5 }}>
                  Ürünün sıfır/etiket fiyatı. İlan sayfasında üstü çizili olarak
                  &ldquo;satıcının belirttiği liste fiyatı&rdquo; notuyla gösterilir.
                </p>
              </div>
            </div>

            {priceGuide && priceGuide.totalCount >= 3 && (
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'color-mix(in oklch, var(--accent) 6%, var(--bg-1))', border: '1px solid color-mix(in oklch, var(--accent) 20%, transparent)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 8 }}>
                  📊 Bu kategoride fiyat rehberi ({priceGuide.totalCount} ilan)
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {priceGuide.sold?.avg && (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 2 }}>Satılan ort.</div>
                      <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--good)' }}>
                        {formatPrice(Math.round(priceGuide.sold.avg))}
                      </div>
                    </div>
                  )}
                  {priceGuide.active?.avg && (
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 2 }}>Aktif ort.</div>
                      <div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--ink)' }}>
                        {formatPrice(Math.round(priceGuide.active.avg))}
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 2 }}>Aralık</div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-2)' }}>
                      {Math.round(priceGuide.all.min).toLocaleString('tr-TR')} – {formatPrice(Math.round(priceGuide.all.max))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        {/* ── Gonderim oncesi ozet (yalnizca son adimda) ── */}
        {step === 4 && (
          <div className="m-form-card" style={{ ...card, paddingTop: 20 }}>
            <p style={{ ...lbl, fontSize: 15, marginBottom: 4 }}>Gönderim Özeti</p>
            <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 14, lineHeight: 1.55 }}>
              Göndermeden önce kontrol et. Her satırı düzenleyebilirsin; girdiğin bilgiler korunur.
            </p>

            {/* Fotograflar: kapak ilk sirada, sayisiyla birlikte */}
            <div className="m-ozet-satir">
              <span className="m-ozet-etiket" style={{ fontSize: 12.5, color: 'var(--ink-3)', fontFamily: 'var(--font-display)' }}>Fotoğraflar</span>
              <span className="m-ozet-deger" style={{ minWidth: 0 }}>
                {imageUrls.length === 0 ? (
                  <span style={{ fontSize: 13.5, color: 'var(--bad)' }}>Fotoğraf yok</span>
                ) : (
                  <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    {imageUrls.slice(0, 4).map((url, i) => (
                      <img key={i} src={url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: i === 0 ? '2px solid var(--accent)' : '1px solid var(--line)' }} />
                    ))}
                    <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                      {imageUrls.length} fotoğraf
                    </span>
                  </span>
                )}
              </span>
              <button type="button" onClick={() => adimaGit(2)} aria-label="Fotoğrafları düzenle" className="m-ozet-eylem" style={{ background: 'none', border: 0, padding: '0 0 0 8px', color: 'var(--accent)', fontSize: 12.5, cursor: 'pointer', fontFamily: 'var(--font-display)' }}>
                Düzenle
              </button>
            </div>

            <OzetSatiri etiket="Kategori" adim={1} adimaGit={adimaGit}
              deger={[
                allCategories.find(c => c.id === selL1)?.name,
                allCategories.find(c => c.id === selL2)?.name,
              ].filter(Boolean).join(' › ')} />
            <OzetSatiri etiket="Başlık" adim={3} adimaGit={adimaGit} deger={ozetDegerleri[0]} />
            <OzetSatiri etiket="Açıklama" adim={3} adimaGit={adimaGit}
              deger={ozetDegerleri[1] ? String(ozetDegerleri[1]).slice(0, 140) + (String(ozetDegerleri[1]).length > 140 ? '…' : '') : ''} />
            <OzetSatiri etiket="Marka" adim={3} adimaGit={adimaGit}
              deger={(brands ?? []).find((b: any) => b.id === watchedBrandId)?.name} />
            <OzetSatiri etiket="Durum" adim={3} adimaGit={adimaGit}
              deger={CONDITIONS.find(c => c.value === ozetDegerleri[2])?.label} />
            {olcu.tur !== 'yok' && (
              <OzetSatiri etiket={olcu.etiket} adim={3} adimaGit={adimaGit} deger={ozetDegerleri[7]} />
            )}
            {showGender && (
              <OzetSatiri etiket="Cinsiyet" adim={3} adimaGit={adimaGit}
                deger={gender ? gender.charAt(0) + gender.slice(1).toLowerCase() : ''} />
            )}
            <OzetSatiri etiket="Konum" adim={3} adimaGit={adimaGit}
              deger={[ozetDegerleri[5], ozetDegerleri[6]].filter(Boolean).join(' / ')} />
            <OzetSatiri etiket="Fiyat" adim={4} adimaGit={adimaGit}
              deger={ozetDegerleri[3] ? formatPrice(Number(ozetDegerleri[3])) : ''} />
            {ozetDegerleri[4] ? (
              <OzetSatiri etiket="Liste fiyatı" adim={4} adimaGit={adimaGit} deger={formatPrice(Number(ozetDegerleri[4]))} />
            ) : null}

            {/* Gonderildi ile yayinlandi ayni sey degil; dugmeye basmadan
                once bunu soylemek, onay beklerken "ilanim nerede" sorusunu
                bastan cevapliyor. */}
            {/* Metin TEK bir span icinde: kapsayici flex oldugu icin cumleyi
                dogrudan koymak metni ve <strong>'u ayri flex ogelerine
                bolup dar ekranda uc sutun haline getiriyordu. */}
            <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 14, lineHeight: 1.6, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
              <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
              <span>
                Gönderdiğinde ilanın <strong style={{ color: 'var(--ink-2)', fontWeight: 600 }}>onay bekliyor</strong> durumuna
                geçer. Ekip onayladıktan sonra yayına alınır ve sana haber veririz.
              </span>
            </p>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="m-btn m-btn-ghost"
              style={{ flex: '0 0 auto', height: 50, padding: '0 20px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              ← Geri
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={uploading}
              className="m-btn m-btn-primary"
              style={{ flex: 1, height: 50, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              Devam <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || createListing.isPending}
              className="m-btn m-btn-primary"
              style={{ flex: 1, height: 52, fontSize: 16, fontWeight: 700, borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}
            >
              {(isSubmitting || createListing.isPending) ? (
                <span style={{ width: 20, height: 20, border: '2px solid var(--accent-ink)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              ) : (
                <><Zap size={20} fill="currentColor" strokeWidth={0} />Onaya Gönder</>
              )}
            </button>
          )}
        </div>
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

// Ilan vermeden once bir kez istenen T.C. kimlik adimi.
function TcKimlikAdimi() {
  const qc = useQueryClient();
  const [deger, setDeger] = useState('');
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const bicimTamam = deger.length === 11 && gecerliTcKimlik(deger);

  const kaydet = async () => {
    if (!bicimTamam) { toast.error('Geçerli bir T.C. Kimlik numarası gir'); return; }
    setKaydediliyor(true);
    try {
      await api.patch('/users/me', { tcKimlik: deger });
      // Sorguyu tazeleyince bu ekran kapaniyor ve kullanici dogrudan
      // ilan formuna dusuyor; sayfa degistirmeye gerek kalmiyor.
      await qc.invalidateQueries({ queryKey: ['me-tc-check'] });
      toast.success('Kaydedildi, ilanını verebilirsin');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'Kaydedilemedi');
    } finally {
      setKaydediliyor(false);
    }
  };

  return (
    <div className="m-wrap" style={{ padding: '36px 16px 60px', maxWidth: 560 }}>
      <h1 className="m-display" style={{ fontSize: 24, margin: '0 0 8px' }}>Son bir adım</h1>
      <p style={{ color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.65, marginBottom: 20 }}>
        İlan verebilmek için T.C. kimlik numaranı bir kez kaydetmen gerekiyor.
        Bunu yalnızca bu sefer soruyoruz; sonraki ilanlarında tekrar istenmez.
      </p>

      <div className="m-surface-2" style={{ padding: 18, borderRadius: 14, marginBottom: 18 }}>
        <label className="m-label" style={{ display: 'block', marginBottom: 6 }}>T.C. Kimlik No</label>
        <input
          value={deger}
          onChange={e => setDeger(e.target.value.replace(/\D/g, '').slice(0, 11))}
          inputMode="numeric"
          autoComplete="off"
          placeholder="11 haneli numaran"
          className="m-field"
          style={{ height: 46, fontFamily: 'var(--font-mono)', letterSpacing: 1 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12 }}>
          <span style={{ color: deger.length === 11 && !bicimTamam ? 'var(--bad)' : 'var(--ink-3)' }}>
            {deger.length === 11 && !bicimTamam ? 'Bu numara geçerli görünmüyor' : 'Yalnızca rakam'}
          </span>
          <span style={{ color: bicimTamam ? 'var(--good)' : 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            {deger.length}/11
          </span>
        </div>
        <button
          type="button"
          onClick={kaydet}
          disabled={!bicimTamam || kaydediliyor}
          className="m-btn m-btn-primary"
          style={{ width: '100%', height: 46, marginTop: 14 }}
        >
          {kaydediliyor ? 'Kaydediliyor…' : 'Kaydet ve ilana devam et'}
        </button>
      </div>

      <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7, background: 'var(--bg-2)', borderRadius: 12, padding: '14px 16px' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--ink)' }}>Bu bilgi ne için alınıyor?</p>
        <p style={{ margin: '0 0 8px' }}>
          Motorya bir pazar yeri; satış yapan üyelerin kaydını tutmakla yükümlü.
          Numara, bir sorun çıktığında satıcının kayıtlardan bulunabilmesini sağlar.
        </p>
        <p style={{ margin: 0 }}>
          <strong style={{ color: 'var(--ink)' }}>Kimlik doğrulaması değildir.</strong> Numaranın
          sana ait olduğunu doğrulamıyoruz ve profilinde &ldquo;kimlik doğrulandı&rdquo; gibi bir
          rozet çıkmaz. Numara ilanında, profilinde ve mesajlarında <strong style={{ color: 'var(--ink)' }}>görünmez</strong>;
          yalnızca hesap kayıtlarında tutulur.
        </p>
      </div>
    </div>
  );
}
