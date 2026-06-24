import { cn } from '@/lib/utils';

const conditionMap: Record<string, string> = {
  NEW: 'Sıfır', LIKE_NEW: 'Sıfır Gibi', GOOD: 'İyi', FAIR: 'Makul', POOR: 'Kullanılmış',
};
const conditionColor: Record<string, string> = {
  NEW: 'bg-emerald-100 text-emerald-700',
  LIKE_NEW: 'bg-blue-100 text-blue-700',
  GOOD: 'bg-yellow-100 text-yellow-700',
  FAIR: 'bg-gray-100 text-gray-600',
  POOR: 'bg-red-100 text-red-700',
};
const statusMap: Record<string, string> = {
  CREATED: 'Oluşturuldu', AWAITING_PAYMENT: 'Ödeme Bekleniyor',
  PAID_ESCROW: 'Ödeme Alındı', SHIPPED: 'Kargoda', DELIVERED: 'Teslim Edildi',
  COMPLETED: 'Tamamlandı', DISPUTED: 'Anlaşmazlık', REFUNDED: 'İade', CANCELLED: 'İptal',
  PENDING: 'Bekliyor', ACCEPTED: 'Kabul', REJECTED: 'Reddedildi', WITHDRAWN: 'Geri Çekildi',
};

export function ConditionBadge({ condition }: { condition: string }) {
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', conditionColor[condition] || 'bg-gray-100 text-gray-600')}>
      {conditionMap[condition] || condition}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    PAID_ESCROW: 'bg-blue-100 text-blue-700',
    DELIVERED: 'bg-indigo-100 text-indigo-700',
    DISPUTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
    ACCEPTED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', colors[status] || 'bg-orange-100 text-orange-700')}>
      {statusMap[status] || status}
    </span>
  );
}
