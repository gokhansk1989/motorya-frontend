import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PushPrompt } from '@/components/PushPrompt';
import { MobileNav } from '@/components/layout/MobileNav';
import { EmailVerificationBanner } from '@/components/ui/EmailVerificationBanner';
import { CookieConsent } from '@/components/ui/CookieConsent';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <EmailVerificationBanner />
      {/* Yigin sirasi CSS'te (.m-main): satir ici stil, acik alt kategori
          paneli icin gereken yukseltmeyi ezerdi. */}
      <main className="m-main">{children}</main>
      <Footer />
      <PushPrompt />
      <MobileNav />
      <CookieConsent />
    </>
  );
}
