'use client';

import { useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import useCartStore from '@/stores/cartStore';
import { Link } from '@/i18n/routing';

function SuccessContent() {
  const t = useTranslations('checkout');
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'UNKNOWN';

  return (
    <div className="max-w-2xl mx-auto text-center py-20 px-4">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-8">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t('successTitle')}</h1>
      <p className="text-xl text-gray-600 mb-12">
        {t('successDesc', { orderId })}
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center bg-amber-900 hover:bg-amber-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 text-lg"
      >
        {t('continueShopping')}
        <ArrowRight className="w-5 h-5 ml-2" />
      </Link>
    </div>
  );
}

export default function CheckoutSuccessClient() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { items: cartItems, updateQuantity, removeItem } = useCartStore();

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, quantity);
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

      <main className="flex-1 w-full">
        <Suspense fallback={<div className="py-20 text-center">Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </main>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={(id) => removeItem(id)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
