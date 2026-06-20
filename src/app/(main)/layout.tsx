import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PushPrompt } from '@/components/PushPrompt';
import { MobileNav } from '@/components/layout/MobileNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>{children}</main>
      <Footer />
      <PushPrompt />
      <MobileNav />
    </>
  );
}
