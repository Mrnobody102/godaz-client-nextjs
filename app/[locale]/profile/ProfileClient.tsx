'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import useCartStore from '@/stores/cartStore';
import useOrderStore, { Order } from '@/stores/orderStore';
import { fetchMyOrders } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  PackageCheck,
  PackageOpen,
  XCircle,
} from 'lucide-react';

export default function ProfileClient() {
  const tHome = useTranslations('productDetail');
  const locale = useLocale();
  const { user } = useAuth();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [displayedOrders, setDisplayedOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [ordersPage, setOrdersPage] = useState(0);
  const [ordersTotalPages, setOrdersTotalPages] = useState(0);

  const { items: cartItems, updateQuantity, removeItem } = useCartStore();
  const { orders } = useOrderStore();

  useEffect(() => {
    let ignore = false;

    async function loadOrders() {
      setIsLoadingOrders(true);
      if (!user) {
        setDisplayedOrders(orders);
        setIsLoadingOrders(false);
        return;
      }

      try {
        const remoteOrders = await fetchMyOrders(ordersPage, 10);
        if (!ignore) {
          setDisplayedOrders(remoteOrders.orders);
          setOrdersTotalPages(remoteOrders.totalPages);
        }
      } catch {
        if (!ignore) {
          setDisplayedOrders(orders);
        }
      } finally {
        if (!ignore) {
          setIsLoadingOrders(false);
        }
      }
    }

    loadOrders();

    return () => {
      ignore = true;
    };
  }, [orders, ordersPage, user]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'confirmed':
        return <PackageCheck className="w-5 h-5 text-indigo-500" />;
      case 'shipped':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    const vi: Record<string, string> = {
      pending: 'Đang xử lý',
      confirmed: 'Đã xác nhận',
      shipped: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy',
    };
    const en: Record<string, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return locale === 'vi' ? vi[status] || status : en[status] || status;
  };

  const statusOptions = [
    { value: 'all' as const, label: locale === 'vi' ? 'Tất cả' : 'All' },
    { value: 'pending' as const, label: getStatusText('pending') },
    { value: 'confirmed' as const, label: getStatusText('confirmed') },
    { value: 'shipped' as const, label: getStatusText('shipped') },
    { value: 'delivered' as const, label: getStatusText('delivered') },
    { value: 'cancelled' as const, label: getStatusText('cancelled') },
  ];
  const filteredOrders = useMemo(
    () =>
      statusFilter === 'all'
        ? displayedOrders
        : displayedOrders.filter((order) => order.status === statusFilter),
    [displayedOrders, statusFilter]
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-amber-900 hover:text-amber-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {tHome('backToHome')}
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'vi' ? 'Đơn hàng của tôi' : 'My Orders'}
            </h1>
            {user && (
              <p className="text-gray-500 mt-1">
                {user.name} · {user.email}
              </p>
            )}
          </div>
          {!user && (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-amber-900 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition"
            >
              {locale === 'vi' ? 'Đăng nhập' : 'Sign in'}
            </button>
          )}
        </div>

        {displayedOrders.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === option.value
                    ? 'bg-amber-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {isLoadingOrders ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
                <div className="h-20 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : displayedOrders.length === 0 ? (
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
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <PackageOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">
              {locale === 'vi'
                ? 'Không có đơn hàng nào ở trạng thái này.'
                : 'No orders match this status.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-4 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {locale === 'vi' ? 'Đơn hàng' : 'Order'} #{order.id}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(order.date).toLocaleDateString(
                        locale === 'vi' ? 'vi-VN' : 'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
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
                    <div key={item.id} className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-gray-500 text-sm">
                            {locale === 'vi' ? 'Số lượng:' : 'Qty:'} {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900 flex-shrink-0">
                        {new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
                          (typeof item.price === 'string' ? parseFloat(item.price) : item.price) *
                            item.quantity
                        )}
                        ₫
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">
                      {locale === 'vi' ? 'Giao đến:' : 'Deliver to:'}
                    </span>
                    <p className="font-medium text-gray-900">
                      {order.customer.name} - {order.customer.phone}
                    </p>
                    <p className="text-gray-700">{order.customer.address}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">
                      {locale === 'vi' ? 'Thanh toán:' : 'Payment:'}
                    </span>
                    <p className="font-medium text-gray-900 uppercase">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>
            ))}
            {user && ordersTotalPages > 1 && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={ordersPage <= 0 || isLoadingOrders}
                  onClick={() => setOrdersPage((current) => Math.max(0, current - 1))}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {locale === 'vi' ? 'Truoc' : 'Previous'}
                </button>
                <span className="text-sm text-gray-500">
                  {ordersPage + 1} / {ordersTotalPages}
                </span>
                <button
                  type="button"
                  disabled={ordersPage + 1 >= ordersTotalPages || isLoadingOrders}
                  onClick={() =>
                    setOrdersPage((current) => Math.min(ordersTotalPages - 1, current + 1))
                  }
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {locale === 'vi' ? 'Sau' : 'Next'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, quantity) =>
          quantity === 0 ? removeItem(id) : updateQuantity(id, quantity)
        }
        onRemoveItem={(id) => removeItem(id)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
