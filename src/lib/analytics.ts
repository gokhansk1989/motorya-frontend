/**
 * Dönüşüm ölçümü.
 *
 * GA yalnızca sayfa görüntüleme gönderiyordu; hangi kampanyanın üye ya da
 * ilan ürettiği görülemiyordu. Google Ads'in akıllı teklif algoritmaları da
 * dönüşüm sinyaliyle çalıştığı için sinyal yokken optimizasyon yapamıyor.
 *
 * Olaylar rıza verilmeden gönderilmez — Consent Mode varsayılanları
 * 'denied' olduğu için gtag çağrıları çerezsiz/kimliksiz moda düşer.
 */

type GtagFn = (...args: unknown[]) => void;

function gtag(...args: unknown[]) {
  if (typeof window === 'undefined') return;
  const fn = (window as unknown as { gtag?: GtagFn }).gtag;
  if (typeof fn === 'function') fn(...args);
}

/** Pazaryerinin gerçek dönüşümleri — reklam optimizasyonu bunlara dayanır. */
export const analytics = {
  signUp(method: 'email' | 'google' = 'email') {
    gtag('event', 'sign_up', { method });
  },

  listingCreated(params: { categoryName?: string; price?: number }) {
    gtag('event', 'listing_created', {
      item_category: params.categoryName,
      value: params.price,
      currency: 'TRY',
    });
  },

  conversationStarted(params: { listingId: string; price?: number }) {
    gtag('event', 'conversation_started', {
      item_id: params.listingId,
      value: params.price,
      currency: 'TRY',
    });
  },

  offerMade(params: { listingId: string; amount: number }) {
    gtag('event', 'offer_made', {
      item_id: params.listingId,
      value: params.amount,
      currency: 'TRY',
    });
  },

  listingViewed(params: { listingId: string; categoryName?: string; price?: number }) {
    gtag('event', 'view_item', {
      item_id: params.listingId,
      item_category: params.categoryName,
      value: params.price,
      currency: 'TRY',
    });
  },

  search(term: string) {
    gtag('event', 'search', { search_term: term });
  },
};

/** Çerez onayı değiştiğinde Google Consent Mode'u günceller. */
export function updateConsent(granted: boolean) {
  const value = granted ? 'granted' : 'denied';
  gtag('consent', 'update', {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });
}
