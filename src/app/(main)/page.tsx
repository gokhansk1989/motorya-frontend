import { SSR_API_URL } from '@/lib/apiBase';
import { AnaSayfa } from './AnaSayfa';

// Derleme aninda uretilmemeli: build CI'da yapiliyor ve oradan API'ye
// erisim yok; fetch sessizce basarisiz olup bos sonuc statik HTML'e
// gomuluyordu. Onbellek fetch seviyesinde (60 sn).
export const dynamic = 'force-dynamic';

/**
 * Vitrinde (one cikan) kac ilan var. Ana sayfa bu bolum icin yer ayiracak
 * mi, sunucu tarafinda bilmesi gerekiyor: istemci ancak veri gelince
 * ogreniyordu ve bos vitrin icin cizilen iskelet kaybolurken altindaki
 * her sey kayiyordu. Ulasilamazsa null - sayfa eski davranisa duser.
 */
async function vitrinAdedi(): Promise<number | null> {
  try {
    const res = await fetch(`${SSR_API_URL}/listings?isFeatured=true&limit=1`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const veri = await res.json();
    const toplam = veri?.meta?.total;
    return typeof toplam === 'number' ? toplam : null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  return <AnaSayfa vitrinAdedi={await vitrinAdedi()} />;
}
