interface CategoryIconProps {
  slug: string;
  size?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  // Admin panelden yüklenmiş özel ikon (varsa slug haritasından önceliklidir)
  iconUrl?: string | null;
}

// Tek kaynak: tüm L1 ve L2 kategori slugları → ikon dosyası.
// L2 kategoriler parent L1'in ikonunu kullanır (ayrı L2 ikon yoksa).
export const ICON_MAP: Record<string, string> = {
  // Kask (L1 + L2)
  kask: '/icons/kask.webp',
  'kapali-kask': '/icons/kask.webp',
  'acik-kask': '/icons/kask.webp',
  'moduler-kask': '/icons/kask.webp',
  'cross-enduro-kask': '/icons/kask.webp',
  'adventure-kask': '/icons/kask.webp',
  'kask-aksesuarlari': '/icons/kask.webp',

  // Mont (L1 + L2)
  mont: '/icons/mont.webp',
  'kislik-mont': '/icons/mont.webp',
  'deri-mont': '/icons/mont.webp',
  'softshell-mont': '/icons/mont.webp',
  'gore-tex-mont': '/icons/mont.webp',
  tulum: '/icons/mont.webp',
  'uc-mevsim-mont': '/icons/mont.webp',
  'yazlik-mont': '/icons/mont.webp',
  yagmurluk: '/icons/mont.webp',

  // Pantolon (L1 + L2)
  pantolon: '/icons/pantolon.webp',
  'gore-tex-pantolon': '/icons/pantolon.webp',
  'kot-kevlar-pantolon': '/icons/pantolon.webp',
  'yazlik-pantolon': '/icons/pantolon.webp',
  'deri-pantolon': '/icons/pantolon.webp',
  'uc-mevsim-pantolon': '/icons/pantolon.webp',
  'kislik-pantolon': '/icons/pantolon.webp',

  // Eldiven (L1 + L2)
  eldiven: '/icons/eldiven.webp',
  'deri-eldiven': '/icons/eldiven.webp',
  'yazlik-eldiven': '/icons/eldiven.webp',
  'kislik-eldiven': '/icons/eldiven.webp',
  'uc-mevsim-eldiven': '/icons/eldiven.webp',
  'gore-tex-eldiven': '/icons/eldiven.webp',

  // Bot & Çizme (L1 + L2)
  'bot-cizme': '/icons/bot-cizme.webp',
  'deri-bot': '/icons/bot-cizme.webp',
  'yazlik-bot': '/icons/bot-cizme.webp',
  'gore-tex-bot': '/icons/bot-cizme.webp',
  'uc-mevsim-bot': '/icons/bot-cizme.webp',
  'motosiklet-ayakkabisi': '/icons/bot-cizme.webp',
  'kislik-bot': '/icons/bot-cizme.webp',

  // Koruma (L1 + L2)
  koruma: '/icons/koruma.webp',
  'diz-bacak-koruyucu': '/icons/koruma.webp',
  'sirt-koruyucu': '/icons/koruma.webp',
  'omuz-dirsek-koruyucu': '/icons/koruma.webp',
  'boyun-koruyucu': '/icons/koruma.webp',
  'tam-vucut-koruma': '/icons/koruma.webp',
  'airbag-sistemi': '/icons/koruma.webp',
  'gogus-koruyucu': '/icons/koruma.webp',

  // Çanta (L1 + L2)
  canta: '/icons/canta.webp',
  'canta-topcase': '/icons/canta.webp',
  'canta-yan': '/icons/canta.webp',
  'canta-tank': '/icons/canta.webp',
  'canta-sirt': '/icons/canta.webp',
  'canta-sehir': '/icons/canta.webp',

  // Aksesuar (L1 + L2)
  aksesuar: '/icons/moto-aksesuar.webp',
  'motosiklet-aksesuarlari': '/icons/moto-aksesuar.webp',
  'aksesuar-elektronik': '/icons/moto-aksesuar.webp',
  'aksesuar-guvenlik': '/icons/moto-aksesuar.webp',
  'aksesuar-konfor': '/icons/moto-aksesuar.webp',
  'aksesuar-tuning': '/icons/moto-aksesuar.webp',

  // Sürücü Aksesuarları (L1 + L2)
  'surucu-aksesuarlari': '/icons/surucu-aksesuari.webp',
  'termal-ic-giyim': '/icons/surucu-aksesuari.webp',
  'boyunluk-buff': '/icons/surucu-aksesuari.webp',
  'yagmurluk-tulum': '/icons/surucu-aksesuari.webp',
  'yagmurluk-ust': '/icons/surucu-aksesuari.webp',
  'yagmurluk-alt': '/icons/surucu-aksesuari.webp',
  'kulak-tikaci': '/icons/surucu-aksesuari.webp',
  'balaklava-maske': '/icons/surucu-aksesuari.webp',
  'reflektif-urun': '/icons/surucu-aksesuari.webp',
  'sirt-cantasi': '/icons/surucu-aksesuari.webp',
  'surucu-yelegi': '/icons/surucu-aksesuari.webp',
  'surucu-cantasi': '/icons/surucu-aksesuari.webp',

  // Yedek Parça (L1 + L2)
  'yedek-parca': '/icons/yedek-parca.webp',
  'parca-elektrik': '/icons/yedek-parca.webp',
  'parca-motor': '/icons/yedek-parca.webp',
  'parca-egzoz': '/icons/yedek-parca.webp',
  'parca-kaporta': '/icons/yedek-parca.webp',
  'parca-aktarma': '/icons/yedek-parca.webp',
  'parca-lastik': '/icons/yedek-parca.webp',
  'parca-suspansiyon': '/icons/yedek-parca.webp',
  'parca-fren': '/icons/yedek-parca.webp',

  // Bakım (L1 + L2)
  bakim: '/icons/bakim.webp',
  'bakim-alet': '/icons/bakim.webp',
  'bakim-lastik': '/icons/bakim.webp',
  'bakim-yag': '/icons/bakim.webp',
  'bakim-temizlik': '/icons/bakim.webp',
};

// Eski/bozuk veride 'helmet', 'jacket' gibi URL olmayan değerler kalmış olabilir — yalnızca
// gerçek bir URL/yol formatındaki iconKey'i kullan, diğer her şeyde slug haritasına düş.
const isValidIconUrl = (v?: string | null): v is string => !!v && /^(https?:\/\/|\/)/.test(v);

export function CategoryIcon({ slug, size = 48, alt = '', className, style, iconUrl }: CategoryIconProps) {
  const src = (isValidIconUrl(iconUrl) ? iconUrl : null) || ICON_MAP[slug] || '/icons/moto-aksesuar.webp';
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ objectFit: 'contain', ...style }}
      className={className}
    />
  );
}

export function getCategoryIconSrc(slug: string): string {
  return ICON_MAP[slug] ?? '/icons/moto-aksesuar.webp';
}
