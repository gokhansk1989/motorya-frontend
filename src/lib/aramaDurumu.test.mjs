import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  adrestenOku, aramaAdresi, temizAdres, aramaSorgusu, facetSorgusu,
  facetSecenekleri, aktifEtiketler, filtreVarMi,
} from './aramaDurumu.ts';

const oku = (adres) => adrestenOku(new URL(adres, 'https://x.test').searchParams);
const ADLAR = { kategori: 'Mont', marka: 'Dainese', durum: 'İyi', cinsiyet: 'Erkek' };

test('adres -> durum -> adres gidis donusu hicbir filtreyi kaybetmez', () => {
  const adres = '/ara?q=mont&categoryId=k1&brandId=b1&condition=GOOD&gender=ERKEK&city=%C4%B0stanbul&sizeLabel=L&minPrice=2000&maxPrice=5000&sort=price_asc&page=3';
  const f = oku(adres);
  assert.equal(aramaAdresi(f, { page: f.page }), adres);
});

test('bir filtreyi degistirmek digerlerini korur, sayfayi basa alir', () => {
  const f = oku('/ara?categoryId=k1&sizeLabel=L&minPrice=2000&maxPrice=5000&page=4');
  const yeni = oku(aramaAdresi(f, { sizeLabel: 'XL' }));
  assert.equal(yeni.sizeLabel, 'XL');
  assert.equal(yeni.categoryId, 'k1');
  assert.equal(yeni.minPrice, 2000);
  assert.equal(yeni.maxPrice, 5000);
  assert.equal(yeni.page, 1);
});

test('gecersiz fiyat sunucuya gitmez', () => {
  for (const ham of ['0', '-5', 'abc', '']) {
    assert.equal(oku(`/ara?minPrice=${ham}`).minPrice, undefined, ham);
  }
  assert.equal(oku('/ara?minPrice=1').minPrice, 1);
});

test('beden secenekleri sayilirken beden filtresi haric, digerleri dahil', () => {
  const f = oku('/ara?categoryId=k1&brandId=b1&sizeLabel=L&city=Bursa&minPrice=2000&page=2');
  const s = facetSorgusu(f, 'sizeLabel');
  assert.equal(s.sizeLabel, undefined);
  assert.equal(s.categoryId, 'k1');
  assert.equal(s.brandId, 'b1');
  assert.equal(s.city, 'Bursa');
  assert.equal(s.minPrice, 2000);
  assert.equal(s.page, 1);
  // Asil sorgu degismiyor: sonuclar hala bedene gore suzuluyor.
  assert.equal(aramaSorgusu(f).sizeLabel, 'L');
});

test('sehir secenekleri sayilirken yalnizca sehir filtresi haric', () => {
  const s = facetSorgusu(oku('/ara?sizeLabel=L&city=Bursa'), 'city');
  assert.equal(s.city, undefined);
  assert.equal(s.sizeLabel, 'L');
});

test('L seciliyken diger bedenler listede kalir', () => {
  const liste = facetSecenekleri({ XL: 2, L: 1, S: 1, 36: 1 }, 'L');
  assert.deepEqual(liste.map((o) => o.value), ['XL', '36', 'L', 'S']);
});

test('sonucu kalmayan secili beden 0 ile listede kalir, kucuk harf de eslesir', () => {
  assert.deepEqual(facetSecenekleri({ XL: 2 }, 'L')[0], { value: 'L', count: 0 });
  assert.equal(facetSecenekleri({ L: 1 }, 'l').length, 1);
  assert.deepEqual(facetSecenekleri(undefined, ''), []);
});

test('adresteki her aktif filtrenin etiketi var', () => {
  const f = oku('/ara?categoryId=k1&brandId=b1&condition=GOOD&gender=ERKEK&city=Bursa&sizeLabel=L&minPrice=2000&maxPrice=5000');
  assert.deepEqual(aktifEtiketler(f, ADLAR).map((e) => e.etiket), [
    'Mont', 'Marka: Dainese', 'Beden: L', 'Fiyat: 2.000–5.000 ₺', 'Durum: İyi', 'Erkek', 'Şehir: Bursa',
  ]);
});

test('etiket yalnizca kendi filtresini kaldirir', () => {
  const f = oku('/ara?q=mont&categoryId=k1&sizeLabel=L&minPrice=2000&maxPrice=5000&city=Bursa');
  for (const e of aktifEtiketler(f, ADLAR)) {
    const sonra = oku(aramaAdresi(f, e.kaldir));
    const kalan = aktifEtiketler(sonra, ADLAR).map((x) => x.anahtar);
    const beklenen = aktifEtiketler(f, ADLAR).map((x) => x.anahtar).filter((a) => a !== e.anahtar);
    assert.deepEqual(kalan, beklenen, e.anahtar);
    assert.equal(sonra.q, 'mont');
  }
});

test('tek uclu fiyat araligi da etiketlenir', () => {
  assert.equal(aktifEtiketler(oku('/ara?minPrice=5000'), {})[0].etiket, 'Fiyat: 5.000 ₺ ve üzeri');
  assert.equal(aktifEtiketler(oku('/ara?maxPrice=500'), {})[0].etiket, 'Fiyat: en çok 500 ₺');
});

test('adi cozulmemis kategori ham kimlikle gosterilmez', () => {
  assert.deepEqual(aktifEtiketler(oku('/ara?categoryId=cmq9ys33'), {}), []);
});

test('tumunu temizle filtreleri atar, arama metnini ve siralamayi tutar', () => {
  const f = oku('/ara?q=k%C4%B1%C5%9Fl%C4%B1k+mont&categoryId=k1&sizeLabel=L&maxPrice=500&sort=price_asc&page=2');
  const sonra = oku(temizAdres(f));
  assert.equal(filtreVarMi(sonra), false);
  assert.equal(sonra.q, 'kışlık mont');
  assert.equal(sonra.sort, 'price_asc');
  assert.equal(temizAdres(oku('/ara?sizeLabel=L')), '/ara');
});

test('yalnizca fiyat filtresi de aktif filtre sayilir', () => {
  assert.equal(filtreVarMi(oku('/ara?maxPrice=500')), true);
  assert.equal(filtreVarMi(oku('/ara?q=mont&sort=oldest')), false);
});
