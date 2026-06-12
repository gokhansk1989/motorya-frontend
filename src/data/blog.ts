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
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return BLOG_POSTS.filter(p => p.category === category);
}

export const BLOG_CATEGORIES = [...new Set(BLOG_POSTS.map(p => p.category))];
