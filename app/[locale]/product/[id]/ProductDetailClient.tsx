'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, Heart, Minus, Plus, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import { Product, handicraftProducts } from '@/lib/constants/products';
import { ProductCard } from '@/components/ProductCard';
import { Link } from '@/i18n/routing';
import useCartStore from '@/stores/cartStore';
import useWishlistStore from '@/stores/wishlistStore';
import { toast } from 'sonner';

interface Props {
  product: Product;
}

export default function ProductDetailClient({ product }: Props) {
  const t = useTranslations('productDetail');
  const tWishlist = useTranslations('wishlist');
  const locale = useLocale();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { items: cartItems, addItem: addCartItem, updateQuantity, removeItem } = useCartStore();
  const { isInWishlist, addItem: addWishlistItem, removeItem: removeWishlistItem } = useWishlistStore();

  const isWished = isInWishlist(product.id);

  const handleWishlistClick = () => {
    if (isWished) {
      removeWishlistItem(product.id);
      toast(tWishlist('remove'));
    } else {
      addWishlistItem(product);
      toast.success(tWishlist('add'));
    }
  };

  const handleAddToCart = () => {
    addCartItem(product, quantity);
    setIsCartOpen(true);
    toast.success(product.name + ' ✓');
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleIncreaseQuantity = () => {
    setQuantity(q => q + 1);
  };

  const relatedProducts = handicraftProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

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
              className="object-cover transition-transform duration-500 hover:scale-105"
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
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center justify-between border-2 border-gray-200 rounded-2xl p-2 w-full sm:w-32 bg-white">
                <button
                  onClick={handleDecreaseQuantity}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-amber-900 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="font-bold text-gray-900 text-lg w-8 text-center">{quantity}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-amber-900 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-amber-900 hover:bg-amber-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
              >
                <ShoppingBag className="w-6 h-6" />
                {t('addToCart')}
              </button>
              
              <button
                onClick={handleWishlistClick}
                className={`w-16 h-16 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex-shrink-0 ${
                  isWished 
                    ? 'border-red-500 bg-red-50 text-red-500' 
                    : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-red-400'
                }`}
              >
                <Heart className={`w-8 h-8 transition-colors ${isWished ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-gray-100">
              <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl">
                <Truck className="w-8 h-8 text-amber-900 mb-2" />
                <span className="text-sm font-medium text-gray-900">{locale === 'vi' ? 'Giao hàng tận nơi' : 'Fast Delivery'}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl">
                <Sparkles className="w-8 h-8 text-amber-900 mb-2" />
                <span className="text-sm font-medium text-gray-900">{locale === 'vi' ? 'Thủ công 100%' : '100% Handmade'}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl">
                <ShieldCheck className="w-8 h-8 text-amber-900 mb-2" />
                <span className="text-sm font-medium text-gray-900">{locale === 'vi' ? 'Kiểm tra hàng trước' : 'Secure Check'}</span>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              {t('related')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={(prod) => {
                    addCartItem(prod);
                    toast.success(prod.name + ' ✓');
                  }}
                />
              ))}
            </div>
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
