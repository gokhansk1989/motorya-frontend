// Tek kaynak: tüm şehir listeleri (kategori sayfaları, şehir alt sayfaları, footer) buradan beslenir.
export const CITY_MAP: Record<string, string> = {
  istanbul: 'İstanbul', ankara: 'Ankara', izmir: 'İzmir', bursa: 'Bursa',
  antalya: 'Antalya', adana: 'Adana', konya: 'Konya', gaziantep: 'Gaziantep',
  mersin: 'Mersin', kocaeli: 'Kocaeli', diyarbakir: 'Diyarbakır', hatay: 'Hatay',
  manisa: 'Manisa', kayseri: 'Kayseri', samsun: 'Samsun', balikesir: 'Balıkesir',
  tekirdag: 'Tekirdağ', sakarya: 'Sakarya', denizli: 'Denizli', eskisehir: 'Eskişehir',
};

export const CITIES: [string, string][] = Object.entries(CITY_MAP);

// 81 ilin tam listesi — kategori/şehir sayfalarında kullanılan kısaltılmış CITY_MAP'ten farklı olarak,
// profil/kayıt formlarındaki "İl" seçimi gibi tam liste gereken yerlerde kullanılır.
export const ALL_CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
  'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kırıkkale', 'Kırklareli',
  'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
  'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt', 'Sinop',
  'Şırnak', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
];
