'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import { Product } from '@/lib/constants/products';
import { Link } from '@/i18n/routing';
import useCartStore from '@/stores/cartStore';

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const t = useTranslations('productDetail');
  const locale = useLocale();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { items: cartItems, addItem, updateQuantity, removeItem } = useCartStore();

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity === 0) {
      removeItem(String(id));
    } else {
      updateQuantity(String(id), quantity);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const priceNum = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(priceNum);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-amber-900 hover:text-amber-700 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('backToHome')}
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
          <div className="relative h-96 md:h-auto md:w-1/2 bg-gray-100">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
          
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
            <div className="mb-4">
              <span className="inline-block bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>
            
            <div className="text-3xl font-bold text-amber-900 mb-8">
              {t('price_per', { price: formatted, unit: product.unit })}
            </div>
            
            <div className="mb-10">
              <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wider text-sm">{t('description')}</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                {product.description}
              </p>
            </div>
            
            <button
              onClick={() => addItem(product)}
              className="w-full bg-amber-900 hover:bg-amber-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
            >
              <ShoppingBag className="w-6 h-6" />
              {t('addToCart')}
            </button>
          </div>
        </div>
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
