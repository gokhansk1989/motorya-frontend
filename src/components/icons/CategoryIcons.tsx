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
  kask: '/icons/kask.png',
  'kapali-kask': '/icons/kask.png',
  'acik-kask': '/icons/kask.png',
  'moduler-kask': '/icons/kask.png',
  'cross-enduro-kask': '/icons/kask.png',
  'adventure-kask': '/icons/kask.png',
  'kask-aksesuarlari': '/icons/kask.png',

  // Mont (L1 + L2)
  mont: '/icons/mont.png',
  'kislik-mont': '/icons/mont.png',
  'deri-mont': '/icons/mont.png',
  'softshell-mont': '/icons/mont.png',
  'gore-tex-mont': '/icons/mont.png',
  tulum: '/icons/mont.png',
  'uc-mevsim-mont': '/icons/mont.png',
  'yazlik-mont': '/icons/mont.png',
  yagmurluk: '/icons/mont.png',

  // Pantolon (L1 + L2)
  pantolon: '/icons/pantolon.png',
  'gore-tex-pantolon': '/icons/pantolon.png',
  'kot-kevlar-pantolon': '/icons/pantolon.png',
  'yazlik-pantolon': '/icons/pantolon.png',
  'deri-pantolon': '/icons/pantolon.png',
  'uc-mevsim-pantolon': '/icons/pantolon.png',
  'kislik-pantolon': '/icons/pantolon.png',

  // Eldiven (L1 + L2)
  eldiven: '/icons/eldiven.png',
  'deri-eldiven': '/icons/eldiven.png',
  'yazlik-eldiven': '/icons/eldiven.png',
  'kislik-eldiven': '/icons/eldiven.png',
  'uc-mevsim-eldiven': '/icons/eldiven.png',
  'gore-tex-eldiven': '/icons/eldiven.png',

  // Bot & Çizme (L1 + L2)
  'bot-cizme': '/icons/bot-cizme.png',
  'deri-bot': '/icons/bot-cizme.png',
  'yazlik-bot': '/icons/bot-cizme.png',
  'gore-tex-bot': '/icons/bot-cizme.png',
  'uc-mevsim-bot': '/icons/bot-cizme.png',
  'motosiklet-ayakkabisi': '/icons/bot-cizme.png',
  'kislik-bot': '/icons/bot-cizme.png',

  // Koruma (L1 + L2)
  koruma: '/icons/koruma.png',
  'diz-bacak-koruyucu': '/icons/koruma.png',
  'sirt-koruyucu': '/icons/koruma.png',
  'omuz-dirsek-koruyucu': '/icons/koruma.png',
  'boyun-koruyucu': '/icons/koruma.png',
  'tam-vucut-koruma': '/icons/koruma.png',
  'airbag-sistemi': '/icons/koruma.png',
  'gogus-koruyucu': '/icons/koruma.png',

  // Çanta (L1 + L2)
  canta: '/icons/canta.png',
  'canta-topcase': '/icons/canta.png',
  'canta-yan': '/icons/canta.png',
  'canta-tank': '/icons/canta.png',
  'canta-sirt': '/icons/canta.png',
  'canta-sehir': '/icons/canta.png',

  // Aksesuar (L1 + L2)
  aksesuar: '/icons/moto-aksesuar.png',
  'motosiklet-aksesuarlari': '/icons/moto-aksesuar.png',
  'aksesuar-elektronik': '/icons/moto-aksesuar.png',
  'aksesuar-guvenlik': '/icons/moto-aksesuar.png',
  'aksesuar-konfor': '/icons/moto-aksesuar.png',
  'aksesuar-tuning': '/icons/moto-aksesuar.png',

  // Sürücü Aksesuarları (L1 + L2)
  'surucu-aksesuarlari': '/icons/surucu-aksesuari.png',
  'termal-ic-giyim': '/icons/surucu-aksesuari.png',
  'boyunluk-buff': '/icons/surucu-aksesuari.png',
  'yagmurluk-tulum': '/icons/surucu-aksesuari.png',
  'yagmurluk-ust': '/icons/surucu-aksesuari.png',
  'yagmurluk-alt': '/icons/surucu-aksesuari.png',
  'kulak-tikaci': '/icons/surucu-aksesuari.png',
  'balaklava-maske': '/icons/surucu-aksesuari.png',
  'reflektif-urun': '/icons/surucu-aksesuari.png',
  'sirt-cantasi': '/icons/surucu-aksesuari.png',
  'surucu-yelegi': '/icons/surucu-aksesuari.png',
  'surucu-cantasi': '/icons/surucu-aksesuari.png',

  // Yedek Parça (L1 + L2)
  'yedek-parca': '/icons/yedek-parca.png',
  'parca-elektrik': '/icons/yedek-parca.png',
  'parca-motor': '/icons/yedek-parca.png',
  'parca-egzoz': '/icons/yedek-parca.png',
  'parca-kaporta': '/icons/yedek-parca.png',
  'parca-aktarma': '/icons/yedek-parca.png',
  'parca-lastik': '/icons/yedek-parca.png',
  'parca-suspansiyon': '/icons/yedek-parca.png',
  'parca-fren': '/icons/yedek-parca.png',

  // Bakım (L1 + L2)
  bakim: '/icons/bakim.png',
  'bakim-alet': '/icons/bakim.png',
  'bakim-lastik': '/icons/bakim.png',
  'bakim-yag': '/icons/bakim.png',
  'bakim-temizlik': '/icons/bakim.png',
};

export function CategoryIcon({ slug, size = 48, alt = '', className, style, iconUrl }: CategoryIconProps) {
  const src = iconUrl || ICON_MAP[slug] || '/icons/moto-aksesuar.png';
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
  return ICON_MAP[slug] ?? '/icons/moto-aksesuar.png';
}
