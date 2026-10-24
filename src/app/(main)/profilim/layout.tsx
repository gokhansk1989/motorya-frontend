import type { Metadata } from 'next';

/**
 * Hesap sayfasi: STATIK URETILMIYOR.
 *
 * `middleware.ts` buraya her istekte benzersiz bir nonce veriyor.
 * Onbellekten sunulan onceden uretilmis HTML'de o nonce bulunmaz ve
 * TUM satir ici betikler engellenirdi -- olculdu: statik haldeyken
 * HTML'de hic nonce yoktu. Sayfa zaten kisisellestirilmis, statik
 * HTML burada yalnizca bir kabuktu.
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Profilim',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
