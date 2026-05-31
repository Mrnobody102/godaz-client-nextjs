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

export function normalizeOrderStatus(status: string): OrderStatus {
  if (KNOWN_STATUSES.includes(status as OrderStatus)) {
    return status as OrderStatus;
  }
  return LEGACY_STATUS_MAP[status] ?? 'processing';
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
  };
  paymentMethod: string;
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
