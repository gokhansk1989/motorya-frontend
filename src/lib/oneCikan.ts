/**
 * İlanın öne çıkarmasının ŞU AN geçerli olup olmadığı.
 *
 * Neden ayrı bir yardımcı: `isFeatured` alanı tek başına yeterli değil.
 * Alan bir kez true yapılıyor ve süre dolduğunda ancak saatlik bir cron
 * onu geri indiriyor. İki arada bir derede kalan ilanlar (süresi dolmuş
 * ama cron henüz koşmamış) rozeti haksız yere taşırdı - nitekim cron
 * yazılmadan önce veritabanında aylardır bu durumda 12 kayıt vardı.
 *
 * Sunucudaki vitrin sorgusu zaten `featuredUntil > now()` arıyor. Bu
 * yardımcı istemci tarafında aynı kuralı uygular, böylece "vitrinde yok
 * ama rozeti var" tutarsızlığı hiçbir gecikmede oluşamaz.
 *
 * Tarihi olmayan bir öne çıkarma geçersiz sayılır: bitiş tarihi olmadan
 * ne zaman biteceği bilinemez ve sunucu da onu vitrine almaz.
 */
export function oneCikanGecerliMi(listing: unknown): boolean {
  const l = listing as { isFeatured?: boolean; featuredUntil?: string | null } | null;
  if (!l?.isFeatured || !l.featuredUntil) return false;
  const bitis = new Date(l.featuredUntil).getTime();
  return Number.isFinite(bitis) && bitis > Date.now();
}
