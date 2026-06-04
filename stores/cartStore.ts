import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/lib/constants/products';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Product, qty?: number) => boolean;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
}

function itemKey(item: Pick<Product, 'id' | 'cartKey'>) {
  return item.cartKey || String(item.id);
}

function isSameProduct(itemA: Pick<Product, 'id' | 'cartKey'>, itemB: Pick<Product, 'id' | 'cartKey'>) {
  return itemKey(itemA) === itemKey(itemB);
}

function clampQuantity(item: Product, quantity: number) {
  const safeQuantity = Math.max(0, Math.floor(quantity));
  if (typeof item.stock !== 'number') return safeQuantity;
  return Math.min(safeQuantity, Math.max(0, item.stock));
}

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, qty = 1) => {
        let added = false;
        set((state) => {
          const existingItem = state.items.find((i) => isSameProduct(i, item));
          if (existingItem) {
            const nextQuantity = clampQuantity(
              existingItem,
              existingItem.quantity + qty
            );
            added = nextQuantity > existingItem.quantity;
            return {
              items: state.items.map((i) =>
                isSameProduct(i, item)
                  ? { ...i, quantity: nextQuantity }
                  : i
              ),
            };
          }
          const nextQuantity = clampQuantity(item, qty);
          added = nextQuantity > 0;
          return nextQuantity > 0
            ? { items: [...state.items, { ...item, quantity: nextQuantity }] }
            : { items: state.items };
        });
        return added;
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => itemKey(item) !== String(id)),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (itemKey(item) !== String(id)) return [item];

            const nextQuantity = clampQuantity(item, quantity);
            return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
          }),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'godaz-cart-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
    }
  )
);

export default useCartStore;
