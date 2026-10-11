export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  date: string;
  readTime: number;
  author: string;
  coverEmoji: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'ikinci-el-kask-alirken-dikkat-edilmesi-gerekenler',
    title: 'İkinci El Kask Alırken Dikkat Edilmesi Gereken 7 Şey',
    excerpt: 'İkinci el kask satın almak bütçe dostu görünse de yanlış seçim hayatınızı tehlikeye atabilir. İşte güvenli alım için bilmeniz gerekenler.',
    category: 'Güvenlik',
    tags: ['kask', 'güvenlik', 'ikinci el', 'satın alma rehberi'],
    date: '2026-06-01',
    readTime: 6,
    author: 'Motorya Editörü',
    coverEmoji: '🪖',
    content: `
## İkinci El Kask Neden Riskli Olabilir?

Kask, motosiklet ekipmanlarının en kritik parçasıdır. Yeni bir kask 3.000-15.000 TL arasında fiyatlanırken, ikinci el seçenekler cazip gelebilir. Ancak bilinçsiz bir alım, sizi koruyacak yerde mahkûm edebilir.

## 1. Kaza Geçmişini Mutlaka Sorgulayın

Bir kask tek bir darbeyi emmek için tasarlanmıştır. Gözle görülür bir hasar olmasa bile içindeki EPS (polistiren) köpük bir düşüşten sonra işlevini yitirir. Satıcıya direkt sorun: **"Bu kask hiç düştü mü, kazaya karıştı mı?"**

## 2. Üretim Tarihini Kontrol Edin

Kasktaki iç etikette üretim yılı yazar. Üreticilerin çoğu, kasklarını **5-7 yıl** kullanım için tasarlar. Plastik, köpük ve tutkal zamanla bozulur. 2018 öncesi kaskları değerlendirmeyin.

## 3. EPS Köpüğü İnceleyin

İç astarı çıkarın. EPS köpüğünde:
- Sararmış veya kırılmış bölgeler
- Düzensiz yüzeyler
- Çatlak veya göçükler

...varsa kaskı almayın.

## 4. Onay Etiketini Doğrulayın

Türkiye pazarında geçerli standartlar:
- **ECE 22.06** (en güncel, 2023 sonrası)
- **ECE 22.05** (hâlâ geçerli)
- **DOT** (ABD standardı, kabul görür)

Onay etiketi yoksa ya da silikse kesinlikle almayın.

## 5. Kilitler ve Tokaları Test Edin

Çene kayışı tokası, D halkası veya micrometric kilit sağlam çalışmalı. Zorlanıyorsa, yıpranmışsa yedek bulmak zor olabilir.

## 6. İç Astarı Değiştirilebilir mi?

Yıkanabilen ve çıkarılabilir iç astarlı kasklarda hijyen sorunu daha az önemli olur. Ama astar sabitse, önceki kullanıcının terlediği bir kasla her gün çıkmak istemeyebilirsiniz.

## 7. Fiyat-Değer Dengesini Doğru Kurun

Yeni bir giriş seviye kask 3.000-4.000 TL arasında bulunabilir. 3 yıllık bir kaskı 2.500 TL'ye almak mantıklı değil. Bütçeniz kısıtlıysa, **yeni bir giriş seviye kask** her zaman daha güvenli seçenektir.

## Sonuç

İkinci el kask alımında en güvenli senaryo: tanıdığınız, kaza geçirmediğini bildiğiniz biri tarafından kullanılmış, 3 yaşından küçük, onay etiketli bir kaski uygun fiyata almaktır. Motorya'da satıcılarla doğrudan iletişime geçerek tüm bu soruları sorabilirsiniz.
    `,
  },
  {
    slug: 'motosiklet-montu-secimi-rehberi',
    title: 'Motosiklet Montu Nasıl Seçilir? Mevsime Göre Ekipman Rehberi',
    excerpt: 'Yazlık, kışlık ve dört mevsim montlar arasındaki farklar, CE koruma seviyeleri ve Türkiye ikliminde doğru seçim için kapsamlı rehber.',
    category: 'Ekipman',
    tags: ['mont', 'koruma', 'CE sertifikası', 'mevsimlik ekipman'],
    date: '2026-05-28',
    readTime: 8,
    author: 'Motorya Editörü',
    coverEmoji: '🧥',
    content: `
## Motosiklet Montu Neden Önemli?

Sıradan bir ceket veya spor mont, asfaltta sürüklenen bir motosikletçiyi koruyamaz. Motosiklet montları; sırt, omuz, dirsek ve göğüs bölgelerine yerleştirilen sert/yumuşak koruyucular, aşınmaya dayanıklı kumaşlar ve bazen hava yastığı sistemiyle özel olarak tasarlanır.

## CE Koruma Seviyeleri

AB standartlarına göre koruyucular iki seviyede sertifikalandırılır:

| Seviye | Açıklama | Önerilen Kullanım |
|--------|----------|-------------------|
| CE Seviye 1 | Temel koruma | Şehir içi, kısa mesafe |
| CE Seviye 2 | Gelişmiş koruma | Otoyol, uzun mesafe, spor sürüş |

**Sırt koruyucusu** özellikle önemlidir. Pek çok uygun fiyatlı montta CE Seviye 1 veya hiç sırt koruyucusu gelmez — ayrıca satın alınması gerekir.

## Kumaş Türleri

### Tekstil (Kordura/Ballistic Naylon)
- Yaz-kış kullanıma uygun versiyonları var
- Nefes alabilir, su geçirmez membran eklenebilir
- Deri kadar aşınmaya dayanıklı değil ama pratik
- **Fiyat:** 2.500 – 12.000 TL

### Deri
- En yüksek aşınma direnci
- Yağmurda zor, soğukta dondurucu
- Uzun ömürlü, klasik görünüm
- **Fiyat:** 4.000 – 25.000+ TL

### Mesh (File)
- Yaz için mükemmel hava sirkülasyonu
- Kışın ve yağmurda yetersiz
- **Fiyat:** 1.800 – 6.000 TL

## Türkiye İkliminde Ne Seçmeli?

**İstanbul/Ege kıyı şeridi:** Dört mevsim tekstil mont + çıkarılabilir astar ideal.

**Anadolu iç bölgeler:** Kışları sert olduğundan, Ekim-Nisan arası sürüş yapıyorsanız su geçirmez membran ve termal astar şart.

**Akdeniz:** Yılın büyük bölümünde mesh mont yeterli, kış için ince bir tekstil yeterli.

## İkinci El Mont Alırken

Motorya'da satılan montlarda dikkat edilmesi gerekenler:

1. **Koruyucuların hâlâ yerinde olup olmadığını** sorun
2. **Fermuarlar ve sihirli bantlar** çalışmalı
3. **Görünür yırtık veya dikiş açıkları** varsa almayın
4. **Su geçirmez özellik** zamanla azalır — DWR spreyi ile yenilenebilir

## Popüler Markalar ve Fiyat Aralıkları (2026)

- **Alpinestars:** 4.500 – 20.000 TL
- **Dainese:** 5.000 – 25.000 TL
- **Rev'it:** 3.500 – 18.000 TL
- **Held:** 4.000 – 22.000 TL
- **Büse:** 3.000 – 15.000 TL

Motorya'da bu markaların ikinci el modellerini %30-60 indirimli bulabilirsiniz.
    `,
  },
  {
    slug: 'akrapovic-egzoz-rehberi',
    title: 'Akrapovic Egzoz Rehberi: Hangi Model, Hangi Motor için?',
    excerpt: 'Slip-on mu, full system mi? Titanium mu, karbon mu? Akrapovic egzoz seçerken bilmeniz gereken her şey ve ikinci el alımda dikkat noktaları.',
    category: 'Aksesuar',
    tags: ['akrapovic', 'egzoz', 'performans', 'slip-on', 'full system'],
    date: '2026-05-20',
    readTime: 7,
    author: 'Motorya Editörü',
    coverEmoji: '🔧',
    content: `
## Akrapovic Neden Bu Kadar Popüler?

Slovenya kökenli Akrapovic, 1990'dan bu yana motosiklet egzoz sistemlerinde dünya standardı haline geldi. Honda, Yamaha, BMW, Ducati gibi markaların fabrika yarış takımlarına egzoz üretmesi, markayı efsaneleştirdi.

## Slip-On mu, Full System mi?

### Slip-On (Susturucu Değişimi)
Sadece son susturucuyu değiştirirsiniz. Orta boru ve manifold orijinal kalır.
- **Artıları:** Ucuz, kolay montaj, muayeneden geçer (bazı modeller)
- **Eksileri:** Performans artışı sınırlı (3-5 HP)
- **Fiyat:** 8.000 – 25.000 TL (yeni)

### Full System (Tam Sistem)
Manifolddan itibaren her şey değişir.
- **Artıları:** Maksimum performans (8-15 HP), ciddi ağırlık tasarrufu
- **Eksileri:** Pahalı, montaj zor, muayene sorunu çıkabilir
- **Fiyat:** 20.000 – 60.000+ TL (yeni)

## Malzeme Seçimi

| Malzeme | Ağırlık | Dayanım | Fiyat |
|---------|---------|---------|-------|
| Paslanmaz çelik | Orta | Yüksek | Düşük |
| Titanyum | Düşük | Çok yüksek | Yüksek |
| Karbon fiber susturucu | Çok düşük | Orta (ısıya duyarlı) | En yüksek |

## Hangi Motora Uyar?

Akrapovic, her egzozu spesifik motor modeline göre üretir. **Asla farklı model egzozu uyarlamaya çalışmayın.** Motorya'da ilan verirken veya alırken mutlaka motor markası, modeli ve yılını belirtin.

## İkinci El Akrapovic Alırken

1. **Seri numarasını** susturucunun üzerinde arayın — orijinal Akrapovic ürünlerinde bulunur
2. **Renk bozulması:** Titanyum egzozlar kullanıldıkça mavi-mor renk alır, bu normaldir. Ancak **çatlak veya delik** varsa almayın
3. **Conta ve bağlantı noktaları** kontrol edin
4. **Hangi motor için üretildiğini** kesinlikle teyit edin
5. Karbon fiber susturucuda **laminasyon kabarması** var mı bakın

## Motorya'da Fiyat Aralıkları

- Slip-on (çelik, kullanılmış): 4.000 – 8.000 TL
- Slip-on (titanyum, kullanılmış): 7.000 – 15.000 TL
- Full system (çelik, kullanılmış): 10.000 – 22.000 TL
- Full system (titanyum, kullanılmış): 18.000 – 40.000 TL

Yenisinin %40-60'ı fiyatına gerçek Akrapovic bulmak mümkün — sadece doğru soruları sormanız gerekiyor.
    `,
  },
  {
    slug: 'motosiklet-eldiveni-secimi',
    title: 'Motosiklet Eldiveni Seçimi: Yazlık, Kışlık ve Yarış Eldivenleri',
    excerpt: 'Hangi eldivenin ne zaman kullanılacağı, knuckle koruması neden şart, ve ikinci el eldiven alımında hijyen sorununu nasıl çözersiniz?',
    category: 'Ekipman',
    tags: ['eldiven', 'koruma', 'güvenlik', 'sezonluk'],
    date: '2026-05-15',
    readTime: 5,
    author: 'Motorya Editörü',
    coverEmoji: '🧤',
    content: `
## Eldiven Neden Vazgeçilmez?

Düşme refleksi ellerinizi öne uzatmanıza neden olur — bu yüzden motosiklet kazalarında el ve bilek yaralanmaları en sık görülenlerdendir. Motorsiklet eldiveni bu enerjiyi dağıtmak, aşınmaya karşı korumak için tasarlanmıştır.

## Eldiven Türleri

### Yazlık (Mesh/Tekstil)
- Hava sirkülasyonu yüksek
- 20°C üzeri ideal
- Eklem ve avuç içi koruması olmalı
- **Fiyat:** 800 – 4.000 TL

### Kışlık (Su Geçirmez + Termal)
- Su geçirmez membran (Gore-Tex veya muadili)
- Yalıtım katmanı
- Parmak esnekliği azalır
- **Fiyat:** 1.200 – 6.000 TL

### Yarış/Spor
- Tam deri veya kompozit
- Titanyum/karbon eklem koruması
- Bilek desteği
- **Fiyat:** 2.500 – 12.000+ TL

### Dört Mevsim
- Çıkarılabilir astar
- Orta düzey hava akışı
- En pratik seçenek
- **Fiyat:** 1.500 – 7.000 TL

## CE EN 13594 Standardı

Eldivenler için temel standart EN 13594'tür. Etikette **Level 1** veya **Level 2** yazar. Eklem (knuckle) koruması olan model seçin.

## İkinci El Eldiven ve Hijyen

Eldiven hijyen açısından en sorunlu ikinci el ekipmandır. Ancak çözüm basit:

1. Yıkanabilir iç astar varsa çıkarıp **60°C'de yıkayın**
2. Deri eldivenler için **deri temizleyici + koşullandırıcı** kullanın
3. UV ışığında birkaç saat bırakmak antibakteriyel etki yapar

Motorya'da aldığınız eldiveni bu işlemden geçirdikten sonra rahatça kullanabilirsiniz.
    `,
  },
  {
    slug: 'motosiklet-botu-rehberi',
    title: 'Motosiklet Botu Rehberi: Spor, Touring ve Günlük Kullanım',
    excerpt: 'Motosiklet botları neden normal ayakkabıdan farklıdır, bilek koruması neden kritiktir ve doğru botu nasıl seçersiniz?',
    category: 'Ekipman',
    tags: ['bot', 'ayakkabı', 'bilek koruması', 'touring'],
    date: '2026-05-10',
    readTime: 5,
    author: 'Motorya Editörü',
    coverEmoji: '👢',
    content: `
## Motosiklet Botu ile Normal Ayakkabı Arasındaki Fark

Normal spor ayakkabı veya sneaker ile motosiklet kullanmak yaygın ama tehlikeli bir alışkanlıktır. Motosiklet botları şunları sağlar:

- **Bilek stabilitesi:** Düşmede ayak bileği burkulmasını engeller
- **Çelik veya TPU burun:** Ayak parmaklarını korur
- **Kayma karşıtı taban:** Islak zeminde kontrol sağlar
- **Malzeme dayanımı:** Asfalt sürtünmesine karşı deri/tekstil kombinasyonu

## Bot Kategorileri

### Spor/Yarış Botları
- Tam bilek desteği, sert dış kabuk
- Uzun mesafe yürüyüşe uygun değil
- **Fiyat:** 3.000 – 15.000 TL

### Touring Botları
- Yürüyüş konforu + motosiklet koruması dengesi
- Su geçirmez, uzun yol için ideal
- **Fiyat:** 2.500 – 12.000 TL

### Günlük/Urban Botlar
- Görsel olarak normal bot gibi
- Orta düzey koruma
- Şehir içi kullanıma uygun
- **Fiyat:** 1.800 – 8.000 TL

### Enduro/Off-Road Botları
- Yüksek bilekli, esnek taban
- Motokros ve doğa yolu için
- **Fiyat:** 2.000 – 10.000 TL

## Numaraya Dikkat

Bot seçiminde çorapla deneme yapın. Motosiklet botları genellikle Avrupa standardındadır ve Türk ölçülerinden 0.5-1 numara farklı olabilir.

## İkinci El Bot Alırken

1. **Taban aşınması:** Topuk veya parmak ucunda aşırı yıpranma varsa fren/vites tepkisi zorlaşır
2. **Fermuarlar ve tokaları** test edin
3. **İç astar** sökülüp yıkanabiliyorsa hijyen sorunu çözülür
4. **Bilek koruması** hâlâ yerinde mi kontrol edin
    `,
  },
  {
    slug: 'motosiklet-koruyucu-ekipman-rehberi',
    title: 'Motosiklet Koruyucu Ekipman Rehberi: Sırt, Diz ve Göğüs Koruması',
    excerpt: 'CE Level 1 ve Level 2 koruyucular arasındaki fark, hangi bölgelere koruyucu takılmalı ve airbag yelek teknolojisi hakkında bilmeniz gerekenler.',
    category: 'Güvenlik',
    tags: ['koruyucu', 'sırt koruması', 'airbag yelek', 'CE sertifikası'],
    date: '2026-05-05',
    readTime: 6,
    author: 'Motorya Editörü',
    coverEmoji: '🛡️',
    content: `
## Vücut Koruyucuları Neden Önemli?

Kask kafa yaralanmalarını azaltırken, vücut koruyucuları omurga, kaburga, omuz, dirsek ve diz yaralanmalarını engeller. Özellikle **sırt koruyucusu**, motosiklet kazalarının en sık yol açtığı omurilik yaralanmalarına karşı hayat kurtarıcıdır.

## Koruyucu Bölgeler

### Zorunlu (CE Standardına Göre)
- **Omuzlar**
- **Dirsekler**
- **Sırt** (bazı montlarda yoktur, ayrıca alınır)

### Önerilen Ek Koruyucular
- **Göğüs:** Öne çıkıntı parçalara çarpmada kritik
- **Kalça:** Touring sürücüleri için
- **Dizler:** Özellikle off-road'da

## CE EN 1621 Standartları

| Standart | Bölge | Level 1 | Level 2 |
|----------|-------|---------|---------|
| EN 1621-1 | Omuz, dirsek, diz, kalça | 35 kN altı | 20 kN altı |
| EN 1621-2 | Sırt | 18 kN altı | 9 kN altı |
| EN 1621-4 | Göğüs | 18 kN altı | 9 kN altı |

Level 2 koruyucu, aynı darbeye karşı iki kat daha fazla enerji absorbe eder.

## Airbag Yelek Teknolojisi

Son yılların en önemli gelişmesi airbag yelek ve airbag entegre montlardır.

### Mekanik (ip bağlantılı)
- Motosiklete bağlanan ip sayesinde düşmede açılır
- Ucuz (2.000 – 5.000 TL)
- Dik açıyla düşerse çalışmayabilir

### Elektronik (sensörlü)
- GPS, ivmeölçer ve jiroskop ile otomatik açılır
- Motosikletten ayrılmadan da tetiklenir
- **Hit-Air, Helite, Alpinestars Tech-Air** gibi markalar
- **Fiyat:** 8.000 – 25.000 TL

## Motorya'da İkinci El Koruyucu

Koruyucular, montun içinden çıkarılabilir ve ayrı satılabilir. Alırken:

1. **Standart etiketini** kontrol edin
2. **Kırık veya çatlak** var mı bakın
3. **Yaş:** 5 yaşından eski koruyucularda plastik sertleşir, koruma azalır
4. Airbag yeleği almadan önce **şişirme mekanizmasının** çalışıp çalışmadığını sorun
    `,
  },
  {
    slug: 'motosiklet-bakim-ipuclari',
    title: 'Motosiklet Bakımında Tasarruf: Kendiniz Yapabileceğiniz 8 İşlem',
    excerpt: 'Yağ değişimi, zincir bakımı, fren kontrolü gibi temel bakım işlemlerini servise götürmeden kendiniz nasıl yaparsınız?',
    category: 'Bakım',
    tags: ['bakım', 'yağ değişimi', 'zincir', 'fren', 'diy'],
    date: '2026-04-28',
    readTime: 9,
    author: 'Motorya Editörü',
    coverEmoji: '⚙️',
    content: `
## Neden Kendiniz Yapmalısınız?

Türkiye'de motosiklet servis ücretleri 2024-2026 arasında önemli ölçüde arttı. Basit bir yağ değişimi için 800-1.500 TL servis ücreti ödemek yerine, bu işlemleri kendiniz yaparak hem tasarruf edebilir hem de motorunuzu daha yakından tanıyabilirsiniz.

## 1. Motor Yağı Değişimi

**Gerekli malzeme:** Uygun yağ, yağ filtresi, drenaj kabı, İngiliz anahtarı seti

**Sıklık:** 3.000-5.000 km veya yılda bir (hangisi önce gelirse)

**Adımlar:**
1. Motoru 5 dakika çalıştırın (yağ aktıkça daha kolay akar)
2. Drenaj tapasını açın, yağın tamamen boşalmasını bekleyin
3. Yağ filtresini değiştirin
4. Yeni yağı ekleyin — **miktarı kullanım kılavuzundan kontrol edin**
5. Kontrol camına bakın, seviye "MAX" ile "MIN" arasında olmalı

**Maliyet tasarrufu:** 400-700 TL

## 2. Zincir Temizleme ve Yağlama

**Sıklık:** Her 500-1.000 km

**Nasıl:**
1. Arka tekerleği kaldırın (paddock stand veya merkezi stand)
2. Zincir temizleyici sprey sıkın
- Eski diş fırçasıyla kökleri temizleyin
3. Kuruyunca zincir yağı sıkın — içteki halkalar arası boşluklara
4. Fazla yağı silin (fırlayarak lastik veya fren diskine kaçmasın)

## 3. Zincir Gerginliği Ayarı

Zincir çok gevşekse sallanır ve dişlileri aşındırır; çok gerginse rulmanları zorlar. Orta noktada **15-25 mm sarkma** idealdir (çoğu motosiklet için).

## 4. Hava Filtresi Kontrolü

Her 10.000 km'de bir kontrol edin. Kâğıt filtreler değiştirilmeli, sünger filtreler yıkanıp yağlanabilir.

## 5. Ateşleme Bujisi

Kötü bujinin belirtileri: zor çalışma, güç kaybı, yakıt tüketim artışı.

Her 10.000-20.000 km'de bir değiştirin. Çıkarmadan önce çevresini temizleyin — piston gözüne kir düşmemeli.

## 6. Fren Balataları Kontrolü

Balata kalınlığı minimum 2 mm'nin altına düştüğünde değiştirin. Frenleme sırasında gıcırtı veya titreşim de balata değişimi sinyalidir.

## 7. Lastik Basıncı

Haftada bir kontrol edilmeli. Düşük lastik basıncı:
- Yakıt tüketimini artırır
- Lastik ömrünü kısaltır
- Virajlarda tutunmayı azaltır

Değerleri motosiklet eyer altındaki etiketten öğrenin.

## 8. Akü Bakımı

Uzun süre kullanmıyorsanız akü şarj cihazına bağlayın. Akü terminallerini vazelin ile kaplarsanız oksidasyon oluşmaz.

## Motorya ve İkinci El Yedek Parça

Bakım yaparken yedek parçaları Motorya'daki "Yedek Parça" kategorisinden temin edebilirsiniz. Özellikle filtreler, bujiler ve zincir-dişli setleri sıkça satışa çıkmaktadır.
    `,
  },
  {
    slug: 'turkiyede-motosiklet-turizmi',
    title: 'Türkiye\'de Motosiklet Turizmi: Karadeniz, Ege ve Doğu Anadolu Rotaları',
    excerpt: 'Türkiye\'nin en güzel motosiklet rotaları, mevsime göre planlama önerileri ve uzun yol için ekipman hazırlığı.',
    category: 'Rota & Seyahat',
    tags: ['rota', 'tur', 'karadeniz', 'ege', 'doğu anadolu'],
    date: '2026-04-20',
    readTime: 10,
    author: 'Motorya Editörü',
    coverEmoji: '🗺️',
    content: `
## Türkiye: Motosiklet Cenneti

Türkiye, çeşitli coğrafyasıyla Avrupa'nın en zengin motosiklet tur rotalarına sahip ülkelerinden biridir. Deniz kıyısından dağ geçitlerine, bozkırdan ormanlık vadilere kadar her sürüş tarzı için rota bulunur.

## Rota 1: Karadeniz Sahil Yolu (D010)

**Mesafe:** Samsun – Trabzon – Artvin arası yaklaşık 350 km
**En iyi mevsim:** Haziran – Eylül

Türkiye'nin efsanevi motosiklet rotası. Dar, kıvrımlı yol; soldan deniz, sağdan dağlar. Dikkat: Karadeniz'de hava aniden değişir, su geçirmez mont şarttır.

**Durulacak noktalar:**
- Ordu: Boztepe seyir terası
- Giresun: Giresun Adası
- Trabzon: Sümela Manastırı
- Artvin: Borçka Barajı, Şavşat geçitleri

## Rota 2: Ege İç Kesimleri (Tarihi Yollar)

**Mesafe:** İzmir – Efes – Pamukkale – Afrodisias – Bodrum yaklaşık 500 km
**En iyi mevsim:** Nisan – Haziran, Eylül – Ekim (yaz çok sıcak)

Antik kentler, zeytin bahçeleri ve kıvrımlı dağ yolları. Yazın 40°C'yi aşan sıcaklık için erken saatlerde yola çıkın.

## Rota 3: Doğu Anadolu – Nemrut, Van Gölü Çevresi

**Mesafe:** Malatya – Nemrut – Tatvan – Van – Doğubayazıt yaklaşık 700 km
**En iyi mevsim:** Temmuz – Ağustos

Yüksek irtifa, serin hava, muhteşem manzara. Nemrut'ta gece 2.000 m üzerinde sıcaklık 5-10°C'ye düşebilir — termal katlama şart.

## Rota 4: Toros Geçitleri

**Mesafe:** Adana – Pozantı – Ulukışla – Niğde döngüsü yaklaşık 300 km
**En iyi mevsim:** Mayıs – Haziran, Eylül

Kısa ama yoğun bir rota. Sarp geçitler, tüneller ve beklenmedik görüş mesafesi kayıpları. Deneyimli sürücüler için.

## Uzun Yol İçin Ekipman Hazırlığı

### Zorunlu
- Su geçirmez dış kılıf veya çanta
- Yedek tüp/tamir kiti
- Temel alet takımı
- Güneş kremi ve güneş gözlüğü

### Önerilen
- Isıtmalı yelek veya termal iç çamaşır
- Güvenli bölge yeleği (yüksek görünürlük)
- GPS veya telefon tutucu + powerbank
- Su torbası (hydration pack)

## Yakıt Planlaması

Doğu Anadolu'da bazı güzergâhlarda istasyonlar arası mesafe 80-100 km'yi geçebilir. Yedek yakıt kabı veya yakıt pompası ünitesi bulundurun.
    `,
  },
  {
    slug: 'agv-kask-modelleri-karsilastirma',
    title: 'AGV Kask Modelleri Karşılaştırması: K6, Pista GP-RR ve K3 Hangi Sürücü İçin?',
    excerpt: 'AGV\'nin popüler kask serilerini fiyat, güvenlik skoru, ağırlık ve kullanım senaryosu açısından karşılaştırıyoruz.',
    category: 'Ürün İnceleme',
    tags: ['agv', 'kask', 'karşılaştırma', 'K6', 'pista'],
    date: '2026-04-10',
    readTime: 7,
    author: 'Motorya Editörü',
    coverEmoji: '⭐',
    content: `
## AGV Hakkında

İtalyan kask üreticisi AGV, Valentino Rossi başta olmak üzere onlarca dünya şampiyonunun güvendiği markadır. 1947'den bu yana üretilen AGV kasklari, şu an ECE 22.06 sertifikalı seçenekleriyle Türkiye pazarında da yaygındır.

## Model Karşılaştırması

### AGV K3 — Giriş Seviyesi
- **Güvenlik:** ECE 22.06
- **Ağırlık:** ~1.500 g
- **Vizör:** Pinlock hazır, anti-çizik
- **Kullanım:** Şehir içi, günlük
- **Yeni fiyat:** 4.500 – 6.000 TL
- **Motorya'da ikinci el:** 2.000 – 3.500 TL

Giriş seviyesi için sağlam bir seçim. İç astarı çıkarılabilir ve yıkanabilir. Yüz kesimi biraz dar, oval yüzler için uygun.

### AGV K6 — Orta-Üst Segment
- **Güvenlik:** ECE 22.06, SHARP 5 yıldız
- **Ağırlık:** ~1.350 g
- **Vizör:** Optically correct, Pinlock 120
- **Kullanım:** Günlük, touring, sport
- **Yeni fiyat:** 9.000 – 13.000 TL
- **Motorya'da ikinci el:** 4.500 – 7.500 TL

Türkiye'nin en çok satan premium kask modellerinden biri. Hava sirkülasyonu mükemmel, yüz kesimi geniş tutulmuş. İletişim sistemi entegrasyonu destekliyor.

### AGV Pista GP-RR — Yarış Serisi
- **Güvenlik:** ECE 22.06, FIM onaylı
- **Ağırlık:** ~1.220 g (tam karbon)
- **Vizör:** Racetrack visor, Pinlock 70
- **Kullanım:** Pist, yüksek hız
- **Yeni fiyat:** 28.000 – 45.000+ TL
- **Motorya'da ikinci el:** 14.000 – 25.000 TL

Rossi ve Marquez'in pistlerde kullandığı modelin sokak versiyonu. Günlük kullanım için çok rijit ve gürültülü. Koleksiyon veya pist günleri için ideal.

### AGV Sportmodular — Modüler Seçenek
- **Güvenlik:** ECE 22.06 (hem açık hem kapalı)
- **Ağırlık:** ~1.650 g
- **Kullanım:** Touring, uzun yol
- **Yeni fiyat:** 14.000 – 20.000 TL
- **Motorya'da ikinci el:** 6.000 – 11.000 TL

Cam açılıp kapanabilen modüler kask. Trafik ışığında gözlük takmak veya su içmek için pratik. Touring sürücüleri için düşünülebilir.

## Hanisini Seçmeli?

| Sürüş Tipi | Öneri |
|-----------|-------|
| Şehir içi günlük | K3 veya K6 |
| Hafta sonu spor | K6 |
| Uzun tur | Sportmodular |
| Pist / yüksek performans | Pista GP-RR |

## Motorya'da AGV Alırken

Sahteciliğe dikkat: Türkiye pazarında sahte AGV kasklari mevcuttur. Gerçek AGV kasklarında:
- İç astar üzerinde AGV logosu işlemeli
- Seri numarası kapak iç kısmında ve kutu üzerinde eşleşmeli
- Vizör üzerinde "AGV" lazer baskısı bulunmalı
    `,
  },
  {
    slug: 'motosiklet-sigortasi-ve-ekipman-korumasi',
    title: 'Motosiklet Sigortası ve Ekipman Koruma: Neye Dikkat Etmeli?',
    excerpt: 'Motosiklet zorunlu sigortası, kasko, ekipman sigortası ve kazada haklarınızı biliyor musunuz? Türkiye\'deki yasal çerçeve ve pratik bilgiler.',
    category: 'Hukuk & Sigorta',
    tags: ['sigorta', 'kasko', 'trafik sigortası', 'ekipman sigortası'],
    date: '2026-04-01',
    readTime: 6,
    author: 'Motorya Editörü',
    coverEmoji: '📋',
    content: `
## Türkiye'de Motosiklet Sigortası Zorunluluğu

Türkiye'de her motorlu taşıt gibi motosikletler de **Zorunlu Mali Sorumluluk Sigortası (ZMSS)**, yani trafik sigortası yaptırmak zorundadır. Bu sigorta olmadan trafiğe çıkmak hem cezai hem de mali açıdan büyük risk demektir.

## Zorunlu Trafik Sigortası

2026 yılı limitlerinde trafik sigortası:
- **Kişi başı ölüm/sakatlık:** Yüksek limitler (her yıl DASK tarafından güncellenir)
- **Maddi hasar:** Karşı tarafın aracı için

**Önemli:** Trafik sigortası **kendi hasarınızı** karşılamaz. Sadece karşı tarafa verdiğiniz zararı öder.

## Kasko

İsteğe bağlı olan kasko, kendi motosikletinizdeki hasarı da karşılar. Motosiklet kasko primleri otomobile göre daha yüksek olabilir. Poliçe alırken dikkat edilmesi gerekenler:

- **Hırsızlık teminatı** var mı?
- **Kısmi hasar** dahil mi?
- **Muafiyet miktarı** nedir?
- **Anlaşmalı servis** listesi uygun mu?

## Ekipman Sigortası

Türkiye'de henüz yaygın olmasa da bazı sigorta şirketleri kask, mont ve diğer ekipmanları konut sigortasına ek teminat olarak ekleyebilir. Yüksek değerli ekipmanlarınız varsa (Pista GP-RR, Dainese airbag yelek vb.) bu seçeneği araştırın.

## Kazada Haklarınız

1. **Olay yerinden ayrılmayın** — yasal zorunluluk
2. **Fotoğraf çekin** — araçlar hareket etmeden
3. **Tarafsız tanık** bilgilerini alın
4. **Alkol veya ilaç** kullanmadığınızı ispatlayabilirsiniz (isteğe bağlı test hakkınız var)
5. **Sigorta şirketine 5 iş günü içinde** bildirin

## İkinci El Ekipman ve Sorumluluk

Motorya üzerinden aldığınız ekipmanla ilgili bir kaza yaşarsanız, satıcı **gizlenmiş kusur** nedeniyle yasal sorumluluk taşıyabilir. Bu nedenle alıcılar olarak; kask kaza geçmişi, ekipman yaşı gibi bilgileri yazışmalar yoluyla teyit etmenizi öneririz — mesajlaşma geçmişi hukuki belge niteliği taşır.
    `,
  },
  {
    slug: 'motosiklet-lastigi-secimi-ve-bakimi',
    title: 'Motosiklet Lastiği Seçimi: Sürüş Tipine Göre Doğru Lastik',
    excerpt: 'Yanlış lastik seçimi fren mesafesini uzatır, virajlarda tutunmayı azaltır. Şehir, tur ve spor sürücüler için kapsamlı lastik rehberi.',
    category: 'Bakım & Teknik',
    tags: ['lastik', 'güvenlik', 'bakım', 'teknik'],
    date: '2026-06-02',
    readTime: 7,
    author: 'Motorya Editörü',
    coverEmoji: '🛞',
    content: `
## Lastik Neden Bu Kadar Kritik?

Motosikletinizin yolla tek teması iki lastiktir. Ön lastik direksiyon ve frenlemenin %70'ini üstlenirken arka lastik güç aktarımı ve stabiliteyi sağlar. Yanlış lastik seçimi teknik bir tercih meselesi değil, güvenlik meselesidir.

## Lastik Tipleri

### Yol (Street) Lastikleri
Şehir ve karayolu kullanımı için tasarlanır. Dört mevsim sürüşe uygundur, ısınma süresi kısadır. Michelin Road 6, Pirelli Angel GT2 bu segmentin popüler modelleridir.

### Spor Lastikleri
Pist veya agresif sürüş için optimize edilmiştir. Sıcak asfaltta maksimum tutuş sağlarlar; ancak soğuk havada ve ıslak zeminde tehlikelidir. Pirelli Diablo Supercorsa, Bridgestone Battlax RS11.

### Tur Lastikleri
Uzun mesafe, yüklü sürüş ve değişken hava koşulları için. Daha sert karışım, daha uzun ömür. Michelin Road 5 GT, Continental ContiRoadAttack 3.

### Off-Road / Enduro Lastikleri
Çakıl, toprak ve ıslak zemin için agresif sırtlar. Asfalta çıkıldığında tutuş ciddi ölçüde düşer.

## Lastik Ölçü Kodunu Okumak

**190/55 ZR 17** formatında:
- **190** → Lastik genişliği (mm)
- **55** → En-yükseklik oranı (%)
- **Z** → Hız endeksi (Z = 240+ km/h)
- **R** → Radyal yapı
- **17** → Jant çapı (inç)

## Diş Derinliği ve Değişim Zamanı

Yasal minimum diş derinliği **1 mm**, ancak güvenli sürüş için **2 mm** altında değiştirin. Yan kanalların kapandığı, lastik yüzeyinde çatlakların belirdiği ya da 5 yılı geçen lastikler görsel olarak iyi görünse de değiştirilmelidir.

## Hava Basıncı

Üretici değerlerinden sapma:
- **+10% basınç**: Merkezde aşınma, azalan temas alanı
- **-10% basınç**: Kenarlarda aşınma, ısı artışı, patlama riski

Soğuk lastik basıncını ölçün; aylık kontrol yapın.
    `,
  },
  {
    slug: 'shoei-vs-agv-vs-arai-kask-karsilastirmasi',
    title: 'Shoei, AGV ve Arai: Üç Dünya Markasının Amansız Karşılaştırması',
    excerpt: '10.000 TL üzeri kask almadan önce bu yazıyı okuyun. Koruma, ağırlık, ses yalıtımı ve konfor açısından üç dev marka karşı karşıya.',
    category: 'Ekipman Rehberi',
    tags: ['kask', 'shoei', 'agv', 'arai', 'karşılaştırma'],
    date: '2026-06-03',
    readTime: 9,
    author: 'Motorya Editörü',
    coverEmoji: '🥊',
    content: `
## Piyasanın Üç Devi

Kask dünyasında Shoei, AGV ve Arai üçlemesi premium segmentin tartışmasız liderleridir. Üçü de ECE 22.06 ve SNELL sertifikalarına sahip, üçü de yıllarca geliştirilen aerodinamik tasarımlarıyla öne çıkar. Peki hangisi size göre?

## Shoei

Japon üretici, dengeli yapısıyla bilinir. Ses yalıtımında sektörün en iyilerinden biridir. GT-Air III modeli entegre güneş vizörüyle günlük sürücülerin favorisi; X-SPR Pro pist odaklı kullanıcılar için.

**Artılar:** Mükemmel ses yalıtımı, uzun kafa şekline uyum, geniş aksesuar ekosistemi
**Eksiler:** AGV'ye kıyasla daha dar hava kanalları, İtalyan rakiplerine göre biraz ağır

## AGV

İtalyan üretici, Valentino Rossi'nin kasklarıyla ünlenmiştir. Pista GP RR modeli FIM onaylı en hafif tam vizörlü kasklardan biridir. Karbon fiber kullanımında sektörün öncüsüdür.

**Artılar:** Olağanüstü hava kanalları, düşük ağırlık, sport styling
**Eksiler:** Yuvarlak kafa şekline odaklanır (oval kafa yapısı sıkışabilir), ses yalıtımı Shoei'nin biraz gerisinde

## Arai

Yine Japon, ancak felsefeleri tamamen farklı: Arai her modelini el yapımı üretir ve kaskı tek parça dış kabuk anlayışıyla tasarlar — darbe dağıtımı için.

**Artılar:** Üstün darbe dağılımı, en geniş kafa şekli yelpazesi, efsanevi dayanıklılık
**Eksiler:** Aerodinamik tasarım sınırlı, ağır, fiyat/özellik oranı tartışmalı

## Kim Ne Almalı?

| Profil | Öneri |
|---|---|
| Günlük şehir + tur | Shoei GT-Air III |
| Pist ağırlıklı | AGV Pista GP RR |
| Konfor ve uzun yol | Arai Tour-X 5 |
| Bütçe bilinçli premium | AGV K6 S |
    `,
  },
  {
    slug: 'kis-motosiklet-surmenin-ipuclari',
    title: 'Kışın Motosiklet Sürmek: 8 Temel Kural',
    excerpt: 'Sıfır derece, ıslak asfalt, donmuş zemin. Kış aylarında yola çıkmak isteyenler için ekipman, teknik ve zihinsel hazırlık rehberi.',
    category: 'Sürüş Teknikleri',
    tags: ['kış sürüşü', 'güvenlik', 'ekipman', 'teknik'],
    date: '2026-06-04',
    readTime: 6,
    author: 'Motorya Editörü',
    coverEmoji: '❄️',
    content: `
## Kışın Sürülebilir mi?

Kısaca: Evet, ama hazırlıklı olarak. Kış aylarında Türkiye'nin birçok şehrinde sıcaklık 0°C'nin üstünde kalmaktadır. Doğru ekipman ve teknikle kış sürüşü hem mümkün hem keyiflidir.

## 1. Isıtılmış Gidon Grizleri

El soğukluğu refleksleri yavaşlatır. 500 TL'den başlayan ısıtmalı grizler hem elektrikli hem de sürücü ehliyeti açısından fark yaratır.

## 2. Katmanlı Giyim Sistemi

Tek kalın mont yerine üç katman:
- **İç katman:** Moisture-wicking termal alt giysi
- **Orta katman:** Polar veya softshell
- **Dış katman:** Su geçirmez, rüzgar kesici motor montu

## 3. Su Geçirmez Bot

Islak ve soğuk ayak konsantrasyonu bozar. Gore-Tex astarlı motosiklet botları hem su geçirmez hem de koruyucu.

## 4. Lastik Sıcaklığına Dikkat

Soğuk havada lastikler optimal çalışma sıcaklığına ulaşmak için daha uzun süre ister. İlk 10-15 km sert ivmelenme ve sert frenleme yapmayın.

## 5. Fren Mesafesi Artar

Islak asfalt kuru yüzeye kıyasla fren mesafesini %30-50 uzatır. Takip mesafesini artırın.

## 6. Görünürlük

Kış sabahları sisi ve düşük güneş açısı sürücü görünürlüğünü etkiler. Yansıtıcı bant veya HiViz aksesuarlar kullanın.

## 7. Motoru Isıtın

Modern enjeksiyonlu motorlar soğukta da çalışır; ancak özellikle karburatörlü eski modellerde 2-3 dakika rölantide beklemek yağın tüm yüzeylere dağılmasını sağlar.

## 8. Erteleyebileceğinizi Bilin

Buz, sis yağmuru veya buzlanma uyarısı varsa yolculuğu ertelemek cesaret gerektirmez. İyi sürücü, sınırlarını bilendir.
    `,
  },
  {
    slug: 'motosiklet-zinciri-bakimi-ve-yagi',
    title: 'Motosiklet Zinciri Bakımı: Ne Zaman, Nasıl, Hangi Yağ?',
    excerpt: 'Bakımsız zincir hem performansı düşürür hem de tehlikeli bir kopma riskine yol açar. Adım adım zincir temizleme, yağlama ve germe rehberi.',
    category: 'Bakım & Teknik',
    tags: ['zincir', 'bakım', 'yağlama', 'teknik'],
    date: '2026-06-05',
    readTime: 5,
    author: 'Motorya Editörü',
    coverEmoji: '⛓️',
    content: `
## Zincir Neden Önemli?

Zincir, motordan tekere gücü aktaran kritik bir bileşendir. Kirli ve kuru bir zincir güç kaybına, sürtünme sesine ve en kötü durumda koparak arka tekerleği kilitlemesine yol açabilir.

## Ne Sıklıkta Bakım?

- Her **500-800 km** veya yağmurda sürüşten sonra
- Zinciriniz kirli, paslanmış veya "kuru" ses çıkarıyorsa hemen

## Adım Adım Temizlik

1. Motosikleti yan sehpaya alın
2. Motoru ılık tutun (soğuk değil, sıcak da değil)
3. Zincir temizleyici sprey (Motul, WD-40 Specialist) püskürtün
4. Yumuşak bir fırça veya bez ile boydan boya temizleyin
5. Temizleyicinin tamamen uçmasını bekleyin (5 dk)
6. Zincir yağı uygulayın: zincirlerin **iç bağlantı noktalarına** — dışından değil içten
7. 5 dk bekleyin, fazlasını bez ile silin

## Hangi Yağ?

- **O-Ring / X-Ring zincirler:** Özel zincir yağı (Motul Chain Lube Road, Castrol Chain Lube)
- **Standart zincirler:** Aynı yağlar veya 80W-90 şanzıman yağı (acil durum)
- **WD-40 kullanmayın:** Yağlama değil temizleme ürünüdür, O-ring contaları tahrip eder

## Zincir Germe

Kullandığınız modelin servis kılavuzuna bakın; çoğu motosiklette arka tekerlek ekseninde ölü boşluk **20-30 mm** olmalıdır. Fazla gergin zincir yatakları ve pinyon dişlisini aşındırır.

## Zincir Değişim Zamanı

- 15.000-20.000 km (bakım koşullarına göre değişir)
- Zincir uzadıysa (germe payı kalmadıysa) veya yan bağlantılarda aşınma varsa değiştirin
- Zinciri değiştirirken ön ve arka pinyon dişlisini de değiştirmek hem ekonomik hem mantıklıdır
    `,
  },
  {
    slug: 'ikinci-el-motosiklet-nasil-alinir',
    title: 'İkinci El Motosiklet Satın Alma Rehberi: 12 Kontrol Noktası',
    excerpt: 'Yüz binlerce TL\'lik bir alımda nelere dikkat etmelisiniz? Galeriden mi yoksa bireysel satıcıdan mı? Uzmanlardan derlenen kapsamlı kontrol listesi.',
    category: 'Satın Alma Rehberi',
    tags: ['ikinci el', 'satın alma', 'motosiklet', 'kontrol listesi'],
    date: '2026-06-06',
    readTime: 8,
    author: 'Motorya Editörü',
    coverEmoji: '🔍',
    content: `
## Neden Bu Kadar Dikkatli Olmalısınız?

İkinci el motosiklet pazarı Türkiye'de büyük ve dinamik, ama aynı zamanda riskli. Boyalı hasarlılar, değiştirilen kilometreler, belgesiz modifikasyonlar yaygın sorunlardır. 12 kontrol noktasını uygularsanız sürprizlerle karşılaşmazsınız.

## 1. Belgeleri Kontrol Edin

Ruhsat (tescil belgesi), sigorta poliçesi ve varsa servis kayıt defteriyle başlayın. Şase ve motor numaralarının belgelerle birebir eşleştiğini doğrulayın.

## 2. Kilometre Tutarlılığı

Gösterge panelindeki km ile servis kayıtları uyuşuyor mu? Servis aralıkları çok yakınsa ya da çok seyrekse sorgulamaya değer.

## 3. Boyalı Nokta Tespiti

Farklı parçalar arasında renk farkı, menteşe iç kısımlarında orijinal boya izleri, vidaların sıyrılmış olması kaza geçmişinin işaretleridir.

## 4. Şase ve Çerçeve

Özellikle direksiyon yatakları altında, motor altında ve sele altı taşıyıcı çerçevede bükülme, çatlak veya kaynak izi arayın.

## 5. Motor Sesi

Soğuk çalıştırın. Tik tik sesleri supap ayarı gerektirabilir; düzensiz rölanti karburatör / enjeksiyon sorununa işaret edebilir. Egzozdan çıkan mavi duman yağ yakımını gösterir.

## 6. Frenler

Fren diski minimum kalınlık çizgisinin üzerinde olmalı. Balata kalınlığı 2 mm altındaysa değişim zamanı. Hidrolik fren sıvısı koyu kahverengi ise bakım yapılmamış demektir.

## 7. Lastikler

Diş derinliği, yanlara doğru yaygın çatlak ve düzensiz aşınma profili. Lastik değişim maliyeti teklife yansıtılabilir.

## 8. Elektrik Sistemi

Tüm lambaları (far, stop, sinyal, gösterge paneli) çalıştırın. Modifiye edilmiş elektrik hatları yangın riskidir.

## 9. Test Sürüşü Yapın

Uygun belgeleriniz varsa mutlaka test edin. Titreşim, yol tutuş, fren tepkisi ve vites geçişlerini hissedin.

## 10. Piyasa Fiyatını Araştırın

Motorya ve diğer platformlarda aynı model ve yıla ait fiyatları karşılaştırın. Piyasanın çok altı genellikle bir şey saklar.

## 11. Ekspertiz

500-1.000 TL'ye motosiklet ekspertizi yaptırın. Kilometrede milyonlar söz konusuysa bu masraf önemsizdir.

## 12. Ödeme Güvenliği

Bireysel alımlarda nakit yerine banka havalesi kullanın; makbuz alın. Motorya bir ilan platformudur, ödemeye aracılık etmez: parayı ürünü görmeden göndermeyin.
    `,
  },
  {
    slug: 'motosiklet-depolama-ve-kis-uykusu',
    title: 'Motosikletinizi Kışa Hazırlamak: Adım Adım Depolama Rehberi',
    excerpt: 'Yılda 3-4 ay garajda kalan motosiklet bakımsız bırakılırsa ilkbaharda sizi hayal kırıklığıyla karşılar. Doğru kış uykusu prosedürü burada.',
    category: 'Bakım & Teknik',
    tags: ['kış bakımı', 'depolama', 'bakım', 'sezonluk'],
    date: '2026-06-07',
    readTime: 5,
    author: 'Motorya Editörü',
    coverEmoji: '🏠',
    content: `
## Neden Kış Bakımı Önemli?

Hareketsiz kalan motosiklet; karburatörde çökelen yakıt, boşalan akü, piston üzerinde korozyon ve lastikte düzleşme gibi sorunlara davet çıkarır. 2-3 saat harcayarak tüm bu sorunları önleyebilirsiniz.

## Adım 1: Son Bakım

Motoru yağıyla birlikte çalıştırın, yağ sıcakken boşaltın. Yeni yağ ve filtre takın — eski yağ içindeki asitler uzun süre motorunuzda kalmamalıdır.

## Adım 2: Yakıt Sistemi

**Karburatörlü motorlar:** Yakıt musluğunu kapatın, motor kendiliğinden durana kadar çalıştırın; karburatör şamandıra haznesini boşaltın.
**Enjeksiyonlu motorlar:** Tankı neredeyse doldurun ve yakıt katkısı (fuel stabilizer) ekleyin. Motoru 10 dk çalıştırarak katkının sisteme yayılmasını sağlayın.

## Adım 3: Akü

Aküyü çıkarın ve kışın her 4-6 haftada bir şarj edin — ya da bir akü bakım şarj cihazına (Battery Tender) bağlı bırakın.

## Adım 4: Lastikler

Motosikleti merkezi sehpaya alın; mümkünse ön ve arka tekerleri birlikte yerden kaldırın. Mümkün değilse lastik sertleşmesini önlemek için ayda bir 90 derece döndürün. Hava basıncını standart değere getirin.

## Adım 5: Yüzeyler

Tüm metal yüzeylere ince bir balmumu veya koruyucu sprey (ACF-50, Scottoiler FS 365) uygulayın. Zinciri yağlayın. Egzoz ağzını bez tıkayın.

## Adım 6: Örtme

Nefes alan motosiklet örtüsü kullanın. Plastik örtü nem tutar, korozyonu hızlandırır.

## İlkbaharda Açılış Kontrol Listesi

- Akü şarjı ve terminaller
- Lastik basıncı ve yüzey kontrolü
- Fren sıvısı seviyesi
- Zincir gerginliği ve yağı
- Tüm lambaların çalışması
- Kısa test sürüşü
    `,
  },
  {
    slug: 'motosiklet-suruse-baslangiç-rehberi',
    title: 'Motosiklete Başlangıç: A\'dan Z\'ye Yeni Sürücü Rehberi',
    excerpt: 'Ehliyet kursu biter, motor alırsınız — peki sonra? İlk 6 ayın en kritik 10 öğrenimi, deneyimli sürücülerin önerisiyle.',
    category: 'Sürüş Teknikleri',
    tags: ['başlangıç', 'yeni sürücü', 'güvenlik', 'öğrenim'],
    date: '2026-06-08',
    readTime: 7,
    author: 'Motorya Editörü',
    coverEmoji: '🎓',
    content: `
## Ehliyet Bitti, Asıl Öğrenim Başlıyor

Motosiklet ehliyeti almak sizi güvenli sürücü yapmaz; sizi yola çıkmaya hazırlar. Gerçek öğrenim saatlerce pratikle gelir. İlk 6 ayınızı doğru geçirirseniz hem becerileriniz hem de özgüveniniz doğru temele oturur.

## 1. Ağır veya Güçlü Motorla Başlamayın

600cc sport veya 900cc naked — istatistiksel olarak yeni sürücülerin en çok kaza yaptığı motosikletlerdir. 250-400cc bir başlangıç motuyla ilerleyin. Güç istiyorsanız beceri kazandıktan sonra geçin.

## 2. ATGATT Kuralı

**All The Gear, All The Time.** Kask, eldiven, bot, mont ve koruyucu pantolon — kısa mesafe de olsa. Kaza çoğunlukla beklenmedik anlarda olur.

## 3. Gözlerinizi Uzağa Odaklayın

Yeni sürücüler önüne bakar, deneyimliler viraj çıkışına. Gözlerinizi nereye yönlendirirseniz motor oraya gider. Virajda çıkışı görün, virajı geçersiniz.

## 4. Frenlemeyi Öğrenin

Motosiklette fren kuvvetinin **~70-80%'i ön frendir.** Ön frenin yeterince kullanılmaması en yaygın yeni sürücü hatasıdır. Boş bir alanda sert frenleme pratiği yapın.

## 5. Kayma Noktasını Tanıyın

Islak asfalt, çizgiler, mazot izleri, kum — bunların üzerinde fren yapmayın. Islak zemin farkındalığını şehirde pratikle geliştirin.

## 6. Araç Takibinde Mesafe

Motosiklet fren mesafesi kısa, ama arkadan gelen araç sizi görmüyor olabilir. Trafik ışığında dururken orta şerit yerine hafif yan konumlanın.

## 7. Görünür Olun

Koyu renkli kıyafetler sizi karıştırır. HiViz yelek, yansıtıcı şeritler veya renkli kask görünürlüğünüzü artırır.

## 8. Kursa Devam Edin

A2 ehliyeti aldıktan sonra da ileri sürüş kurslarına (MSF, IAM) katılabilirsiniz. Bu kurslar hem beceriyi hem sigortayı etkiler.

## 9. Yalnız Gitmeyin (Başta)

İlk 3-6 ayda deneyimli biriyle birlikte gidin. İpuçları gerçek zamanlı paylaşılır, acil durumda yardım alırsınız.

## 10. Yorgunken Sürmeyin

Yorgunluk refleksleri %40 kadar yavaşlatır. 3 saatten fazla sürmeden önce mola verin.
    `,
  },
  {
    slug: 'alpinestars-vs-dainese-koruyucu-giysi',
    title: 'Alpinestars mı Dainese mi? İki Devletin Kapsamlı Karşılaştırması',
    excerpt: 'Motor dünyasının iki büyük markası aynı segmentte yarışıyor. Pist güvenliği, günlük kullanım konforu ve fiyat/performans oranında gerçek kazanan kim?',
    category: 'Ekipman Rehberi',
    tags: ['alpinestars', 'dainese', 'mont', 'koruyucu', 'karşılaştırma'],
    date: '2026-06-09',
    readTime: 8,
    author: 'Motorya Editörü',
    coverEmoji: '🥋',
    content: `
## İki İtalyan Dev

Alpinestars (1963, Asolo) ve Dainese (1972, Vicenza) — her ikisi de İtalyan, her ikisi de MotoGP ekiplerinin resmi tedarikçisi ve her ikisi de premium motosiklet giysi segmentinin liderleri.

## Koruma Teknolojisi

**Alpinestars:**
Öne çıkan teknoloji **Nucleon** airbag sistemi. Tech-Air serisi, bir düşüşü 0.06 saniyede tespit edip tetiklenebilir. CE Seviye 2 koruyucular standarttır. GP Pro glove'ların ellerin dördüncü ve beşinci parmak koruması sektörün en güçlülerinden.

**Dainese:**
Airbag konusunda öncü — D-Air sistemi 2009'dan beri üretimde. Misano ve Mugello modellerinde fiber takviyeli omuz ve dirsek koruyucuları bulunur. G1 Air omuz koruyucusu EN 1621-1 Level 2 sertifikalı.

## Kumaş ve Dikiş Kalitesi

Dainese'nin üst segment modelleri genellikle daha ince ve vücuda oturan bir kesime sahipken Alpinestars daha geniş Amerikan pazarını göz önünde bulundurarak biraz daha bol bir kalıp sunar. Her iki markanın da dikişleri ARMACOR veya 500 denier Cordura ile korunmuştur.

## Boyut Uyumu

Alpinestars Avrupa kesimi kullanırken Dainese biraz daha dar İtalyan kesimi tercih eder. Satın almadan önce mutlaka deneyin.

## Fiyat Karşılaştırması (2026)

| Ürün | Alpinestars | Dainese |
|---|---|---|
| Giriş Tekstil Mont | 4.500 TL | 4.800 TL |
| Orta Segment Deri | 9.000 TL | 10.200 TL |
| Airbag Yelek | 18.000 TL | 22.000 TL |

## Sonuç

Günlük tur sürücüsü için Alpinestars Andes V3 veya Dainese Tempest 3 eşdeğer alternatifledir. Pist odaklı kullanıcılar için Dainese'nin airbag entegrasyonu öne çıkar; ancak Alpinestars Tech-Air ile bu farkı kapatmıştır.
    `,
  },
  {
    slug: 'motosiklet-fotograflari-iyi-cekmek',
    title: 'İlanınız İçin Çarpıcı Motosiklet Fotoğrafları Çekmek',
    excerpt: 'Motorya\'da iyi fotoğraflı ilanlar 3 kat daha fazla teklif alıyor. Profesyonel ekipman gerekmez — sadece bu 7 ipucunu uygulayın.',
    category: 'Satış İpuçları',
    tags: ['fotoğraf', 'ilan', 'satış', 'ipuçları'],
    date: '2026-06-10',
    readTime: 4,
    author: 'Motorya Editörü',
    coverEmoji: '📸',
    content: `
## Fotoğraf Satışı Belirler

Motorya'daki ilanları analiz ettiğimizde, doğal ışıklı ve temiz arka planlı ilanların ortalama 3.1 kat daha fazla teklif aldığını gördük. Alıcı, göremediğine teklif vermez.

## 1. Altın Saat Işığını Kullanın

Güneş doğduktan sonraki veya batmadan önceki 1 saat — fotoğrafçıların "altın saat" dediği bu dönemde ışık yumuşak ve sarımtırak olur. Gölgeler sertleşmez, metal yüzeyler parlak ama göz almaz.

## 2. Temiz Arka Plan

Dağınık garaj, çöp kutuları veya park halindeki arabalar dikkat dağıtır. Açık renkli bir duvar önü, boş bir otopark ya da yeşillik alan idealdir.

## 3. Motosikleti Temizleyin

Fotoğraf çekmeden önce yıkayın. Temiz metal ışığı yansıtır, ilanın algılanan değerini artırır.

## 4. Zorunlu Açılar

Her ilan için minimum 6 fotoğraf:
- Sağ 3/4 ön açı (klasik showroom pozu)
- Sol 3/4 arka açı
- Sağ yan profil
- Gösterge paneli ve kilometre
- Motor ve şase numarası
- Varsa hasar veya yıpranma noktası

## 5. Telefonunuzu Yatay Tutun

Dikey fotoğraflar web görünümünde kesilir. Her zaman yatay (landscape) çekin.

## 6. Işığa Karşı Çekmeyin

Güneş arkanızda olmamalı. Motosiklet ışığa doğru, siz arkasında durun.

## 7. Hasarı Gizlemeyin

Çizik, ezik veya aşınmış parçaları net fotoğraflayın. Açık ilanlar hem güven yaratır hem iade riskini azaltır. Gizlenen hasar iade anlaşmazlıklarının başlıca nedenidir.
    `,
  },
  {
    slug: 'motosiklet-ekipman-bakimi-uzun-omur',
    title: 'Ekipmanınızı 10 Yıl Kullanın: Doğru Bakım ve Depolama',
    excerpt: 'Kaliteli bir motor montu 3.000 TL, iyi bir kask 8.000 TL. Bu yatırımı doğru korursanız yıllarca sizi korumaya devam eder.',
    category: 'Bakım & Teknik',
    tags: ['ekipman bakımı', 'kask', 'mont', 'uzun ömür'],
    date: '2026-06-11',
    readTime: 5,
    author: 'Motorya Editörü',
    coverEmoji: '🧹',
    content: `
## Ekipman Pahalıdır, Bakımı Değil

Motosiklet ekipmanına yılda yapacağınız 1-2 saatlik bakım, ekipmanınızın ömrünü iki katına çıkarabilir. İşte malzeme bazında rehber:

## Kask Bakımı

**İç astar:** Çıkarılabiliyorsa ılık suda hafif deterjanla yıkayın. Çıkarılamıyorsa sprey kask temizleyici kullanın.
**Dış kabuk:** Oto şampuanı veya kask temizleyiciyle yumuşak bez. Solvent, aseton, benzin kesinlikle kullanmayın — plastik kabuğu çatlatır.
**Vizör:** Mikro fiber bez ve özel vizör spreyi. Islak kâğıt peçete çizgilenmeye neden olur.
**Depolama:** Direkt güneş ışığından ve kimyasal buhardan uzak, havadar bir çantada.

## Mont ve Pantolon Bakımı

**Tekstil:** Üreticinin etiketi önce kontrol edin. Çoğu 30°C hassas programda yıkanabilir. Kir kalmadan bekletmeyin — uzun süre kalan kir kumaşı bozar.
**Deri:** Islak bezle silip deri besleme kremi (Leather Honey, Lederbalsam) uygulayın. Yıkamayın.
**Koruyucular:** CE koruyucuları 3-5 yılda bir kontrol edin; sertleşmiş veya kırılmış olanları değiştirin.

## Eldiven Bakımı

Deri eldivenleri makineye atmayın. Islak bez temizliği + deri kremi. İçini ters çevirip hava aldırın.

## Bot Bakımı

Su geçirmezliği korumak için NIKWAX veya Grangers su iticiyi her sezonda uygulayın. Metal tokaları kurulayın, korozyonu önleyin.

## Genel Depolama Kuralları

- Plastik torba yerine kumaş çanta
- Direkt güneş ışığı UV solmasına neden olur
- Kask hiçbir zaman ağırlık altında bırakılmaz
- Mont, askıya asılı durmalı — katlanmış değil
    `,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return BLOG_POSTS.filter(p => p.category === category);
}

export const BLOG_CATEGORIES = [...new Set(BLOG_POSTS.map(p => p.category))];
