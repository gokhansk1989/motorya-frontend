import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Giriş & Üyelik',
  description: 'Motorya hesabınıza giriş yapın veya ücretsiz üye olun. İkinci el motosiklet kıyafet ve aksesuar al-sat dünyasına katılın.',
  robots: { index: false, follow: true },
};

/**
 * Bu grup STATIK URETILMIYOR.
 *
 * `middleware.ts` bu sayfalara her istekte benzersiz bir nonce veriyor.
 * Sayfa onceden uretilip onbellekten sunulsaydi HTML'deki nonce ile
 * basliktaki nonce tutmazdi ve TUM satir ici betikler engellenirdi --
 * olculdu: statik haldeyken HTML'de hic nonce yoktu, yani giris sayfasi
 * tamamen calismaz hale gelirdi.
 *
 * Bedeli dusuk: bu sayfalar zaten kisisellestirilmis, statik HTML
 * burada yalnizca bir kabuktu.
 */
export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
