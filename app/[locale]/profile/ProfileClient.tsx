'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import useCartStore from '@/stores/cartStore';
import useOrderStore from '@/stores/orderStore';
import { PackageOpen, ArrowLeft, Package, Clock, CheckCircle } from 'lucide-react';

export default function ProfileClient() {
  const tHome = useTranslations('productDetail');
  const locale = useLocale();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { items: cartItems, updateQuantity, removeItem } = useCartStore();
  const { orders } = useOrderStore();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'shipped': return <Package className="w-5 h-5 text-blue-500" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return locale === 'vi' ? 'Đang xử lý' : 'Pending';
      case 'shipped': return locale === 'vi' ? 'Đang giao' : 'Shipped';
      case 'delivered': return locale === 'vi' ? 'Đã giao' : 'Delivered';
      default: return status;
    }
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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'vi' ? 'Đơn Hàng Của Tôi' : 'My Orders'}
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <PackageOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">
              {locale === 'vi' ? 'Bạn chưa có đơn hàng nào.' : 'You have no orders yet.'}
            </p>
            <Link
              href="/#products"
              className="inline-block mt-6 bg-amber-900 text-white px-8 py-3 rounded-lg hover:bg-amber-800 transition"
            >
              {locale === 'vi' ? 'Tiếp tục mua sắm' : 'Continue Shopping'}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {locale === 'vi' ? 'Đơn hàng' : 'Order'} #{order.id}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(order.date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <span className="text-xl font-bold text-amber-900">
                      {new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(order.total)}₫
                    </span>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-medium capitalize text-gray-700">
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                          <p className="text-gray-500 text-sm">
                            {locale === 'vi' ? 'Số lượng:' : 'Qty:'} {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">
                        {new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity)}₫
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100 bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">{locale === 'vi' ? 'Giao đến:' : 'Deliver to:'}</span>
                    <p className="font-medium text-gray-900">{order.customer.name} - {order.customer.phone}</p>
                    <p className="text-gray-700">{order.customer.address}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">{locale === 'vi' ? 'Thanh toán:' : 'Payment:'}</span>
                    <p className="font-medium text-gray-900 uppercase">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, q) => q === 0 ? removeItem(String(id)) : updateQuantity(String(id), q)}
        onRemoveItem={(id) => removeItem(String(id))}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
