import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/lib/constants/products';

export interface OrderItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
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
