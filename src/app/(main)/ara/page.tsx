'use client';
import { Fragment, Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearch } from '@/hooks/useSearch';
import { useCreateSavedSearch } from '@/hooks/useSavedSearches';
import { ListingCard } from '@/components/listings/ListingCard';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { analytics } from '@/lib/analytics';
import { olc } from '@/lib/olcum';
import { markalariGrupla } from '@/lib/markaGruplama';
import Link from 'next/link';
import { Search, SlidersHorizontal, X, BellPlus, Info } from 'lucide-react';
import { IzgaraReklami } from '@/components/ui/IzgaraReklami';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import toast from 'react-hot-toast';

const CONDITIONS = [
  { value: '', label: 'Tümü' },
  { value: 'NEW', label: 'Sıfır' },
  { value: 'LIKE_NEW', label: 'Sıfır gibi' },
  { value: 'GOOD', label: 'İyi' },
  { value: 'FAIR', label: 'Makul' },
];

const GENDERS = [
  { value: '', label: 'Tümü' },
  { value: 'ERKEK', label: 'Erkek' },
  { value: 'KADIN', label: 'Kadın' },
  { value: 'UNISEX', label: 'Unisex' },
  { value: 'COCUK', label: 'Çocuk' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'En yeni' },
  { value: 'price_asc', label: 'Fiyat (düşük→yüksek)' },
  { value: 'price_desc', label: 'Fiyat (yüksek→düşük)' },
  { value: 'oldest', label: 'En eski' },
];

function FilterFields({
  categories,
  brands,
  facets,
  sizeLabel,
  city,
  categoryId,
  brandId,
  condition,
  gender,
  priceFrom,
  priceTo,
  setPriceFrom,
  setPriceTo,
  push,
  router,
  q,
  selectedL1Id,
  markaArama,
  setMarkaArama,
}: {
  categories: any[];
  brands: any[];
  facets: { sizes: { value: string; count: number }[]; cities: { value: string; count: number }[] } | undefined;
  sizeLabel: string;
  city: string;
  categoryId: string;
  brandId: string;
  condition: string;
  gender: string;
  priceFrom: string;
  priceTo: string;
  setPriceFrom: (v: string) => void;
  setPriceTo: (v: string) => void;
  push: (overrides: Record<string, string | number | undefined>) => void;
  router: any;
  q: string;
  selectedL1Id: (cats: any[]) => string;
  markaArama: string;
  setMarkaArama: (v: string) => void;
}) {
  const l1id = selectedL1Id(categories);
  // Secili marka arama metnine uymasa bile listede KALMALI; yoksa
  // kullanici kendi secimini goremez ve kaldiramaz.
  const mq = markaArama.trim().toLocaleLowerCase('tr');
  const brandsFiltreli = mq
    ? brands.filter((b: any) => b.id === brandId || (b.name ?? '').toLocaleLowerCase('tr').includes(mq))
    : brands;
  const l2cats = categories.filter((c: any) => c.parentId === l1id);
  const l2val = categoryId && categories.find((c: any) => c.id === categoryId)?.parentId ? categoryId : '';

  return (
    <>
      {/* Ana Kategori */}
      <div>
        <label className="m-label">Ana Kategori</label>
        <select
          value={l1id}
          onChange={e => push({ categoryId: e.target.value, page: 1 })}
          className="m-field"
          style={{ height: 38 }}
        >
          <option value="">Tümü</option>
          {categories.filter((c: any) => !c.parentId).map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Alt Kategori */}
      <div style={{ opacity: l1id ? 1 : 0.4, transition: 'opacity .15s' }}>
        <label className="m-label">Alt Kategori</label>
        <select
          value={l2val}
          onChange={e => push({ categoryId: e.target.value || l1id, page: 1 })}
          disabled={!l1id}
          className="m-field"
          style={{ height: 38, cursor: l1id ? 'pointer' : 'not-allowed' }}
        >
          <option value="">{l1id ? 'Tümü' : '—'}</option>
          {l2cats.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Marka.
          Liste uzun (100+ marka). Yerel bir arama kutusu ekliyoruz:
          select'in kendi "yazarak atlama" davranisi yalnizca bastan
          eslesiyor, "stars" yazip Alpinestars'i bulmaya yetmiyor.
          Kutu select'i FILTRELIYOR, secimi degistirmiyor; kategori
          gruplamasi (Bu kategoride yaygin / Tum markalar) korunuyor. */}
      <div>
        <label className="m-label" htmlFor="marka-sec">Marka</label>
        <input
          type="search"
          value={markaArama}
          onChange={e => setMarkaArama(e.target.value)}
          placeholder="Marka ara…"
          aria-label="Marka listesinde ara"
          aria-controls="marka-sec"
          className="m-field"
          style={{ height: 32, fontSize: 13, marginBottom: 6 }}
        />
        <select
          id="marka-sec"
          value={brandId}
          onChange={e => push({ brandId: e.target.value, page: 1 })}
          className="m-field"
          style={{ height: 38 }}
        >
          <option value="">Tümü</option>
          {(() => {
            const g = markalariGrupla(brandsFiltreli);
            if (g.oneCikan.length === 0) {
              return g.digerleri.map((b) => <option key={b.id} value={b.id}>{b.name}</option>);
            }
            return (
              <>
                <optgroup label="Bu kategoride yaygın">
                  {g.oneCikan.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </optgroup>
                <optgroup label="Tüm markalar">
                  {g.digerleri.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </optgroup>
              </>
            );
          })()}
        </select>
      </div>

      {/* Beden — secenekler yayindaki ilanlardan gelir */}
      {(facets?.sizes?.length ?? 0) > 0 && (
        <div>
          <label className="m-label">Beden</label>
          <select
            value={sizeLabel}
            onChange={e => push({ sizeLabel: e.target.value, page: 1 })}
            className="m-field"
            style={{ height: 38 }}
          >
            <option value="">Tümü</option>
            {facets!.sizes.map(s => (
              <option key={s.value} value={s.value}>{s.value} ({s.count})</option>
            ))}
          </select>
        </div>
      )}

      {/* Fiyat hızlı seçim chipleri */}
      <div style={{ gridColumn: '1 / -1' }}>
        <label className="m-label">Fiyat Aralığı</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {([
            { label: '0–500 ₺',      min: 0,    max: 500 },
            { label: '500–2.000 ₺',  min: 500,  max: 2000 },
            { label: '2.000–5.000 ₺',min: 2000, max: 5000 },
            { label: '5.000 ₺+',     min: 5000, max: undefined },
          ] as const).map(chip => {
            const pf = Number(priceFrom);
            const pt = priceTo ? Number(priceTo) : undefined;
            const active = pf === chip.min && pt === chip.max;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => {
                  const newFrom = chip.min > 0 ? chip.min.toString() : '';
                  const newTo   = chip.max?.toString() ?? '';
                  setPriceFrom(newFrom);
                  setPriceTo(newTo);
                  push({ minPrice: chip.min || undefined, maxPrice: chip.max, page: 1 });
                }}
                className={'m-chip' + (active ? ' active' : '')}
                style={{ height: 30, fontSize: 12 }}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Min Fiyat */}
      <div>
        <label className="m-label">Min Fiyat (₺)</label>
        <input
          type="number"
          value={priceFrom}
          onChange={e => setPriceFrom(e.target.value)}
          onBlur={() => push({ minPrice: priceFrom ? Number(priceFrom) : undefined, page: 1 })}
          placeholder="0"
          className="m-field"
          style={{ height: 38 }}
        />
      </div>

      {/* Max Fiyat */}
      <div>
        <label className="m-label">Max Fiyat (₺)</label>
        <input
          type="number"
          value={priceTo}
          onChange={e => setPriceTo(e.target.value)}
          onBlur={() => push({ maxPrice: priceTo ? Number(priceTo) : undefined, page: 1 })}
          placeholder="—"
          className="m-field"
          style={{ height: 38 }}
        />
      </div>

      {/* DIGER FILTRELER.
          Masaustunde acik filtre alani sekiz alanla iki satiri doldurup
          sonuclari ekranin disina itiyordu. Temel filtreler (kategori,
          marka, beden, fiyat) yukarida acik duruyor; daha seyrek
          kullanilanlar varsayilan KAPALI bir <details> icinde.
          <details> secildi cunku klavyeyle acilabiliyor ve ekran
          okuyucuya dugme olarak gorunuyor - ikinci bir filtre arayuzu
          kurmadan hiyerarsi saglıyor. Mobilde de ayni bilesen kullaniliyor;
          birbirine alternatif iki arayuz yok. */}
      <details style={{ gridColumn: '1 / -1' }}>
        <summary
          style={{
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            color: 'var(--ink-2)', padding: '6px 0', listStyle: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <SlidersHorizontal size={14} /> Diğer filtreler
          {(condition || gender || city) && (
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
          )}
        </summary>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px 16px', marginTop: 10 }}>
      {/* Durum */}
      <div>
        <label className="m-label">Durum</label>
        <select
          value={condition}
          onChange={e => push({ condition: e.target.value, page: 1 })}
          className="m-field"
          style={{ height: 38 }}
        >
          {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Cinsiyet */}
      <div>
        <label className="m-label">Cinsiyet</label>
        <select
          value={gender}
          onChange={e => push({ gender: e.target.value, page: 1 })}
          className="m-field"
          style={{ height: 38 }}
        >
          {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>
      {/* Şehir */}
      {(facets?.cities?.length ?? 0) > 0 && (
        <div>
          <label className="m-label">Şehir</label>
          <select
            value={city}
            onChange={e => push({ city: e.target.value, page: 1 })}
            className="m-field"
            style={{ height: 38 }}
          >
            <option value="">Tümü</option>
            {facets!.cities.map(c => (
              <option key={c.value} value={c.value}>{c.value} ({c.count})</option>
            ))}
          </select>
        </div>
      )}
        </div>
      </details>
    </>
  );
}

function SearchPageInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { user } = useAuthStore();
  const createSavedSearch = useCreateSavedSearch();
  const queryClient = useQueryClient();
  const handleRefresh = useCallback(() => queryClient.refetchQueries({ type: 'active' }), [queryClient]);

  const q = sp.get('q') ?? '';
  const categoryId = sp.get('categoryId') ?? '';
  const brandId = sp.get('brandId') ?? '';
  const condition = sp.get('condition') ?? '';
  const gender = sp.get('gender') ?? '';
  const city = sp.get('city') ?? '';
  const sizeLabel = sp.get('sizeLabel') ?? '';
  const minPrice = sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined;
  const maxPrice = sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined;
  const sort = sp.get('sort') ?? 'newest';
  const page = Number(sp.get('page') ?? 1);

  const [inputVal, setInputVal] = useState(q);
  const [priceFrom, setPriceFrom] = useState(minPrice?.toString() ?? '');
  const [priceTo, setPriceTo] = useState(maxPrice?.toString() ?? '');
  const [showFilters, setShowFilters] = useState(false);
  const [markaArama, setMarkaArama] = useState('');

  const selectedL1Id = (cats: any[]) => {
    const cat = cats.find((c: any) => c.id === categoryId);
    if (!cat) return '';
    return cat.parentId ? cat.parentId : cat.id;
  };

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/listings/meta/categories').then((r) => r.data),
  });

  // Marka listesi secili kategoriye gore siralaniyor, kisalmiyor: filtreyi
  // daraltmak kullanicinin aradigi markayi gizleyebilirdi.
  const { data: brands } = useQuery({
    queryKey: ['brands', categoryId],
    queryFn: () => api
      .get('/listings/meta/brands', { params: categoryId ? { categoryId } : {} })
      .then((r) => r.data),
  });

  const { data, isLoading, isError, refetch } = useSearch({
    q: q || undefined,
    categoryId: categoryId || undefined,
    brandId: brandId || undefined,
    condition: condition || undefined,
    city: city || undefined,
    sizeLabel: sizeLabel || undefined,
    gender: gender || undefined,
    minPrice,
    maxPrice,
    sort,
    page,
    limit: 20,
  });

  /**
   * Adres cubugunu guncelle.
   *
   * IKI HATA VARDI:
   *
   * 1. `merged` icinde minPrice/maxPrice YOKTU. Yani sehir ya da marka
   *    degistirmek fiyat araligini sessizce siliyordu - kullanici 2.000-
   *    5.000 secip sonra sehir secince fiyat filtresi ucuyordu.
   * 2. `v !== 1` KONTROLU her anahtara uygulaniyordu; yalnizca page icin
   *    dusunulmustu ama minPrice=1 gibi gecerli bir degeri de atiyordu.
   */
  const push = useCallback((overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | number | undefined> = {
      q, categoryId, brandId, condition, gender, city, sizeLabel,
      minPrice, maxPrice, sort, page: 1, ...overrides,
    };
    Object.entries(merged).forEach(([k, v]) => {
      if (v === undefined || v === '') return;
      if (k === 'page' && Number(v) === 1) return; // page=1 adreste gorunmesin
      params.set(k, String(v));
    });
    router.push(`/ara?${params.toString()}`);
  }, [q, categoryId, brandId, condition, gender, city, sizeLabel, minPrice, maxPrice, sort, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) analytics.search(inputVal.trim());
    push({ q: inputVal, page: 1 });
  };

  const handleReset = () => {
    setPriceFrom('');
    setPriceTo('');
    router.push(`/ara${q ? `?q=${q}` : ''}`);
    setShowFilters(false);
  };

  const hasActiveFilters = !!(categoryId || brandId || condition || city || sizeLabel || minPrice || maxPrice);

  // Arama olayi sonuc dondukten SONRA uretiliyor: sonuc sayisini ve sifir
  // sonuc durumunu ancak o zaman biliyoruz. Serbest metnin kendisi
  // gonderilmiyor (kullanici arama kutusuna telefon/e-posta yazabiliyor),
  // yalnizca metin girilip girilmedigi.
  //
  // Sayfa 2+ gezinmesi yeni arama sayilmiyor; yoksa listeyi karistiran
  // kullanici arama sayisini sisirirdi.
  const items = data?.items ?? [];
  const meta = data?.meta;

  /**
   * Beden ve sehir secenekleri.
   *
   * ONCEDEN: sayfa `/listings/meta/facets` ucunu HIC PARAMETRESIZ
   * cagiriyordu, yani sayilar TUM SITEYE aitti. "Kislik Mont" secili ve
   * tek sonuc varken sehir listesinde "Istanbul (9)" yaziyordu, beden
   * listesinde botlardan gelen "42, 43" goruniyordu. Uc aslinda
   * categorySlug destekliyordu; sayfa onu hic gondermiyordu.
   *
   * SIMDI: `/search` yanitinin kendi facet dagilimi kullaniliyor.
   * Bu dagilim o anki TUM filtreleri (kategori, marka, durum, cinsiyet,
   * fiyat, metin) hesaba katiyor; ikinci bir uca gitmeye de gerek
   * kalmiyor. Yani istemci ve sunucu ayni filtre kurallarini kullaniyor
   * - cunku sayilar zaten sonucu ureten sorgudan geliyor.
   *
   * KAPSAM KURALI: facet sayilari KENDI secimleri DAHIL tum filtrelerle
   * hesaplanir. Yani "Istanbul" seciliyken sehir listesinde yalnizca
   * Istanbul kalir. Bu, bir secenegin yaninda yazan sayinin "bunu
   * secersem kac sonuc gorurum" degil "su an kac sonuc var" anlamina
   * geldigini soyluyor; arayuzde de boyle anlatiliyor.
   */
  const facetDagilimi = (data as any)?.facets ?? {};
  const facetListesi = useCallback(
    (alan: string, seciliDeger: string) => {
      const ham: Record<string, number> = facetDagilimi[alan] ?? {};
      const liste = Object.entries(ham)
        .map(([value, count]) => ({ value, count: Number(count) }))
        .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'tr'));
      // Secili deger sonucu sifira dusurse bile listede KALMALI; yoksa
      // kullanici kendi secimini geri alamaz.
      if (seciliDeger && !liste.some((o) => o.value === seciliDeger)) {
        liste.unshift({ value: seciliDeger, count: 0 });
      }
      return liste;
    },
    [facetDagilimi],
  );

  const facets = {
    sizes: facetListesi('sizeLabel', sizeLabel),
    cities: facetListesi('city', city),
  };
  const sonOlculen = useRef<string>('');
  useEffect(() => {
    if (isLoading || !meta || page !== 1) return;
    const imza = JSON.stringify([q, categoryId, brandId, condition, gender, city, sizeLabel, minPrice, maxPrice, sort, meta.total]);
    if (sonOlculen.current === imza) return;
    sonOlculen.current = imza;

    const filtreler: string[] = [];
    if (categoryId) filtreler.push('kategori');
    if (brandId) filtreler.push('marka');
    if (condition) filtreler.push('durum');
    if (gender) filtreler.push('cinsiyet');
    if (city) filtreler.push('sehir');
    if (sizeLabel) filtreler.push('beden');
    if (minPrice !== undefined) filtreler.push('minFiyat');
    if (maxPrice !== undefined) filtreler.push('maxFiyat');
    if (sort && sort !== 'newest') filtreler.push('siralama');

    const kategoriSlug = (categories ?? []).find((c: any) => c.id === categoryId)?.slug;

    olc('arama_yapildi', {
      sonucSayisi: meta.total ?? 0,
      sifirSonuc: (meta.total ?? 0) === 0,
      metinVar: !!q,
      kategori: kategoriSlug,
      filtreler: filtreler.length ? filtreler : undefined,
    });
  }, [isLoading, meta, page, q, categoryId, brandId, condition, gender, city, sizeLabel, minPrice, maxPrice, sort, categories]);

  const cats = categories ?? [];
  const brnds = brands ?? [];

  /**
   * Izgaranin GERCEK sutun sayisi.
   *
   * CSS `repeat(auto-fit, minmax(...))` kullandigi icin sutun sayisi
   * yalnizca tarayicida biliniyor; "mobilde 2, masaustunde 5" diye
   * varsaymak reklami yine satirin ortasina dusururdu. Hesaplanmis
   * stilden okuyup ekran yeniden boyutlandiginda guncelliyoruz.
   */
  const izgaraRef = useRef<HTMLDivElement>(null);
  const [sutunSayisi, setSutunSayisi] = useState(0);
  useEffect(() => {
    const el = izgaraRef.current;
    if (!el) return;
    const olc = () => {
      const sablon = getComputedStyle(el).gridTemplateColumns;
      const n = sablon && sablon !== 'none' ? sablon.split(' ').filter(Boolean).length : 0;
      setSutunSayisi((onceki) => (onceki === n ? onceki : n));
    };
    olc();
    const ro = new ResizeObserver(olc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  /**
   * Reklamin hangi kartlardan SONRA gelecegi.
   *
   * Kural: her `REKLAM_SATIR_ARALIGI` tamamlanmis satirda bir. Boylece
   * reklam her zaman dolu bir satirin ardina geliyor ve arkasinda bos
   * hucre kalmiyor. Sutun sayisi henuz olculmediyse hic reklam
   * koymuyoruz - yanlis yere koyup sonra tasimak, tam da kacinmak
   * istedigimiz yerlesim sicramasi olurdu.
   *
   * Reklamlar ilanlarin SIRASINI degistirmiyor, araya giriyor; sayim da
   * etkilenmiyor ("15 sonuç" sayisi meta.total'dan geliyor, karttan degil).
   */
  const REKLAM_SATIR_ARALIGI = 2;
  const reklamSonrasiIndeksler = new Set<number>();
  if (sutunSayisi > 0) {
    const adim = sutunSayisi * REKLAM_SATIR_ARALIGI;
    for (let i = adim; i < items.length; i += adim) reklamSonrasiIndeksler.add(i - 1);
  }

  // Panel acikken sabit alt gezinme cubugu panelin alt kismini ortuyordu ve
  // arka plandaki liste kayabiliyordu. Panel acikken govdeye bir sinif
  // koyup cubugu gizliyor, kaydirmayi da kilitliyoruz; kapaninca ikisi de
  // geri geliyor.
  /**
   * Panel acikken: arka sayfa kaymasin, Escape kapatsin, odak panelin
   * icinde kalsin ve kapaninca Filtre dugmesine donsun.
   *
   * Oncesinde yalnizca govde kaydirma kilidi vardi; Escape hicbir sey
   * yapmiyordu ve Tab ile arkadaki sayfada gezinilebiliyordu - klavye
   * kullanicisi paneli goruyor ama odagi goremiyordu.
   */
  const panelRef = useRef<HTMLDivElement>(null);
  const filtreDugmesiRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!showFilters) return;
    const govde = document.body;
    const eskiOverflow = govde.style.overflow;
    govde.classList.add('m-panel-acik');
    govde.style.overflow = 'hidden';

    const ODAKLANABILIR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    panelRef.current?.querySelector<HTMLElement>(ODAKLANABILIR)?.focus();

    const tus = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); setShowFilters(false); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const ogeler = Array.from(panelRef.current.querySelectorAll<HTMLElement>(ODAKLANABILIR))
        .filter(o => o.offsetParent !== null);
      if (!ogeler.length) return;
      const ilk = ogeler[0], son = ogeler[ogeler.length - 1];
      if (e.shiftKey && document.activeElement === ilk) { e.preventDefault(); son.focus(); }
      else if (!e.shiftKey && document.activeElement === son) { e.preventDefault(); ilk.focus(); }
    };
    document.addEventListener('keydown', tus);

    return () => {
      document.removeEventListener('keydown', tus);
      govde.classList.remove('m-panel-acik');
      govde.style.overflow = eskiOverflow;
      filtreDugmesiRef.current?.focus();
    };
  }, [showFilters]);

  const filterFieldProps = {
    categories: cats,
    brands: brnds,
    facets,
    sizeLabel,
    city,
    categoryId,
    brandId,
    condition,
    gender,
    priceFrom,
    priceTo,
    setPriceFrom,
    setPriceTo,
    push,
    router,
    q,
    selectedL1Id,
    markaArama,
    setMarkaArama,
  };

  return (
    <div className="m-wrap" style={{ paddingTop: 28, paddingBottom: 60 }}>
      <PullToRefresh onRefresh={handleRefresh} />

      {/* Search bar — sticky on mobile */}
      <div className="m-search-bar-wrap">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, height: 48, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 10, padding: '0 8px 0 14px' }}>
            <Search size={18} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Kask, mont, egzoz ara…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--ink)' }}
            />
            {inputVal && (
              <button type="button" onClick={() => { setInputVal(''); push({ q: '', page: 1 }); }} style={{ background: 'none', border: 'none', padding: 4, color: 'var(--ink-3)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="m-btn m-btn-primary">Ara</button>
          <button
            ref={filtreDugmesiRef}
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            className="m-btn"
            style={{ gap: 6, position: 'relative' }}
          >
            <SlidersHorizontal size={16} />
            Filtre
            {hasActiveFilters && (
              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
            )}
          </button>
          {(q || categoryId || brandId || condition || city || minPrice || maxPrice) && (
            <button
              type="button"
              disabled={createSavedSearch.isPending}
              onClick={() => {
                if (!user) { toast.error('Aramayı kaydetmek için giriş yapmalısın'); return; }
                const categoryName = cats.find((c: any) => c.id === categoryId)?.name;
                const brandName = brnds.find((b: any) => b.id === brandId)?.name;
                const label = [q, brandName, categoryName, city].filter(Boolean).join(' · ') || 'Tüm ilanlar';
                createSavedSearch.mutate(
                  { label, search: q || undefined, categoryId: categoryId || undefined, brandId: brandId || undefined, condition: condition || undefined, city: city || undefined, minPrice, maxPrice },
                  {
                    onSuccess: () => toast.success('Arama kaydedildi — uyan yeni ilan girince haber vereceğiz'),
                    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Arama kaydedilemedi'),
                  }
                );
              }}
              className="m-btn"
              style={{ gap: 6 }}
            >
              <BellPlus size={16} />
              Bu aramayı kaydet
            </button>
          )}
        </form>
      </div>

      {/* Filter panel — desktop only (4 col × 2 row) */}
      {showFilters && (
        <div className="m-filter-panel--desktop" style={{ background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 12, padding: '18px 20px', marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 16px' }}>
          <FilterFields {...filterFieldProps} />
          {/* Reset */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={handleReset}
              className="m-btn m-btn-ghost"
              style={{ width: '100%', height: 38, fontSize: 13 }}
            >
              Filtreleri sıfırla
            </button>
          </div>
        </div>
      )}

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="m-filter-drawer--mobile">
          {/* Overlay */}
          <div
            onClick={() => setShowFilters(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 100,
            }}
          />
          {/* Drawer card.
              - `dvh`: `85vh` mobil tarayicilarda adres cubugu acilip
                kapandikca gercek gorunur alanla uyusmuyor ve panelin
                alti ekranin disina tasip arkadaki sayfayi gosterebiliyor.
              - `paddingBottom: 0`: alt eylem seridi artik panelin en
                altina kadar iniyor; eskiden altinda 32px'lik saydam
                olmayan ama BOS bir seritte icerik kayarken goruluyordu.
              - `role="dialog"` + odak yonetimi: panelin klavyeyle
                kullanilabilmesi icin gerekli, oncesinde hicbiri yoktu. */}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Filtreler"
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 101,
              background: 'var(--bg-0)',
              borderRadius: '20px 20px 0 0',
              maxHeight: '85dvh',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              padding: '12px 20px 0',
            }}
          >
            {/* Handle bar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--line, #ddd)' }} />
            </div>

            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>Filtreler</span>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: 'var(--ink-3)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter fields — single column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FilterFields {...filterFieldProps} />
            </div>

            {/* Eylemler panelin altina yapisik: panel uzun oldugunda
                "Sifirla" ekranin disinda kaliyordu. */}
            {/* Negatif yan marjlar panelin 20px'lik ic bosluguna karsilik
                geliyor: serit kenardan kenara opak oluyor ve icerik
                YANINDAN kayip gecemiyor. Oncesinde serit 20px iceriden
                basliyordu ve bosluklardan arka plan goruluyordu. */}
            <div style={{
              position: 'sticky', bottom: 0, marginTop: 24,
              marginLeft: -20, marginRight: -20,
              paddingLeft: 20, paddingRight: 20,
              display: 'flex', flexDirection: 'column', gap: 10,
              background: 'var(--bg-0)',
              paddingTop: 12,
              paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
              borderTop: '1px solid var(--line-soft)',
            }}>
              <button
                onClick={() => setShowFilters(false)}
                className="m-btn m-btn-primary"
                style={{ width: '100%', height: 46, fontSize: 15, fontWeight: 600 }}
              >
                {/* Masaustunde filtreler aninda uygulandigi icin mobilde
                    de ayni sey oluyor: bu dugme filtreyi UYGULAMIYOR,
                    paneli kapatiyor. Sonuc sayisi zaten guncel oldugu
                    icin dugmede gosterilebiliyor. Sayi henuz bilinmiyorsa
                    yaniltici bir deger basmak yerine sade metne donuyor. */}
                {isLoading || meta?.total === undefined
                  ? 'Sonuçları göster'
                  : `${meta.total.toLocaleString('tr-TR')} ilanı göster`}
              </button>
              <button
                onClick={handleReset}
                className="m-btn m-btn-ghost"
                style={{ width: '100%', height: 42, fontSize: 14 }}
              >
                Sıfırla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tam eşleşme bulunamayıp sorgu gevşetildiyse kullanıcıya söyle —
          aksi halde alakasız görünen sonuçlar aramanın bozuk olduğu
          izlenimi veriyor. */}
      {!isLoading && (meta as any)?.relaxed && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, padding: '12px 14px', borderRadius: 10, background: 'color-mix(in oklch, var(--warn) 8%, var(--bg-1))', border: '1px solid color-mix(in oklch, var(--warn) 25%, transparent)' }}>
          <Info size={16} style={{ color: 'var(--warn)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 }}>
            <strong style={{ color: 'var(--ink)' }}>&ldquo;{q}&rdquo;</strong> için tam eşleşme bulunamadı.
            Aramanızdaki kelimelerin bir kısmına uyan benzer ilanları gösteriyoruz.
          </p>
        </div>
      )}

      {/* Result header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <p style={{ fontSize: 14, color: 'var(--ink-2)' }}>
          {isLoading ? 'Aranıyor…' : (
            meta?.total !== undefined
              ? <><strong style={{ color: 'var(--ink)' }}>{meta.total.toLocaleString('tr-TR')}</strong> sonuç{q ? ` — "${q}"` : ''}</>
              : null
          )}
        </p>
        <select
          value={sort}
          onChange={e => push({ sort: e.target.value, page: 1 })}
          className="m-field"
          style={{ width: 'auto', height: 36, fontSize: 13, paddingRight: 28 }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Active filter chips.
          `cats.length > 0` kosulu SSR icin: sunucuda kategori listesi
          yok, dolayisiyla etiket ham kategori kimligine dusuyordu
          ("cmvcobg4n...") ve istemci adi cozunce metin degisiyordu.
          React bunu hydration uyusmazligi sayip TUM arama agacini
          sokup yeniden kuruyordu - sayfa gozle gorulur bicimde bos
          kalip sonra doluyordu. Liste gelene kadar cipi hic basmiyoruz;
          iki tarafta da ayni sey render ediliyor. */}
      {/* Bos sonuc ekrani aktif filtreleri KENDI icinde gosteriyor (orada
          kaldirmak asil eylem). Ikisi birden basilirsa ayni cip iki kez
          goruluyor; o durumda ustteki serit gizleniyor. */}
      {cats.length > 0 && items.length > 0 && (categoryId || brandId || condition || gender || city) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {categoryId && (() => {
            const cat = cats.find((c: any) => c.id === categoryId);
            const l1 = cat?.parentId ? cats.find((c: any) => c.id === cat.parentId) : cat;
            const label = cat?.parentId ? `${l1?.name} › ${cat.name}` : cat?.name ?? categoryId;
            return (
              <span className="m-chip active" onClick={() => push({ categoryId: '', page: 1 })}>
                {label} <X size={13} />
              </span>
            );
          })()}
          {brandId && (
            <span className="m-chip active" onClick={() => push({ brandId: '', page: 1 })}>
              {brnds.find((b: any) => b.id === brandId)?.name ?? brandId} <X size={13} />
            </span>
          )}
          {condition && (
            <span className="m-chip active" onClick={() => push({ condition: '', page: 1 })}>
              {CONDITIONS.find(c => c.value === condition)?.label} <X size={13} />
            </span>
          )}
          {gender && (
            <span className="m-chip active" onClick={() => push({ gender: '', page: 1 })}>
              {GENDERS.find(g => g.value === gender)?.label} <X size={13} />
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="m-listing-grid" style={{ gap: 12 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: '4/5', background: 'var(--bg-1)', borderRadius: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : isError ? (
        /* AG HATASI ile GERCEK BOS SONUC ayri seyler. Oncesinde ikisi de
           "ilan yok" diyordu; istek basarisiz olunca kullanici aramanin
           sonucsuz oldugunu saniyordu. */
        <div style={{ textAlign: 'center', padding: '64px 0' }} role="alert">
          <p style={{ fontWeight: 600, color: 'var(--ink-2)' }}>Sonuçlar yüklenemedi</p>
          <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6 }}>
            Bağlantı sorunu olabilir. Filtrelerin hâlâ duruyor.
          </p>
          <button type="button" onClick={() => refetch()} className="m-btn m-btn-primary" style={{ margin: '18px auto 0' }}>
            Tekrar dene
          </button>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0' }}>
          <Search size={44} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
          <p style={{ fontWeight: 600, color: 'var(--ink-2)' }}>
            {q ? <>&ldquo;{q}&rdquo; için ilan yok</> : 'Bu filtrelerde ilan yok'}
          </p>

          {/* ANA EYLEM: kullaniciyi aramaya geri kazanmak.
              Oncesinde ekrandaki tek belirgin eylem "alarm kur" idi -
              yani kullaniciyi beklemeye gonderiyordu. Oysa cogu bos
              sonucun sebebi fazla daraltilmis bir filtre; once onu
              gevsetmeyi onermek gerekiyor. Alarm ve ilan verme ikincil
              eylem olarak altta duruyor. */}
          {(hasActiveFilters || q) ? (
            <>
              <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6, maxWidth: 400, marginInline: 'auto', lineHeight: 1.6 }}>
                Filtreleri gevşetmeyi deneyin — aşağıdaki seçimlerden birini kaldırmak
                çoğu zaman yeterli oluyor.
              </p>

              {/* Aktif filtreler burada da GORUNUR kaliyor; kullanici
                  hangi secimin sonucu bosalttigini gormeden neyi
                  kaldiracagini bilemez. Tek tek kaldirilabiliyorlar. */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 }}>
                {cats.length > 0 && categoryId && (() => {
                  const cat = cats.find((c: any) => c.id === categoryId);
                  const l1 = cat?.parentId ? cats.find((c: any) => c.id === cat.parentId) : cat;
                  return (
                    <span className="m-chip active" onClick={() => push({ categoryId: '', page: 1 })}>
                      {cat?.parentId ? `${l1?.name} › ${cat.name}` : cat?.name} <X size={13} />
                    </span>
                  );
                })()}
                {brnds.length > 0 && brandId && (
                  <span className="m-chip active" onClick={() => push({ brandId: '', page: 1 })}>
                    {brnds.find((b: any) => b.id === brandId)?.name} <X size={13} />
                  </span>
                )}
                {condition && (
                  <span className="m-chip active" onClick={() => push({ condition: '', page: 1 })}>
                    {CONDITIONS.find(c => c.value === condition)?.label} <X size={13} />
                  </span>
                )}
                {gender && (
                  <span className="m-chip active" onClick={() => push({ gender: '', page: 1 })}>
                    {GENDERS.find(g => g.value === gender)?.label} <X size={13} />
                  </span>
                )}
                {city && (
                  <span className="m-chip active" onClick={() => push({ city: '', page: 1 })}>
                    {city} <X size={13} />
                  </span>
                )}
                {sizeLabel && (
                  <span className="m-chip active" onClick={() => push({ sizeLabel: '', page: 1 })}>
                    Beden {sizeLabel} <X size={13} />
                  </span>
                )}
                {(minPrice !== undefined || maxPrice !== undefined) && (
                  <span className="m-chip active" onClick={() => { setPriceFrom(''); setPriceTo(''); push({ minPrice: undefined, maxPrice: undefined, page: 1 }); }}>
                    Fiyat <X size={13} />
                  </span>
                )}
              </div>

              <button type="button" onClick={handleReset} className="m-btn m-btn-primary" style={{ margin: '18px auto 0' }}>
                Filtreleri temizle
              </button>

              <div className="m-alarm-eylem" style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={createSavedSearch.isPending}
                  onClick={() => {
                    if (!user) { toast.error('Alarm kurmak için giriş yapmalısın'); return; }
                    const categoryName = cats.find((c: any) => c.id === categoryId)?.name;
                    const brandName = brnds.find((b: any) => b.id === brandId)?.name;
                    const label = [q, brandName, categoryName, city].filter(Boolean).join(' · ') || 'Tüm ilanlar';
                    createSavedSearch.mutate(
                      { label, search: q || undefined, categoryId: categoryId || undefined, brandId: brandId || undefined, condition: condition || undefined, city: city || undefined, minPrice, maxPrice },
                      {
                        onSuccess: () => toast.success('Alarm kuruldu — uyan yeni ilan girince haber vereceğiz'),
                        onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Alarm kurulamadı'),
                      }
                    );
                  }}
                  className="m-btn"
                  style={{ gap: 7, fontSize: 13.5 }}
                >
                  <BellPlus size={15} /> Çıkınca haber ver
                </button>
                <Link href="/ilan-ver" className="m-btn" style={{ fontSize: 13.5 }}>
                  Sende varsa ilan ver
                </Link>
              </div>
            </>
          ) : (
            /* Filtre de arama metni de YOKSA gevsetecek bir sey yok:
               envanter gercekten bos demektir. Burada dogru eylem ilan
               vermek ya da alarm kurmak. */
            <>
              <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6, maxWidth: 380, marginInline: 'auto', lineHeight: 1.6 }}>
                Motorya yeni açıldı ve ilanlar her gün artıyor. Alarm kurarsan
                aradığın ürün eklendiğinde ilk sen haberdar olursun.
              </p>
              <div style={{ marginTop: 16 }}>
                <Link href="/ilan-ver" className="m-btn m-btn-primary">Sende varsa ilan ver</Link>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <div ref={izgaraRef} className="m-listing-grid" style={{ gap: 12 }}>
            {items.map((item: any, i: number) => (
              // Fragment'in KENDISI dizi elemani oldugu icin key onda
              // olmali; eskiden ictekı div'deydi ve React her render'da
              // uyari veriyordu.
              <Fragment key={item.id}>
                {/* Arama -> detay gecisi kendi basina olay olarak olculuyor;
                    boylece oturum kimligi tutmadan gecis orani hesaplanabiliyor.
                    Favori kalbi kendi tiklamasini durduruyor, buraya gelmiyor. */}
                <div onClick={() => olc('arama_sonuc_tiklandi', { listingId: item.id })}>
                  <ListingCard listing={item} />
                </div>
                {reklamSonrasiIndeksler.has(i) && (
                  <IzgaraReklami slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LISTING ?? ''} />
                )}
              </Fragment>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 36, flexWrap: 'wrap' }}>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => push({ page: p })}
                  className="m-btn sm"
                  style={p === page ? { background: 'var(--accent)', color: 'var(--accent-ink)', borderColor: 'transparent' } : {}}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
