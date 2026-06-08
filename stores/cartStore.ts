import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/lib/constants/products';
import {
  clearServerCart,
  removeServerCartLine,
  updateServerCartLine,
} from '@/lib/api';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Product, qty?: number) => boolean;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  replaceCart: (items: CartItem[]) => void;
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

function hasServerSession() {
  return typeof window !== 'undefined' && Boolean(localStorage.getItem('token'));
}

function toServerLine(item: CartItem, quantity = item.quantity) {
  return {
    productId: Number(item.id),
    variantId:
      typeof item.variantId === 'number' && Number.isFinite(item.variantId)
        ? item.variantId
        : undefined,
    quantity,
  };
}

function syncLine(item: CartItem, quantity = item.quantity) {
  if (!hasServerSession() || !Number.isFinite(Number(item.id))) return;
  void updateServerCartLine(toServerLine(item, quantity)).catch(() => undefined);
}

function syncRemove(item: CartItem) {
  if (!hasServerSession() || !Number.isFinite(Number(item.id))) return;
  void removeServerCartLine(Number(item.id), item.variantId).catch(() => undefined);
}

const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, qty = 1) => {
        let added = false;
        let nextItem: CartItem | null = null;
        set((state) => {
          const existingItem = state.items.find((i) => isSameProduct(i, item));
          if (existingItem) {
            const nextQuantity = clampQuantity(
              existingItem,
              existingItem.quantity + qty
            );
            added = nextQuantity > existingItem.quantity;
            nextItem = { ...existingItem, quantity: nextQuantity };
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
          nextItem = nextQuantity > 0 ? { ...item, quantity: nextQuantity } : null;
          return nextQuantity > 0
            ? { items: [...state.items, { ...item, quantity: nextQuantity }] }
            : { items: state.items };
        });
        if (nextItem && added) syncLine(nextItem);
        return added;
      },
      removeItem: (id) => {
        let removedItem: CartItem | null = null;
        set((state) => {
          removedItem = state.items.find((item) => itemKey(item) === String(id)) || null;
          return {
            items: state.items.filter((item) => itemKey(item) !== String(id)),
          };
        });
        if (removedItem) syncRemove(removedItem);
      },
      updateQuantity: (id, quantity) => {
        let changedItem: CartItem | null = null;
        let removedItem: CartItem | null = null;
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (itemKey(item) !== String(id)) return [item];

            const nextQuantity = clampQuantity(item, quantity);
            if (nextQuantity > 0) {
              changedItem = { ...item, quantity: nextQuantity };
            } else {
              removedItem = item;
            }
            return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
          }),
        }));
        if (changedItem) syncLine(changedItem);
        if (removedItem) syncRemove(removedItem);
      },
      clearCart: () => {
        set({ items: [] });
        if (hasServerSession()) {
          void clearServerCart().catch(() => undefined);
        }
      },
      replaceCart: (items) => set({ items }),
    }),
    {
      name: 'godaz-cart-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
    }
  )
);

export default useCartStore;
