'use client';
import { useState } from 'react';
import { ChevronDown, Shield, Tag, MessageCircle, Package, HelpCircle, Star, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type FAQ = { q: string; a: string | React.ReactNode };
type Section = { icon: any; title: string; color: string; items: FAQ[] };

const sections: Section[] = [
  {
    icon: Shield,
    title: 'Güvenlik & Ödeme',
    color: 'var(--accent-2)',
    items: [
      {
        q: 'Motorya\'da ödeme nasıl yapılır?',
        a: 'Motorya yüz yüze ve güvenli elden alışverişi destekler. Satıcıyla mesajlaşarak buluşma yeri ve ödeme şeklini (nakit veya havale) kendiniz belirlersiniz. Site üzerinden para transferi yapılmaz.',
      },
      {
        q: 'Ödemeyi önceden yapmalı mıyım?',
        a: 'Hayır. Ürünü elinize almadan önce kesinlikle para göndermeyin. Güvenli bir buluşmada, ürünü gördükten sonra ödeme yapın. Tanımadığınız kişilere kapıya teslim veya kargo karşılığı önceden ödeme yapmamanızı kesinlikle öneririz.',
      },
      {
        q: 'Kargo ile satış yapılabilir mi?',
        a: 'Kargo seçeneği satıcıya bağlıdır. Kargo ile alışveriş yapacaksanız satıcının güven skoruna ve yorumlarına dikkat edin. Ödemeyi kargo şirketi aracılığıyla kapıda yapmanızı öneririz.',
      },
      {
        q: 'Dolandırıcılıkla karşılaşırsam ne yapmalıyım?',
        a: 'İlan sayfasındaki "Şikayet Et" butonunu kullanarak bize bildirin. Ayrıca savcılığa suç duyurusunda bulunabilirsiniz. Şüpheli durumları asla görmezden gelmeyin — diğer kullanıcıları korumak için bildirmek önemlidir.',
      },
      {
        q: 'Güvenli buluşma için ipuçları nelerdir?',
        a: 'Kamuya açık ve kalabalık bir yerde buluşun (kafeterya, AVM girişi, benzin istasyonu). Yalnız gitmekten kaçının, bir tanıdığınızı yanınıza alın. Ürünü teslim almadan ödeme yapmayın. Satıcının kimliğini görmekten çekinmeyin.',
      },
    ],
  },
  {
    icon: Tag,
    title: 'Teklif & Pazarlık',
    color: 'var(--accent)',
    items: [
      {
        q: 'Teklif nasıl veririm?',
        a: 'İlan sayfasındaki "Teklif Ver" butonuna tıklayın, fiyatınızı girin ve isterseniz bir mesaj ekleyin. Satıcı teklifinizi kabul edebilir, reddedebilir veya karşı teklifle yanıt verebilir.',
      },
      {
        q: 'Karşı teklif nedir?',
        a: 'Satıcı teklifinizi doğrudan kabul etmek yerine farklı bir fiyat önerebilir. Bu "karşı teklif" olarak gelir; siz de bunu kabul veya reddedebilirsiniz. Tekliflerim sayfasından takip edebilirsiniz.',
      },
      {
        q: 'Teklif kabul edildikten sonra ne olur?',
        a: 'Her iki taraf da bildirim alır. Ardından site içi mesajlaşma üzerinden satıcıyla iletişime geçerek buluşma ve ödeme detaylarını belirleyebilirsiniz. Teklif kabul etmek yasal bir bağlayıcılık içermez, ancak karşılıklı iyi niyet esastır.',
      },
      {
        q: 'Verdiğim teklifi geri çekebilir miyim?',
        a: 'Evet. Satıcı henüz yanıt vermediyse "Tekliflerim" sayfasından teklifinizi geri çekebilirsiniz.',
      },
      {
        q: 'Teklifimin süresi doluyor mu?',
        a: 'Evet, teklifler 48 saat içinde yanıtlanmazsa otomatik olarak sona erer.',
      },
    ],
  },
  {
    icon: Package,
    title: 'İlan Verme',
    color: 'var(--warn)',
    items: [
      {
        q: 'İlan vermek ücretsiz mi?',
        a: 'Evet, Motorya\'da ilan vermek tamamen ücretsizdir.',
      },
      {
        q: 'İlanım ne zaman yayına girer?',
        a: 'İlanınız gönderildikten sonra kısa sürede incelemeye alınır. Onaylandığında bildirim alır ve ilanınız hemen yayınlanır.',
      },
      {
        q: 'Kaç fotoğraf ekleyebilirim?',
        a: 'Bir ilana en fazla 8 fotoğraf ekleyebilirsiniz. Net ve aydınlık fotoğraflar ilanınızın daha hızlı satılmasını sağlar.',
      },
      {
        q: 'İlanımı nasıl düzenlerim?',
        a: '"İlanlarım" sayfasından ilgili ilanın yanındaki düzenle ikonuna tıklayarak fiyat, açıklama ve fotoğrafları güncelleyebilirsiniz.',
      },
      {
        q: 'Satıldı olarak nasıl işaretlerim?',
        a: 'İlan detay sayfasında "Satıldı İşaretle" butonunu kullanın. Bu işlem satış sayacınızı artırır ve güven skorunuzu yükseltir.',
      },
      {
        q: 'Rezerve Et özelliği ne işe yarar?',
        a: 'Bir alıcıyla anlaştıysanız ilanı 48 saat boyunca "Rezerve" olarak işaretleyebilirsiniz. Bu süre dolduğunda ilan otomatik olarak tekrar aktif olur.',
      },
    ],
  },
  {
    icon: MessageCircle,
    title: 'Mesajlaşma',
    color: '#06b6d4',
    items: [
      {
        q: 'Satıcıyla nasıl iletişim kurarım?',
        a: 'İlan sayfasındaki "Mesaj Gönder" butonuyla doğrudan mesaj başlatabilirsiniz. Mesajlaşma sayfasından konuşmalarınızı takip edebilirsiniz.',
      },
      {
        q: 'Telefon numaramı paylaşmak zorunda mıyım?',
        a: 'Hayır. Site içi mesajlaşmayı kullanmanızı öneririz. Kişisel bilgilerinizi yalnızca güvendiğiniz satıcılarla paylaşın.',
      },
      {
        q: 'Rahatsız edici mesajları nasıl engellerim?',
        a: 'Kullanıcı profilinden "Engelle" seçeneğini kullanabilirsiniz. Engellenen kullanıcılar size mesaj gönderemez veya ilanlarınızı göremez.',
      },
    ],
  },
  {
    icon: Star,
    title: 'Güven Skoru & Rozetler',
    color: '#f59e0b',
    items: [
      {
        q: 'Güven skoru nasıl hesaplanır?',
        a: 'Güven skoru; kimlik doğrulaması (40 puan), tamamlanan satış sayısı (30 puan), alınan yorumlar (20 puan) ve platform davranışı (10 puan) gibi faktörlere göre 0-100 arasında otomatik hesaplanır.',
      },
      {
        q: 'Rozetler nasıl kazanılır?',
        a: 'Kimliğinizi doğrulayarak, satış yaparak ve olumlu yorum alarak otomatik rozetler kazanırsınız. "Kurucu" rozeti, platformun ilk kullanıcılarına özel olarak verilir.',
      },
      {
        q: 'Yorum nasıl bırakırım?',
        a: 'Satın aldığınız bir ürün için satıcının profilinden yorum bırakabilirsiniz. Yorumlar alışveriş topluluğunun güvenini artırır.',
      },
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Şikayet & Sorun Bildirme',
    color: 'var(--bad)',
    items: [
      {
        q: 'Sahte bir ilanı nasıl bildiririm?',
        a: 'İlan detay sayfasının altındaki "Şikayet Et" butonunu kullanın. Ekibimiz ilgili ilanı inceleyerek gerekli aksiyonu alacaktır.',
      },
      {
        q: 'Hesabım nasıl askıya alınır?',
        a: 'Spam içerik, sahte ilan, başka kullanıcılara yönelik taciz veya dolandırıcılık girişimi gibi durumlarda hesaplar geçici veya kalıcı olarak askıya alınabilir.',
      },
      {
        q: 'Destek almak için nasıl iletişime geçebilirim?',
        a: (
          <>
            Bize{' '}
            <a href="mailto:destek@motorya.com.tr" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              destek@motorya.com.tr
            </a>{' '}
            adresinden ulaşabilirsiniz.
          </>
        ),
      },
    ],
  },
];

function AccordionItem({ q, a }: FAQ) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--line-soft)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', background: 'none', border: 0, padding: '16px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>{q}</span>
        <ChevronDown
          size={18}
          style={{ flexShrink: 0, color: 'var(--ink-3)', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      {open && (
        <div style={{ paddingBottom: 16, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function SSSPage() {
  return (
    <div className="m-wrap" style={{ maxWidth: 720, paddingTop: 48, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '6px 14px', borderRadius: 20, background: 'color-mix(in oklch, var(--accent) 10%, transparent)', border: '1px solid color-mix(in oklch, var(--accent) 25%, transparent)' }}>
          <HelpCircle size={14} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Yardım Merkezi</span>
        </div>
        <h1 className="m-display" style={{ fontSize: 36, marginBottom: 12 }}>Sıkça Sorulan Sorular</h1>
        <p style={{ fontSize: 16, color: 'var(--ink-3)', maxWidth: 480, margin: '0 auto' }}>
          Motorya'da alışveriş yaparken aklınıza takılan her şeyin cevabı burada.
        </p>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <div key={sec.title} style={{ background: 'var(--bg-1)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', background: `color-mix(in oklch, ${sec.color} 12%, transparent)` }}>
                  <Icon size={18} style={{ color: sec.color }} />
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{sec.title}</h2>
              </div>
              <div style={{ padding: '0 24px' }}>
                {sec.items.map((item) => (
                  <AccordionItem key={item.q} {...item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{ marginTop: 48, padding: 28, borderRadius: 16, background: 'color-mix(in oklch, var(--accent) 6%, var(--bg-1))', border: '1px solid color-mix(in oklch, var(--accent) 20%, transparent)', textAlign: 'center' }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Aradığınız cevabı bulamadınız mı?</p>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 16 }}>Destek ekibimiz size yardımcı olmaktan memnuniyet duyar.</p>
        <a
          href="mailto:destek@motorya.com.tr"
          className="m-btn m-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, padding: '0 24px', textDecoration: 'none' }}
        >
          destek@motorya.com.tr
        </a>
      </div>
    </div>
  );
}
