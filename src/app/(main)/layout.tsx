import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PushPrompt } from '@/components/PushPrompt';
import { MobileNav } from '@/components/layout/MobileNav';
import { EmailVerificationBanner } from '@/components/ui/EmailVerificationBanner';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <EmailVerificationBanner />
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</main>
      <Footer />
      <PushPrompt />
      <MobileNav />
    </>
  );
}
