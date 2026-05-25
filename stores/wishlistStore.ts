import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/lib/constants/products';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: string | number) => void;
  isInWishlist: (id: string | number) => boolean;
  clearWishlist: () => void;
}

const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const { items } = get();
        const exists = items.some((item) => item.id === product.id);
        if (!exists) {
          set({ items: [...items, product] });
        }
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      isInWishlist: (id) => {
        const { items } = get();
        return items.some((item) => item.id === id);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'godaz-wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useWishlistStore;
