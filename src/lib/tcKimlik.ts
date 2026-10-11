// T.C. kimlik numarasinin kendi icinde tutarli olup olmadigini kontrol eder.
// Yalnizca bicim ve saglama kontrolu yapar; numaranin gercekten o kisiye ait
// oldugunu DOGRULAMAZ. Sitede kimlik dogrulama akisi yoktur ve hicbir metinde
// oyleymis gibi anlatilmamalidir.
export function gecerliTcKimlik(tc: string): boolean {
  if (!/^[1-9][0-9]{10}$/.test(tc)) return false;
  const d = tc.split('').map(Number);
  const tek = d[0] + d[2] + d[4] + d[6] + d[8];
  const cift = d[1] + d[3] + d[5] + d[7];
  const onuncu = ((tek * 7) - cift) % 10;
  if (onuncu < 0 || onuncu !== d[9]) return false;
  const toplam = d.slice(0, 10).reduce((a, b) => a + b, 0);
  return (toplam % 10) === d[10];
}
