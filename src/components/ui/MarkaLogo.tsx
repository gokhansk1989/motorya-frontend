import Link from 'next/link';

/**
 * Motorya wordmark'ı — işaret ve yazı tek görselde.
 *
 * Neden bileşen: logo başlıkta ve altı ayrı giriş/kayıt ekranında
 * görünüyor. Giriş ekranlarında logo yerine jenerik bir şimşek ikonu ve
 * elle yazılmış "MOTORYA" metni duruyordu; marka değiştiğinde oralar
 * geride kaldı. Tek yerden gelince bir daha ayrışmazlar.
 *
 * Görselin oranı 369×102 (3.62). `yukseklik` veriliyor, genişlik ondan
 * hesaplanıyor; dosya 3x çözünürlükte olduğu için retina ekranda da net.
 */
const ORAN = 369 / 102;

export function MarkaLogo({
  yukseklik = 34,
  link = true,
}: {
  yukseklik?: number;
  /** Ana sayfaya bağlantı. Zaten ana sayfadaysa kapatılabilir. */
  link?: boolean;
}) {
  const gorsel = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-wordmark.webp"
      alt="Motorya"
      width={Math.round(yukseklik * ORAN)}
      height={yukseklik}
      style={{ flexShrink: 0, display: 'block' }}
    />
  );

  if (!link) return gorsel;

  return (
    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
      {gorsel}
    </Link>
  );
}
