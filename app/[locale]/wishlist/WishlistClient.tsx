'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import { ProductCard } from '@/components/ProductCard';
import useCartStore from '@/stores/cartStore';
import useWishlistStore from '@/stores/wishlistStore';
import { HeartCrack } from 'lucide-react';

export default function WishlistClient() {
  const t = useTranslations('wishlist');
  const tCart = useTranslations('cart');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { items: cartItems, addItem: addCartItem, updateQuantity, removeItem } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity === 0) {
      removeItem(String(id));
    } else {
      updateQuantity(String(id), quantity);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">
          {t('title')}
        </h1>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <HeartCrack className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">{t('empty')}</p>
            <Link
              href="/#products"
              className="inline-block mt-6 bg-amber-900 text-white px-8 py-3 rounded-lg hover:bg-amber-800 transition"
            >
              {tCart('continueShopping')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistItems.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(p) => addCartItem(p)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={(id) => removeItem(String(id))}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
