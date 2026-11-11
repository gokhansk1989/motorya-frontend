'use client';
import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { useListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { api } from '@/lib/api';
import {
  Search, ChevronRight, ChevronLeft, Star, Clock, ArrowRight,
  Camera, MessageCircle, Truck,
} from 'lucide-react';
import Link from 'next/link';
import { CategoryIcon } from '@/components/icons/CategoryIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { matchCategories, matchBrands, CategorySuggestionsDropdown, type BrandLite } from '@/components/ui/CategorySuggestions';
import { formatPrice } from '@/lib/utils';

interface Category { id: string; name: string; slug: string; parentId: string | null; }

// Hero'daki mozaik en yeni dort ilani gosteriyor; asagidaki "Diger Ilanlar"
// izgarasi ayni sorgunun devamini kullaniyor ki ayni ilan iki kez cikmasin.
const MOZAIK_ADEDI = 4;
// 12: izgara 6, 4 ve 2 sutunda da tam satir veriyor.
const IZGARA_ADEDI = 12;
// Vitrindeki ilanlar izgaradan dusuldugu icin pay birakiyoruz.
const YENI_ILAN_SORGUSU = { limit: 28 } as const;

const ONE_CIKAN_SORGUSU = { isFeatured: true, limit: 12 } as const;

function ilanlariAl(data: any): any[] {
  return Array.isArray(data) ? data : data?.items ?? [];
}

function BolumBasligi({ icon, children, sag }: { icon?: React.ReactNode; children: React.ReactNode; sag?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {icon}
        <h2 className="m-display" style={{ fontSize: 18, margin: 0 }}>{children}</h2>
      </div>
      {sag}
    </div>
  );
}

function TumuBaglantisi({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      {children} <ChevronRight size={14} />
    </Link>
  );
}

function YeniEklenenlerMozaigi({ items }: { items: any[] }) {
  if (items.length < MOZAIK_ADEDI) return null;
  return (
    <div className="m-hero-mozaik">
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <Clock size={15} style={{ color: 'var(--accent)' }} />
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>Son Eklenen {MOZAIK_ADEDI} İlan</span>
      </div>
      <div className="m-hero-mozaik-grid">
        {items.slice(0, MOZAIK_ADEDI).map((l: any, i: number) => (
          <Link key={l.id} href={`/ilan/${l.slug ?? l.id}`} className="m-hero-kare" aria-label={`${l.title}, ${formatPrice(l.price)}`}>
            {/* Ilk ekranda gorunuyorlar: tembel yukleme LCP'yi geciktirirdi. */}
            {l.images?.[0] && <img src={l.images[0].url} alt="" loading="eager" fetchPriority={i === 0 ? 'high' : 'auto'} />}
            <span>{formatPrice(l.price)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function HeroSection({ onSearch, categories, brands, yeniIlanlar }: {
  onSearch: (q: string) => void; categories: Category[]; brands: BrandLite[];
  yeniIlanlar: any[];
}) {
  const [val, setVal] = useState('');
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);

  const matches = matchCategories(categories, val);
  const brandMatches = matchBrands(brands, val);

  const handleFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setFocused(true);
  };
  const handleBlur = () => {
    blurTimer.current = setTimeout(() => setFocused(false), 120);
  };

  return (
    <section style={{ position: 'relative', borderBottom: '1px solid var(--line-soft)' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background:
        'radial-gradient(80% 120% at 12% -10%, color-mix(in oklch, var(--accent) 22%, transparent), transparent 55%),' +
        'radial-gradient(70% 100% at 100% 110%, color-mix(in oklch, var(--accent-2) 18%, transparent), transparent 55%)',
        zIndex: 0 }} />
      <div className="m-wrap m-hero-row" style={{ position: 'relative', zIndex: 1, paddingTop: 'clamp(22px, 5vw, 54px)', paddingBottom: 'clamp(22px, 4vw, 46px)' }}>
        <div style={{ maxWidth: 620, flex: 1, minWidth: 0 }} className="m-fade-up">
          <div className="m-hide-mobile" style={{ marginBottom: 16 }}>
            <span className="m-kicker">Türkiye'nin motosiklet ekipman pazarı</span>
          </div>
          <h1 className="m-display" style={{ fontSize: 'clamp(30px, 5vw, 60px)', margin: 0 }}>
            Garajındaki ekipman,<br /><span className="m-accent">başkasının</span> sıradaki yolculuğu.
          </h1>
          {/* Mobilde gizli: ilk ekrana arama ile ilk ilanlar birlikte sigsin. */}
          <p className="m-hide-mobile" style={{ fontSize: 17, maxWidth: 480, marginTop: 18, lineHeight: 1.55, color: 'var(--ink-2)' }}>
            İkinci el kask, mont, egzoz ve parça al-sat. E-posta doğrulamalı
            üyelerle platform içinden mesajlaş, kargoyla ya da yüz yüze anlaş.
          </p>
          <form onSubmit={e => { e.preventDefault(); onSearch(val); }} style={{ marginTop: 'clamp(16px, 3vw, 28px)', maxWidth: 540 }}>
            <div ref={searchBoxRef} style={{ display: 'flex', flex: 1, height: 54, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 11, padding: '0 8px 0 16px', gap: 8, alignItems: 'center' }}>
              <Search size={20} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
              <input value={val} onChange={e => setVal(e.target.value)} onFocus={handleFocus} onBlur={handleBlur} placeholder="Ne arıyorsun?"
                style={{ flex: 1, background: 'none', border: 0, color: 'var(--ink)', fontSize: 15, outline: 'none', minWidth: 0 }} />
              <button type="submit" className="m-btn m-btn-primary" style={{ height: 38, padding: '0 14px', fontSize: 14, flexShrink: 0 }}>Ara</button>
            </div>
            {focused && <CategorySuggestionsDropdown query={val} matches={matches} brandMatches={brandMatches} anchorRef={searchBoxRef} onSearchQuery={onSearch} />}
          </form>
        </div>
        <YeniEklenenlerMozaigi items={yeniIlanlar} />
      </div>
    </section>
  );
}

function FeaturedSectionSkeleton() {
  return (
    <div>
      <BolumBasligi icon={<Star size={18} style={{ color: 'var(--line)' }} />}>Öne Çıkan İlanlar</BolumBasligi>
      <div style={{ display: 'flex', gap: 14, overflow: 'hidden' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ width: 220, flexShrink: 0, height: 300, borderRadius: 12, background: 'var(--bg-2)', animation: 'm-pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
      <style>{`@keyframes m-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}

function FeaturedSection() {
  // SSR'de bu component'in üst tarafında Zustand persist (useAuthStore)
  // hydration mismatch tetikliyor ve subtree cokuyor. Mount sonrasi CSR
  // olarak render edip crash'i engelliyoruz.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // One cikan yoksa serit hic gorunmuyor. Bos kalmasin diye en yenilere
  // dusurmek basligi yalanci yapardi; siralama da yonetim panelindeki
  // vitrin sirasina birakiliyor.
  const { data, isLoading } = useListings(ONE_CIKAN_SORGUSU, mounted);
  const items = data?.items ?? [];

  const trackRef = useRef<HTMLDivElement | null>(null);
  const kaydir = (yon: 1 | -1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: yon * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  if (!mounted || isLoading) return <FeaturedSectionSkeleton />;
  if (items.length === 0) return null;

  const okStili: React.CSSProperties = { width: 34, height: 34, padding: 0, borderRadius: '50%' };

  return (
    <div>
      <BolumBasligi
        icon={<Star size={18} fill="var(--accent)" strokeWidth={0} style={{ color: 'var(--accent)' }} />}
        sag={items.length > 4 && (
          <div className="m-hide-mobile" style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="m-btn" style={okStili} aria-label="Önceki ilanlar" onClick={() => kaydir(-1)}><ChevronLeft size={16} /></button>
            <button type="button" className="m-btn" style={okStili} aria-label="Sonraki ilanlar" onClick={() => kaydir(1)}><ChevronRight size={16} /></button>
          </div>
        )}
      >
        Öne Çıkan İlanlar
      </BolumBasligi>
      <div ref={trackRef} className="m-vitrin-track">
        {items.map((l: any) => (
          <div key={l.id}><ListingCard listing={l} /></div>
        ))}
      </div>
    </div>
  );
}

const KATEGORI_SUTUNU = 6;

function CategoryGrid({ categories, allCategories, onSelect }: {
  categories: Category[]; allCategories: Category[]; onSelect: (slug: string) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleExpand = (id: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setExpandedId(id), 200);
  };
  const scheduleCollapse = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setExpandedId(null), 200);
  };
  const cancelPending = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  if (!categories.length) return null;

  const kartStili: React.CSSProperties = {
    position: 'relative', borderRadius: 14, background: 'var(--bg-1)',
    border: '1px solid var(--line-soft)', transition: 'all .15s ease',
  };
  const dugmeStili: React.CSSProperties = {
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    padding: '14px 10px', background: 'transparent', border: 0, cursor: 'pointer', textDecoration: 'none',
  };
  const adStili: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.2,
    height: 'calc(1.2em * 2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <div>
      <BolumBasligi sag={<TumuBaglantisi href="/kategoriler">Tümü</TumuBaglantisi>}>Kategoriler</BolumBasligi>
      <div className="m-category-grid">
        {categories.map((c, i) => {
          const children = allCategories.filter(ch => ch.parentId === c.id);
          const hasChildren = children.length > 0;
          const alignRight = i % KATEGORI_SUTUNU >= KATEGORI_SUTUNU / 2;
          return (
            <div
              key={c.id}
              style={kartStili}
              // Alt kategori paneli yalnizca fareyle aciliyor; dokunmatikte
              // kart dogrudan kategori sayfasina goturuyor.
              onMouseEnter={() => hasChildren ? scheduleExpand(c.id) : cancelPending()}
              onMouseLeave={scheduleCollapse}
            >
              <button onClick={() => onSelect(c.slug)} className="m-cat-select-btn" style={dugmeStili}>
                <CategoryIcon slug={c.slug} size={48} alt="" />
                <span className="m-cat-ad" style={adStili}>{c.name}</span>
              </button>
              <AnimatePresence>
                {expandedId === c.id && hasChildren && (
                  <motion.div
                    className="m-subcat-panel m-hide-mobile"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    onMouseEnter={cancelPending}
                    onMouseLeave={scheduleCollapse}
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', [alignRight ? 'right' : 'left']: 0,
                      zIndex: 30, minWidth: 220, maxWidth: 320,
                    }}
                  >
                    <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-soft)', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.18)' }}>
                      {children.map(ch => (
                        <button
                          key={ch.id}
                          onClick={() => { cancelPending(); onSelect(ch.slug); setExpandedId(null); }}
                          style={{
                            textAlign: 'left', padding: '7px 10px', borderRadius: 8, border: 0, background: 'transparent',
                            color: 'var(--ink-2)', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-2)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          {ch.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        <div style={kartStili}>
          <Link href="/ara" className="m-cat-select-btn" style={{ ...dugmeStili, justifyContent: 'center', color: 'var(--accent)' }}>
            <ArrowRight size={26} aria-hidden="true" />
            <span className="m-cat-ad" style={{ ...adStili, color: 'var(--accent)' }}>Tüm ilanlar</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function CategoryGridSkeleton() {
  return (
    <div>
      <BolumBasligi>Kategoriler</BolumBasligi>
      <div className="m-category-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            borderRadius: 14, border: '1px solid var(--line-soft)', background: 'var(--bg-1)',
            padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-2)', animation: 'm-pulse 1.5s ease-in-out infinite' }} />
            <div style={{ height: 10, width: '70%', borderRadius: 6, background: 'var(--bg-2)', animation: 'm-pulse 1.5s ease-in-out infinite' }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes m-pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}

function YeniIlanlar({ adaylar }: { adaylar: any[] }) {
  // Ayni sorgu anahtari: FeaturedSection ile tek istek paylasiliyor.
  const { data: oneCikan } = useListings(ONE_CIKAN_SORGUSU, true);
  const vitrindekiler = new Set(ilanlariAl(oneCikan).map((l: any) => l.id));
  const items = adaylar.filter((l: any) => !vitrindekiler.has(l.id)).slice(0, IZGARA_ADEDI);
  if (items.length === 0) return null;
  return (
    <div>
      {/* "Yeni Ilanlar" degil: en yeni dort ilan hero'da, vitrindekiler
          yukarida; bu liste en yeniden baslamiyor. */}
      <BolumBasligi sag={<TumuBaglantisi href="/ara">Tümü</TumuBaglantisi>}>Diğer İlanları Keşfet</BolumBasligi>
      <div className="m-yeni-grid">
        {items.map((l: any) => <ListingCard key={l.id} listing={l} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
        <Link href="/ara" className="m-btn" style={{ height: 44, fontSize: 14, fontWeight: 600, gap: 8 }}>
          Tüm ilanları gör <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

const ADIMLAR = [
  { icon: Camera, baslik: 'Fotoğrafla, ilan ver', metin: 'Ekipmanını birkaç dakikada ücretsiz ilana çevir.' },
  { icon: MessageCircle, baslik: 'Platformdan mesajlaş', metin: 'E-posta doğrulamalı üyelerle numara paylaşmadan anlaş.' },
  { icon: Truck, baslik: 'Kargo ya da yüz yüze', metin: 'Teslimatı alıcıyla birlikte, sana uyan şekilde belirle.' },
];

function NasilCalisir() {
  return (
    <div>
      <BolumBasligi sag={<TumuBaglantisi href="/sayfa/nasil-calisir">Ayrıntılar</TumuBaglantisi>}>Nasıl Çalışır</BolumBasligi>
      <div className="m-uclu-grid">
        {ADIMLAR.map(({ icon: Icon, baslik, metin }) => (
          <div key={baslik} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--bg-1)', border: '1px solid var(--line-soft)', borderRadius: 14, padding: 16 }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0, color: 'var(--accent)', background: 'color-mix(in oklch, var(--accent) 10%, transparent)' }}>
              <Icon size={19} aria-hidden="true" />
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{baslik}</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: 1.45, color: 'var(--ink-2)' }}>{metin}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlogdanSonYazilar() {
  const { data } = useQuery({
    queryKey: ['blog', 'ana-sayfa'],
    queryFn: () => api.get('/blog', { params: { limit: 3 } }).then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
  const yazilar = ilanlariAl(data).slice(0, 3);
  if (yazilar.length === 0) return null;

  return (
    <div>
      <BolumBasligi sag={<TumuBaglantisi href="/blog">Tümü</TumuBaglantisi>}>Blogdan</BolumBasligi>
      <div className="m-uclu-grid">
        {yazilar.map((y: any) => (
          <Link key={y.slug} href={`/blog/${y.slug}`} style={{ display: 'flex', gap: 12, alignItems: 'center', textDecoration: 'none', background: 'var(--bg-1)', border: '1px solid var(--line-soft)', borderRadius: 14, padding: 10 }}>
            {/* Yazilarin cogunda kapak yok; bos kutu gostermektense metin karti. */}
            {y.coverImage && (
              <img src={y.coverImage} alt="" loading="lazy" style={{ width: 84, height: 64, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} />
            )}
            <div style={{ minWidth: 0, padding: y.coverImage ? 0 : '4px 6px' }}>
              <span className="m-kicker" style={{ letterSpacing: '0.12em' }}>
                {[y.category, y.readTime ? `${y.readTime} dk` : null].filter(Boolean).join(' · ')}
              </span>
              <p style={{ margin: '5px 0 0', fontSize: 13.5, fontWeight: 600, lineHeight: 1.35, color: 'var(--ink)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {y.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function HomeContent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Hidrasyon uyusmazligini onlemek icin: ilk istemci render'i sunucununkiyle
  // birebir ayni olmali. Kategori grid'i React Query'nin "yukleniyor" durumuna
  // gore dallaniyordu; bu durum iki tarafta farkli oldugu icin (sunucuda istek
  // hic baslamiyor) React "Hydration failed" veriyordu - uretimde gunde
  // yuzlerce kez. Bu bayrak sayesinde ilk render her zaman iskelet oluyor,
  // gercek grid ancak mount sonrasi devreye giriyor.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  const handleRefresh = useCallback(() => queryClient.refetchQueries({ type: 'active' }), [queryClient]);

  const { data: allCategories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/listings/meta/categories').then(r => r.data),
  });

  const { data: allBrands = [] } = useQuery<BrandLite[]>({
    queryKey: ['brands'],
    queryFn: () => api.get('/listings/meta/brands').then(r => r.data),
  });

  const { data: yeniVeri } = useListings(YENI_ILAN_SORGUSU, true);
  const yeniIlanlar = hydrated ? ilanlariAl(yeniVeri) : [];

  const l1Categories = allCategories.filter(c => !c.parentId);

  const handleSearch = (val: string) => router.push(`/ara?q=${encodeURIComponent(val)}`);
  const handleSelect = (slug: string) => router.push(`/kategori/${slug}`);

  return (
    <div>
      <PullToRefresh onRefresh={handleRefresh} />
      <HeroSection
        onSearch={handleSearch} categories={allCategories} brands={allBrands}
        yeniIlanlar={yeniIlanlar}
      />
      <div className="m-wrap" style={{ paddingTop: 32, paddingBottom: 48, display: 'flex', flexDirection: 'column', gap: 'clamp(28px, 4vw, 40px)' }}>
        <FeaturedSection />
        {!hydrated || categoriesLoading ? (
          <CategoryGridSkeleton />
        ) : (
          <CategoryGrid categories={l1Categories} allCategories={allCategories} onSelect={handleSelect} />
        )}
        <YeniIlanlar adaylar={yeniIlanlar.slice(MOZAIK_ADEDI)} />
        <NasilCalisir />
        <BlogdanSonYazilar />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="m-wrap" style={{ paddingTop: 48 }}>
        <div className="m-listing-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="m-card" style={{ opacity: 0.4 }}>
              <div className="m-card-media" style={{ background: 'var(--bg-2)' }} />
              <div className="m-card-body">
                <div style={{ height: 12, background: 'var(--bg-3)', borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 10, background: 'var(--bg-3)', borderRadius: 6, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
