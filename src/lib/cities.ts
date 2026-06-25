// Tek kaynak: tüm şehir listeleri (kategori sayfaları, şehir alt sayfaları, footer) buradan beslenir.
export const CITY_MAP: Record<string, string> = {
  istanbul: 'İstanbul', ankara: 'Ankara', izmir: 'İzmir', bursa: 'Bursa',
  antalya: 'Antalya', adana: 'Adana', konya: 'Konya', gaziantep: 'Gaziantep',
  mersin: 'Mersin', kocaeli: 'Kocaeli', diyarbakir: 'Diyarbakır', hatay: 'Hatay',
  manisa: 'Manisa', kayseri: 'Kayseri', samsun: 'Samsun', balikesir: 'Balıkesir',
  tekirdag: 'Tekirdağ', sakarya: 'Sakarya', denizli: 'Denizli', eskisehir: 'Eskişehir',
};

export const CITIES: [string, string][] = Object.entries(CITY_MAP);
