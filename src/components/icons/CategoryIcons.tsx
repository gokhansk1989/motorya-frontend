interface CategoryIconProps {
  slug: string;
  size?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ICON_MAP: Record<string, string> = {
  kask: '/icons/kask.png',
  'kapali-kask': '/icons/kask.png',
  'acik-kask': '/icons/kask.png',
  'moduler-kask': '/icons/kask.png',
  'cross-enduro-kask': '/icons/kask.png',
  'adventure-kask': '/icons/kask.png',
  mont: '/icons/mont.png',
  yagmurluk: '/icons/mont.png',
  pantolon: '/icons/pantolon.png',
  eldiven: '/icons/eldiven.png',
  'bot-cizme': '/icons/bot-cizme.png',
  koruma: '/icons/koruma.png',
  canta: '/icons/canta.png',
  aksesuar: '/icons/moto-aksesuar.png',
  'motosiklet-aksesuarlari': '/icons/moto-aksesuar.png',
  'surucu-aksesuarlari': '/icons/surucu-aksesuari.png',
  'yedek-parca': '/icons/yedek-parca.png',
  bakim: '/icons/bakim.png',
};

export function CategoryIcon({ slug, size = 48, alt = '', className, style }: CategoryIconProps) {
  const src = ICON_MAP[slug] ?? '/icons/moto-aksesuar.png';
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
