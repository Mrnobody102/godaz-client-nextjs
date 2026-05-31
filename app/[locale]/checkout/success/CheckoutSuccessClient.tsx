'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import useCartStore from '@/stores/cartStore';
import { Link } from '@/i18n/routing';
import { createPayment, fetchOrder, getApiErrorMessage } from '@/lib/api';
import { Order } from '@/stores/orderStore';

function SuccessContent() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'UNKNOWN';
  const paymentStatus = searchParams.get('paymentStatus');
  const gateway = searchParams.get('gateway');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const [error, setError] = useState('');
  const { addItem } = useCartStore();

  useEffect(() => {
    let active = true;
    if (!orderId || orderId === 'UNKNOWN') return;

    setIsLoadingOrder(true);
    fetchOrder(orderId)
      .then((nextOrder) => {
        if (active) setOrder(nextOrder);
      })
      .catch(() => {
        if (active) setOrder(null);
      })
      .finally(() => {
        if (active) setIsLoadingOrder(false);
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  const state = useMemo(() => {
    if (paymentStatus === 'failed' || paymentStatus === 'cancelled' || paymentStatus === 'expired') {
      return 'failed';
    }
    if (order?.status === 'cancelled' || order?.status === 'refunded') {
      return 'failed';
    }
    if (
      paymentStatus === 'pending' ||
      paymentStatus === 'initiated' ||
      paymentStatus === 'authorized' ||
      order?.status === 'pending_payment'
    ) {
      return 'pending';
    }
    return 'success';
  }, [order?.status, paymentStatus]);

  const canRetryPayment =
    order?.status === 'pending_payment' && (gateway === 'vnpay' || gateway === 'momo');
  const expiresAtLabel = order?.reservationExpiresAt
    ? new Date(order.reservationExpiresAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')
    : null;

  const retryPayment = async () => {
    if (!canRetryPayment || !order) return;
    setError('');
    setIsRetrying(true);
    try {
      const payment = await createPayment(order.id, gateway as 'vnpay' | 'momo');
      window.location.href = payment.paymentUrl;
    } catch (retryError) {
      setError(getApiErrorMessage(retryError));
      setIsRetrying(false);
    }
  };

  const restoreCart = () => {
    if (!order) return;
    order.items.forEach((item) => addItem(item, item.quantity));
    setIsRestored(true);
  };

  const isFailedPayment = state === 'failed';
  const isPendingPayment = state === 'pending';

  return (
    <div className="max-w-2xl mx-auto text-center py-20 px-4">
      <div
        className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 ${
          isFailedPayment ? 'bg-red-100' : isPendingPayment ? 'bg-amber-100' : 'bg-green-100'
        }`}
      >
        {isFailedPayment ? (
          <AlertCircle className="w-12 h-12 text-red-600" />
        ) : isPendingPayment ? (
          <Clock className="w-12 h-12 text-amber-700" />
        ) : (
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        )}
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
        {isFailedPayment
          ? t('paymentFailedTitle')
          : isPendingPayment
            ? locale === 'vi'
              ? 'Đang chờ thanh toán'
              : 'Payment pending'
            : t('successTitle')}
      </h1>
      <p className="text-xl text-gray-600 mb-12">
        {isFailedPayment
          ? t('paymentFailedDesc', { orderId })
          : isPendingPayment
            ? locale === 'vi'
              ? `Đơn hàng #${orderId} đang chờ cổng thanh toán xác nhận.`
              : `Order #${orderId} is waiting for payment confirmation.`
            : t('successDesc', { orderId })}
      </p>
      {isLoadingOrder && (
        <p className="mb-6 text-sm text-gray-500">{t('loading')}</p>
      )}
      {expiresAtLabel && isPendingPayment && (
        <p className="mb-6 text-sm text-gray-500">
          {locale === 'vi'
            ? `Giữ hàng đến ${expiresAtLabel}.`
            : `Inventory reserved until ${expiresAtLabel}.`}
        </p>
      )}
      {error && (
        <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        {isFailedPayment && order && (
          <button
            type="button"
            disabled={isRestored}
            onClick={restoreCart}
            className="inline-flex items-center justify-center rounded-xl border border-amber-900 bg-white px-8 py-4 text-lg font-bold text-amber-900 transition-all duration-300 hover:bg-amber-50 disabled:opacity-60"
          >
            {isRestored
              ? locale === 'vi'
                ? 'Đã khôi phục'
                : 'Restored'
              : locale === 'vi'
                ? 'Khôi phục giỏ hàng'
                : 'Restore cart'}
          </button>
        )}
        {canRetryPayment && (
          <button
            type="button"
            disabled={isRetrying}
            onClick={retryPayment}
            className="inline-flex items-center justify-center bg-amber-900 hover:bg-amber-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 text-lg disabled:opacity-60"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            {isRetrying
              ? locale === 'vi'
                ? 'Đang mở lại...'
                : 'Retrying...'
              : locale === 'vi'
                ? 'Thanh toán lại'
                : 'Retry payment'}
          </button>
        )}
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-amber-900 hover:bg-amber-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 text-lg"
        >
          {t('continueShopping')}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessClient() {
  const t = useTranslations('checkout');
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
        <Suspense fallback={<div className="py-20 text-center">{t('loading')}</div>}>
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
