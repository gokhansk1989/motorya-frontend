'use client';
import { useSearchParams } from 'next/navigation';
import { donusSakla, donusOku } from '@/lib/donus';
import { useState, useEffect, Suspense } from 'react';
import { api } from '@/lib/api';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

function EmailGonderildiContent() {
  const searchParams = useSearchParams();
  /**
   * Dönüs hedefini bu sekmede sakla.
   *
   * E-posta dogrulama baglantisi POSTA KUTUSUNDAN aciliyor; adres
   * parametresini oraya tasiyamayiz (ve tasimamaliyiz - baglanti
   * baskasina iletilebilir). Hedefi burada birakiyoruz: kullanici AYNI
   * sekmede/tarayicida dogrulamayi tamamlarsa dogru yere donuyor.
   *
   * SINIR: baglanti BASKA bir cihazda ya da tarayicida acilirsa hedef
   * orada yoktur ve kullanici ana sayfaya duser. Bu kabul edilmis bir
   * sinir; alternatifi hedefi dogrulama jetonuna gomup e-postayla
   * tasimak olurdu ve bu baglantiyi iletilmeye daha duyarli yapardi.
   */
  useEffect(() => { donusSakla(donusOku(searchParams)); }, [searchParams]);
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  // Bekleme sayaci. Sunucu tarafinda hem IP hem hesap basina sinir var;
  // buradaki sayac kullaniciya "gonderildi mi, tekrar basmali miyim"
  // belirsizligini yasatmamak ve bos istek atmamak icin.
  const [bekleme, setBekleme] = useState(0);

  useEffect(() => {
    if (bekleme <= 0) return;
    const t = setTimeout(() => setBekleme(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [bekleme]);

  const resend = async () => {
    if (bekleme > 0 || resending) return;
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Doğrulama maili tekrar gönderildi.');
      setBekleme(60);
    } catch (err: any) {
      // 429: sunucu sinirina takildi. Kullaniciya "hata" demek yanlis olur,
      // istek gercekten cok sik geldi.
      if (err?.response?.status === 429) {
        toast.error('Çok sık denedin. Bir dakika sonra tekrar dene.');
        setBekleme(60);
      } else {
        toast.error('Bir hata oluştu.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'color-mix(in oklch, var(--accent) 12%, transparent)', display: 'grid', placeItems: 'center', margin: '0 auto 24px' }}>
          <Mail size={36} style={{ color: 'var(--accent)' }} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>E-postanı Doğrula</h1>
        <p style={{ color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 8 }}>
          <strong>{email}</strong> adresine doğrulama linki gönderdik.
        </p>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 32 }}>
          Linke tıklayarak hesabını aktifleştir. Link <strong>24 saat</strong> geçerlidir.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          {/* Gonderici adresini yaziyoruz: kullanici gereksiz klasorunde
              arayabilsin ve gonderen adresi guvenilir listeye ekleyebilsin. */}
          <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: 380 }}>
            Mail gelmediyse <strong>gereksiz / spam</strong> klasörünü kontrol et.
            Gönderen adres <strong>noreply@motorya.com.tr</strong> — bulursan
            &ldquo;spam değil&rdquo; olarak işaretlemen sonraki maillerin gelen kutusuna
            düşmesini sağlar.
          </p>
          <button onClick={resend} disabled={resending || bekleme > 0} className="m-btn m-btn-ghost" style={{ height: 42, padding: '0 20px', fontSize: 14 }}>
            {resending ? 'Gönderiliyor…' : bekleme > 0 ? `Tekrar Gönder (${bekleme}s)` : 'Tekrar Gönder'}
          </button>
          <Link href="/giris" style={{ fontSize: 13, color: 'var(--ink-3)', textDecoration: 'none' }}>
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EmailGonderildiPage() {
  return (
    <Suspense fallback={null}>
      <EmailGonderildiContent />
    </Suspense>
  );
}
