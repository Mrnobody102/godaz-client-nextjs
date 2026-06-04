'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Package,
  ReceiptText,
  XCircle,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import { Link } from '@/i18n/routing';
import { fetchOrder, getApiErrorMessage } from '@/lib/api';
import useCartStore from '@/stores/cartStore';
import { Order, OrderStatus, normalizeOrderStatus } from '@/stores/orderStore';

function statusLabel(status: OrderStatus, locale: string) {
  const vi: Record<OrderStatus, string> = {
    draft: 'Ban nhap',
    pending_payment: 'Cho thanh toan',
    paid: 'Da thanh toan',
    processing: 'Dang xu ly',
    shipped: 'Dang giao',
    delivered: 'Da giao',
    cancelled: 'Da huy',
    refunded: 'Da hoan tien',
  };
  const en: Record<OrderStatus, string> = {
    draft: 'Draft',
    pending_payment: 'Pending payment',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };
  return locale === 'vi' ? vi[status] : en[status];
}

function statusIcon(status: OrderStatus) {
  switch (status) {
    case 'cancelled':
    case 'refunded':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'pending_payment':
      return <Clock className="w-5 h-5 text-amber-600" />;
    case 'delivered':
    case 'paid':
      return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    default:
      return <Package className="w-5 h-5 text-blue-600" />;
  }
}

export default function CustomerOrderDetailClient() {
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const orderId = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { items: cartItems, updateQuantity, removeItem } = useCartStore();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    [locale]
  );

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    fetchOrder(orderId)
      .then((nextOrder) => {
        if (active) setOrder(nextOrder);
      })
      .catch((loadError) => {
        if (active) setError(getApiErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, quantity);
    }
  };

  const status = normalizeOrderStatus(order?.status || 'processing');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Link
          href="/profile"
          className="mb-8 inline-flex items-center text-amber-900 hover:text-amber-700 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {locale === 'vi' ? 'Quay lai don hang' : 'Back to orders'}
        </Link>

        {isLoading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">
            {locale === 'vi' ? 'Dang tai don hang...' : 'Loading order...'}
          </div>
        ) : error || !order ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-red-700">
            {error || (locale === 'vi' ? 'Khong tim thay don hang.' : 'Order not found.')}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(order.date).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-gray-900">
                      {locale === 'vi' ? 'Don hang' : 'Order'} #{order.id}
                    </h1>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                    {statusIcon(status)}
                    {statusLabel(status, locale)}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Package className="w-5 h-5 text-amber-900" />
                  {locale === 'vi' ? 'San pham' : 'Items'}
                </h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {locale === 'vi' ? 'So luong' : 'Qty'}: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {currency.format(Number(item.price) * item.quantity)}₫
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Clock className="w-5 h-5 text-amber-900" />
                  Timeline
                </h2>
                <div className="space-y-4">
                  {(order.events || []).length === 0 ? (
                    <p className="text-sm text-gray-500">
                      {locale === 'vi' ? 'Chua co timeline.' : 'No timeline yet.'}
                    </p>
                  ) : (
                    order.events?.map((event) => (
                      <div key={`${event.createdAt}-${event.toStatus}`} className="flex gap-3">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-900" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {statusLabel(normalizeOrderStatus(event.toStatus), locale)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.createdAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                            {event.reason ? ` - ${event.reason}` : ''}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <ReceiptText className="w-5 h-5 text-amber-900" />
                  {locale === 'vi' ? 'Tong tien' : 'Cost breakdown'}
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>{locale === 'vi' ? 'Tam tinh' : 'Subtotal'}</span>
                    <span>{currency.format(order.subtotal ?? order.total)}₫</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>{order.shippingMethod?.name || (locale === 'vi' ? 'Giao hang' : 'Shipping')}</span>
                    <span>{currency.format(order.shippingFee ?? 0)}₫</span>
                  </div>
                  {(order.discountAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>{order.couponCode || (locale === 'vi' ? 'Giam gia' : 'Discount')}</span>
                      <span>-{currency.format(order.discountAmount ?? 0)}₫</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-bold text-gray-900">
                    <span>{locale === 'vi' ? 'Tong cong' : 'Total'}</span>
                    <span className="text-amber-900">{currency.format(order.total)}₫</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <MapPin className="w-5 h-5 text-amber-900" />
                  {locale === 'vi' ? 'Giao den' : 'Deliver to'}
                </h2>
                <p className="font-medium text-gray-900">
                  {order.customer.name} - {order.customer.phone}
                </p>
                <p className="mt-1 text-sm text-gray-600">{order.customer.address}</p>
                {order.customer.note && (
                  <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{order.customer.note}</p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <CreditCard className="w-5 h-5 text-amber-900" />
                  {locale === 'vi' ? 'Thanh toan' : 'Payment'}
                </h2>
                <p className="font-medium uppercase text-gray-900">{order.paymentMethod}</p>
                {order.paymentStatus && (
                  <p className="mt-1 text-sm text-gray-500">{order.paymentStatus}</p>
                )}
                {order.reservationExpiresAt && (
                  <p className="mt-3 text-sm text-amber-800">
                    {locale === 'vi' ? 'Giu hang den' : 'Reserved until'}{' '}
                    {new Date(order.reservationExpiresAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                  </p>
                )}
              </div>
            </aside>
          </div>
        )}
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
