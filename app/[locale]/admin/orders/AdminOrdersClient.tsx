'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  ArrowLeft,
  Check,
  Clock,
  Package,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Truck,
  X,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import { Link } from '@/i18n/routing';
import { fetchAdminOrders, getApiErrorMessage, transitionAdminOrder } from '@/lib/api';
import useCartStore from '@/stores/cartStore';
import { Order, OrderStatus, normalizeOrderStatus } from '@/stores/orderStore';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_OPTIONS: Array<OrderStatus | 'all'> = [
  'all',
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const NEXT_ACTIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  pending_payment: ['processing', 'cancelled'],
  paid: ['processing', 'cancelled', 'refunded'],
  processing: ['shipped', 'cancelled', 'refunded'],
  shipped: ['delivered', 'refunded'],
  delivered: ['refunded'],
};

function initialSearchParam(key: string) {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(key) || '';
}

function statusLabel(status: OrderStatus | 'all', locale: string) {
  const vi: Record<OrderStatus | 'all', string> = {
    all: 'Tất cả',
    draft: 'Nháp',
    pending_payment: 'Chờ thanh toán',
    paid: 'Đã thanh toán',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
  };
  const en: Record<OrderStatus | 'all', string> = {
    all: 'All',
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
    case 'pending_payment':
      return <Clock className="h-4 w-4" />;
    case 'paid':
      return <Check className="h-4 w-4" />;
    case 'processing':
      return <Package className="h-4 w-4" />;
    case 'shipped':
      return <Truck className="h-4 w-4" />;
    case 'delivered':
      return <Check className="h-4 w-4" />;
    case 'cancelled':
      return <X className="h-4 w-4" />;
    case 'refunded':
      return <RotateCcw className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

export default function AdminOrdersClient() {
  const locale = useLocale();
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>(() => {
    const status = initialSearchParam('status');
    return STATUS_OPTIONS.includes(status as OrderStatus | 'all')
      ? (status as OrderStatus | 'all')
      : 'all';
  });
  const [paymentFilter, setPaymentFilter] = useState(() => initialSearchParam('paymentMethod'));
  const [createdFrom, setCreatedFrom] = useState(() => initialSearchParam('createdFrom'));
  const [createdTo, setCreatedTo] = useState(() => initialSearchParam('createdTo'));
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const { items: cartItems, updateQuantity, removeItem } = useCartStore();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = user?.role === 'ADMIN';

  const loadOrders = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchAdminOrders({
        status: statusFilter,
        paymentMethod: paymentFilter,
        createdFrom,
        createdTo,
        page,
        size: 20,
      });
      setOrders(response.orders);
      setTotalPages(response.totalPages);
      setSelectedOrder((current) => {
        if (!current) return response.orders[0] ?? null;
        return response.orders.find((order) => order.id === current.id) ?? response.orders[0] ?? null;
      });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, page, statusFilter, paymentFilter, createdFrom, createdTo]);

  const selectedStatus = selectedOrder
    ? normalizeOrderStatus(selectedOrder.status)
    : null;
  const availableActions = useMemo(
    () => (selectedStatus ? NEXT_ACTIONS[selectedStatus] || [] : []),
    [selectedStatus]
  );

  const transitionOrder = async (status: OrderStatus) => {
    if (!selectedOrder) return;

    let reason = `admin_${status}`;
    // Refund and cancel are destructive (restock + money settlement), so confirm and capture a reason.
    if (status === 'refunded' || status === 'cancelled') {
      const promptLabel =
        status === 'refunded'
          ? locale === 'vi'
            ? 'Lý do hoàn tiền (đơn sẽ được hoàn kho):'
            : 'Refund reason (inventory will be restocked):'
          : locale === 'vi'
            ? 'Lý do hủy đơn:'
            : 'Cancellation reason:';
      const input = window.prompt(promptLabel, '');
      if (input === null) return;
      reason = input.trim() || `admin_${status}`;
    }

    setIsMutating(true);
    setError('');
    try {
      const updated = await transitionAdminOrder(selectedOrder.id, status, reason);
      setSelectedOrder(updated);
      setOrders((current) =>
        current.map((order) => (order.id === updated.id ? updated : order))
      );
    } catch (transitionError) {
      setError(getApiErrorMessage(transitionError));
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, quantity);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-amber-900 hover:text-amber-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {locale === 'vi' ? 'Quay lại cửa hàng' : 'Back to shop'}
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'vi' ? 'Vận hành đơn hàng' : 'Order Operations'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {locale === 'vi' ? 'Admin' : 'Admin'} · {user?.email || '-'}
            </p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            disabled={!isAdmin || isLoading}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {locale === 'vi' ? 'Làm mới' : 'Refresh'}
          </button>
        </div>

        {!user ? (
          <div className="bg-white border border-gray-100 rounded-lg p-8 text-center">
            <ShieldAlert className="w-12 h-12 mx-auto text-amber-700 mb-4" />
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-amber-900 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition"
            >
              {locale === 'vi' ? 'Đăng nhập' : 'Sign in'}
            </button>
          </div>
        ) : !isAdmin ? (
          <div className="bg-white border border-gray-100 rounded-lg p-8 text-center">
            <ShieldAlert className="w-12 h-12 mx-auto text-red-600 mb-4" />
            <p className="text-gray-700">
              {locale === 'vi' ? 'Bạn không có quyền truy cập.' : 'You do not have access.'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(0);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    statusFilter === status
                      ? 'bg-amber-900 text-white'
                      : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
                  }`}
                >
                  {statusLabel(status, locale)}
                </button>
              ))}
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-100 bg-white p-4 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  {locale === 'vi' ? 'Thanh toán' : 'Payment'}
                </label>
                <select
                  value={paymentFilter}
                  onChange={(event) => {
                    setPaymentFilter(event.target.value);
                    setPage(0);
                  }}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
                >
                  <option value="">{locale === 'vi' ? 'Tất cả' : 'All'}</option>
                  <option value="cod">COD</option>
                  <option value="vnpay">VNPAY</option>
                  <option value="momo">MoMo</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  {locale === 'vi' ? 'Từ ngày' : 'From'}
                </label>
                <input
                  type="date"
                  value={createdFrom}
                  onChange={(event) => {
                    setCreatedFrom(event.target.value);
                    setPage(0);
                  }}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-700"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  {locale === 'vi' ? 'Đến ngày' : 'To'}
                </label>
                <input
                  type="date"
                  value={createdTo}
                  onChange={(event) => {
                    setCreatedTo(event.target.value);
                    setPage(0);
                  }}
                  className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-700"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentFilter('');
                    setCreatedFrom('');
                    setCreatedTo('');
                    setStatusFilter('all');
                    setPage(0);
                  }}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {locale === 'vi' ? 'Xóa lọc' : 'Reset'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">
              <section className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-3">{locale === 'vi' ? 'Đơn' : 'Order'}</th>
                        <th className="px-4 py-3">{locale === 'vi' ? 'Khách' : 'Customer'}</th>
                        <th className="px-4 py-3">{locale === 'vi' ? 'Trạng thái' : 'Status'}</th>
                        <th className="px-4 py-3 text-right">{locale === 'vi' ? 'Tổng' : 'Total'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                            {locale === 'vi' ? 'Đang tải...' : 'Loading...'}
                          </td>
                        </tr>
                      ) : orders.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                            {locale === 'vi' ? 'Không có đơn hàng.' : 'No orders.'}
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => {
                          const status = normalizeOrderStatus(order.status);
                          return (
                            <tr
                              key={order.id}
                              onClick={() => setSelectedOrder(order)}
                              className={`cursor-pointer hover:bg-amber-50 ${
                                selectedOrder?.id === order.id ? 'bg-amber-50' : ''
                              }`}
                            >
                              <td className="px-4 py-4">
                                <p className="font-semibold text-gray-900">#{order.id.slice(0, 8)}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(order.date).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-medium text-gray-900">{order.customer.name}</p>
                                <p className="text-xs text-gray-500">{order.customer.phone}</p>
                              </td>
                              <td className="px-4 py-4">
                                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                  {statusIcon(status)}
                                  {statusLabel(status, locale)}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right font-semibold text-gray-900">
                                {new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(order.total)}₫
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-4 py-3">
                    <button
                      type="button"
                      disabled={page <= 0 || isLoading}
                      onClick={() => setPage((current) => Math.max(0, current - 1))}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {locale === 'vi' ? 'Trước' : 'Previous'}
                    </button>
                    <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
                    <button
                      type="button"
                      disabled={page + 1 >= totalPages || isLoading}
                      onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {locale === 'vi' ? 'Sau' : 'Next'}
                    </button>
                  </div>
                )}
              </section>

              <aside className="bg-white border border-gray-100 rounded-lg p-5">
                {selectedOrder ? (
                  <div className="space-y-5">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {locale === 'vi' ? 'Đơn hàng' : 'Order'}
                      </p>
                      <h2 className="text-xl font-bold text-gray-900">#{selectedOrder.id}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableActions.map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={isMutating}
                          onClick={() => transitionOrder(status)}
                          className="inline-flex items-center rounded-lg bg-amber-900 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
                        >
                          {statusIcon(status)}
                          <span className="ml-2">{statusLabel(status, locale)}</span>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-4 space-y-1 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">{locale === 'vi' ? 'Thanh toán' : 'Payment'}</span>
                        <span className="font-medium text-gray-900">
                          {selectedOrder.paymentMethod?.toUpperCase()}
                          {selectedOrder.paymentStatus ? ` · ${selectedOrder.paymentStatus}` : ''}
                        </span>
                      </div>
                      {selectedOrder.refundedAt && (
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">{locale === 'vi' ? 'Đã hoàn tiền' : 'Refunded'}</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.refundAmount != null
                              ? `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(selectedOrder.refundAmount)}₫ · `
                              : ''}
                            {new Date(selectedOrder.refundedAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {locale === 'vi' ? 'Sản phẩm' : 'Items'}
                      </h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex justify-between gap-3 text-sm">
                            <span className="text-gray-700">{item.name} × {item.quantity}</span>
                            <span className="font-medium text-gray-900">
                              {new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Number(item.price) * item.quantity)}₫
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {locale === 'vi' ? 'Timeline' : 'Timeline'}
                      </h3>
                      <div className="space-y-3">
                        {(selectedOrder.events || []).map((event) => (
                          <div key={`${event.createdAt}-${event.toStatus}`} className="border-l-2 border-amber-200 pl-3">
                            <p className="text-sm font-medium text-gray-900">
                              {event.fromStatus ? `${statusLabel(event.fromStatus, locale)} → ` : ''}
                              {statusLabel(event.toStatus, locale)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(event.createdAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                              {event.actorType ? ` · ${event.actorType}` : ''}
                            </p>
                            {event.reason && <p className="text-xs text-gray-600 mt-1">{event.reason}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {locale === 'vi' ? 'Chọn một đơn hàng.' : 'Select an order.'}
                  </p>
                )}
              </aside>
            </div>
          </>
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
