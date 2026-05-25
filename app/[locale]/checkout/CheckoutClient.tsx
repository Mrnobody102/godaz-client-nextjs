'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import useCartStore from '@/stores/cartStore';
import { Link } from '@/i18n/routing';
import useOrderStore from '@/stores/orderStore';

export default function CheckoutClient() {
  const t = useTranslations('checkout');
  const tHome = useTranslations('productDetail');
  const locale = useLocale();
  const router = useRouter();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { items: cartItems, clearCart, updateQuantity, removeItem } = useCartStore();

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity === 0) {
      removeItem(String(id));
    } else {
      updateQuantity(String(id), quantity);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + price * item.quantity;
  }, 0);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const { addOrder } = useOrderStore();
  
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    const orderId = Math.floor(Math.random() * 1000000).toString();
    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      items: [...cartItems],
      total: total,
      status: 'pending' as const,
      customer: formData,
      paymentMethod,
    };
    addOrder(newOrder);
    clearCart();
    router.push(`/checkout/success?orderId=${orderId}`);
  };

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
            {tHome('backToHome')}
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('shipping')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')}</label>
                    <textarea required rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900"></textarea>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('payment')}</h2>
                <div className="space-y-4">
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-amber-900 bg-amber-50' : 'border-gray-200'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="h-4 w-4 text-amber-900 focus:ring-amber-900" />
                    <span className="ml-3 font-medium text-gray-900">{t('cod')}</span>
                  </label>
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'banking' ? 'border-amber-900 bg-amber-50' : 'border-gray-200'}`}>
                    <input type="radio" name="payment" value="banking" checked={paymentMethod === 'banking'} onChange={() => setPaymentMethod('banking')} className="h-4 w-4 text-amber-900 focus:ring-amber-900" />
                    <span className="ml-3 font-medium text-gray-900">{t('banking')}</span>
                  </label>
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'momo' ? 'border-amber-900 bg-amber-50' : 'border-gray-200'}`}>
                    <input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} className="h-4 w-4 text-amber-900 focus:ring-amber-900" />
                    <span className="ml-3 font-medium text-gray-900">{t('momo')}</span>
                  </label>
                </div>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-gray-900">
                      {new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity)}₫
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-amber-900">
                    {new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(total)}₫
                  </span>
                </div>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={cartItems.length === 0}
                className="w-full bg-amber-900 hover:bg-amber-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('placeOrder')}
              </button>
            </div>
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
