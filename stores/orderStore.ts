import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/lib/constants/products';

export interface OrderItem extends Product {
  quantity: number;
}

export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'initiated'
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'expired'
  | 'refunded';

const LEGACY_STATUS_MAP: Record<string, OrderStatus> = {
  pending: 'pending_payment',
  confirmed: 'processing',
};

const KNOWN_STATUSES: OrderStatus[] = [
  'draft',
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const KNOWN_PAYMENT_STATUSES: PaymentStatus[] = [
  'initiated',
  'pending',
  'authorized',
  'captured',
  'failed',
  'expired',
  'refunded',
];

export function normalizeOrderStatus(status: string): OrderStatus {
  const normalized = status.toLowerCase().replaceAll('-', '_');
  if (KNOWN_STATUSES.includes(normalized as OrderStatus)) {
    return normalized as OrderStatus;
  }
  return LEGACY_STATUS_MAP[normalized] ?? 'processing';
}

export function normalizePaymentStatus(status?: string | null): PaymentStatus | null {
  if (!status) return null;
  const normalized = status.toLowerCase().replaceAll('-', '_');
  return KNOWN_PAYMENT_STATUSES.includes(normalized as PaymentStatus)
    ? (normalized as PaymentStatus)
    : null;
}

export interface OrderEvent {
  actorType: string;
  actorId?: string | null;
  fromStatus?: OrderStatus | null;
  toStatus: OrderStatus;
  reason?: string | null;
  metadata?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string;
    address: string;
    email?: string | null;
    note?: string | null;
  };
  paymentMethod: string;
  paymentStatus?: PaymentStatus | null;
  reservationExpiresAt?: string | null;
  events?: OrderEvent[];
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
}

const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
    }),
    {
      name: 'godaz-orders-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useOrderStore;
