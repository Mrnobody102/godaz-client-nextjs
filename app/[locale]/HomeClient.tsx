'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';
import { Product, handicraftProducts } from '@/lib/constants/products';
import { Cart } from '@/components/Cart';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import useCartStore from '@/stores/cartStore';



export default function HomeClient() {
  const t = useTranslations('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Use Zustand store instead of local state
  const {
    items: cartItems,
    addItem,
    updateQuantity,
    removeItem,
  } = useCartStore();

  const addToCart = (product: Product) => {
    addItem(product);
  };

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity === 0) {
      removeItem(String(id));
    } else {
      updateQuantity(String(id), quantity);
    }
  };

  const handleRemoveItem = (id: string | number) => {
    removeItem(String(id));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />
      <Hero />

      <section id="products" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('products.title')}
            </h2>
            <p className="text-lg text-gray-600">{t('products.description')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {handicraftProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-amber-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('features.f1_title')}
              </h3>
              <p className="text-amber-100">{t('features.f1_desc')}</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('features.f2_title')}
              </h3>
              <p className="text-amber-100">{t('features.f2_desc')}</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">♻️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('features.f3_title')}
              </h3>
              <p className="text-amber-100">{t('features.f3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('about.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-4 leading-relaxed">
            {t('about.p1')}
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            {t('about.p2')}
          </p>
        </div>
      </section>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
