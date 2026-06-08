'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocale } from 'next-intl';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Clock,
  PackageOpen,
  ReceiptText,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import { Link } from '@/i18n/routing';
import { AdminDashboard, fetchAdminDashboard, getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import useCartStore from '@/stores/cartStore';

type RangePreset = '7d' | '30d' | 'month' | 'custom';

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function rangeForPreset(preset: RangePreset) {
  const today = new Date();
  const end = formatDateInput(today);
  if (preset === '7d') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { from: formatDateInput(start), to: end };
  }
  if (preset === 'month') {
    return {
      from: formatDateInput(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))),
      to: end,
    };
  }
  const start = new Date(today);
  start.setDate(start.getDate() - 29);
  return { from: formatDateInput(start), to: end };
}

function labelize(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function maxMetric(data: AdminDashboard | null) {
  return Math.max(1, ...(data?.timeSeries || []).map((item) => item.netRevenue));
}

export default function AdminDashboardClient() {
  const locale = useLocale();
  const { user } = useAuth();
  const { items: cartItems, updateQuantity, removeItem } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [rangePreset, setRangePreset] = useState<RangePreset>('30d');
  const [range, setRange] = useState(() => rangeForPreset('30d'));
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isAdmin = user?.role === 'ADMIN';
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    [locale]
  );
  const peakNetRevenue = maxMetric(dashboard);

  const load = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError('');
    try {
      setDashboard(await fetchAdminDashboard(range));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, range]);

  useEffect(() => {
    load();
  }, [load]);

  const applyPreset = (preset: RangePreset) => {
    setRangePreset(preset);
    if (preset !== 'custom') {
      setRange(rangeForPreset(preset));
    }
  };

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, quantity);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} onAuthClick={() => setIsAuthModalOpen(true)} />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
          <div className="rounded-lg border border-amber-100 bg-white p-8 text-center shadow-sm">
            <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-amber-900" />
            <h1 className="text-2xl font-bold text-gray-900">Admin access required</h1>
            {!user && (
              <button type="button" onClick={() => setIsAuthModalOpen(true)} className="mt-5 rounded-lg bg-amber-900 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-800">
                Sign in
              </button>
            )}
          </div>
        </main>
        <Footer />
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={(id) => removeItem(id)} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  const kpis = dashboard?.kpis;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} onAuthClick={() => setIsAuthModalOpen(true)} />
      <main data-testid="admin-dashboard" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-amber-900 hover:text-amber-700 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Storefront
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Commerce overview - {user?.email || '-'}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
              {(['7d', '30d', 'month'] as RangePreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`h-9 rounded-md px-3 text-sm font-medium ${rangePreset === preset ? 'bg-amber-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {preset === '7d' ? '7D' : preset === '30d' ? '30D' : 'Month'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                aria-label="Dashboard from date"
                type="date"
                value={range.from}
                onChange={(event) => {
                  setRangePreset('custom');
                  setRange((current) => ({ ...current, from: event.target.value }));
                }}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
              />
              <input
                aria-label="Dashboard to date"
                type="date"
                value={range.to}
                onChange={(event) => {
                  setRangePreset('custom');
                  setRange((current) => ({ ...current, to: event.target.value }));
                }}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
              />
            </div>
            <button
              type="button"
              onClick={load}
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section data-testid="dashboard-kpis" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <KpiTile icon={<TrendingUp className="h-5 w-5" />} label="Gross revenue" value={`${currency.format(kpis?.grossRevenue || 0)}₫`} />
          <KpiTile icon={<Activity className="h-5 w-5" />} label="Net revenue" value={`${currency.format(kpis?.netRevenue || 0)}₫`} />
          <KpiTile icon={<ReceiptText className="h-5 w-5" />} label="Orders" value={String(kpis?.orderCount || 0)} />
          <KpiTile icon={<BarChart3 className="h-5 w-5" />} label="AOV" value={`${currency.format(kpis?.averageOrderValue || 0)}₫`} />
          <KpiTile icon={<Clock className="h-5 w-5" />} label="Pending pay" value={String(kpis?.pendingPaymentCount || 0)} />
          <KpiTile icon={<PackageOpen className="h-5 w-5" />} label="Refunds" value={String(kpis?.refundCount || 0)} />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Net revenue trend</h2>
              <span className="text-xs text-gray-500">{range.from} to {range.to}</span>
            </div>
            <div data-testid="dashboard-revenue-chart" className="flex h-56 items-end gap-1 border-b border-l border-gray-100 px-2 pt-4">
              {(dashboard?.timeSeries || []).map((item) => {
                const height = Math.max(4, Math.round((item.netRevenue / peakNetRevenue) * 100));
                return (
                  <div key={item.date} className="flex min-w-[8px] flex-1 flex-col items-center justify-end gap-2">
                    <div title={`${item.date}: ${currency.format(item.netRevenue)}₫`} className="w-full rounded-t bg-amber-800" style={{ height: `${height}%` }} />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment health</h2>
            <BreakdownList title="Payment status" rows={dashboard?.paymentStatusBreakdown || []} />
            <div className="mt-5">
              <BreakdownList title="Payment method" rows={dashboard?.paymentMethodBreakdown || []} />
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Order status</h2>
            <BreakdownList rows={dashboard?.orderStatusBreakdown || []} />
          </section>

          <section className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Ops queues</h2>
              <Link href={`/admin/orders?status=pending_payment&createdFrom=${range.from}&createdTo=${range.to}`} className="text-sm font-medium text-amber-900 hover:text-amber-700">
                View pending
              </Link>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <QueueTable
                title="Pending payment"
                empty="No pending payment orders."
                rows={(dashboard?.pendingPaymentOrders || []).map((order) => ({
                  key: order.id,
                  primary: order.customerName,
                  secondary: `${order.paymentMethod.toUpperCase()} - ${order.paymentStatus || 'no payment'}`,
                  value: `${currency.format(order.total)}₫`,
                  href: `/admin/orders?status=pending_payment&createdFrom=${range.from}&createdTo=${range.to}`,
                }))}
              />
              <QueueTable
                title="Low stock"
                empty="No low stock items."
                rows={(dashboard?.lowStockItems || []).map((item) => ({
                  key: `${item.type}-${item.productId}-${item.variantId || 'base'}`,
                  primary: item.name,
                  secondary: `${item.category}${item.sku ? ` - ${item.sku}` : ''}`,
                  value: String(item.stock),
                  href: '/admin/products?active=true',
                }))}
              />
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent orders</h2>
            <Link href={`/admin/orders?createdFrom=${range.from}&createdTo=${range.to}`} className="text-sm font-medium text-amber-900 hover:text-amber-700">
              View orders
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                  <th className="py-3 pr-3 font-semibold">Order</th>
                  <th className="py-3 pr-3 font-semibold">Customer</th>
                  <th className="py-3 pr-3 font-semibold">Status</th>
                  <th className="py-3 pr-3 font-semibold">Payment</th>
                  <th className="py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(dashboard?.recentOrders || []).map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 pr-3 font-medium text-gray-900">{order.id.slice(0, 8)}</td>
                    <td className="py-3 pr-3 text-gray-700">{order.customerName}</td>
                    <td className="py-3 pr-3 text-gray-700">{labelize(order.status)}</td>
                    <td className="py-3 pr-3 text-gray-700">{order.paymentMethod.toUpperCase()} / {order.paymentStatus || '-'}</td>
                    <td className="py-3 text-right font-semibold text-gray-900">{currency.format(order.total)}₫</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && (dashboard?.recentOrders || []).length === 0 && (
              <div className="py-8 text-center text-sm text-gray-500">No recent orders.</div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={(id) => removeItem(id)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

function KpiTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-900">
        {icon}
      </div>
      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
      <p className="mt-1 break-words text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function BreakdownList({ title, rows }: { title?: string; rows: Array<{ key: string; count: number }> }) {
  const total = Math.max(1, rows.reduce((sum, row) => sum + row.count, 0));
  return (
    <div>
      {title && <h3 className="mb-2 text-sm font-semibold text-gray-700">{title}</h3>}
      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">No data.</p>
        ) : (
          rows.map((row) => (
            <div key={row.key}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="text-gray-700">{labelize(row.key)}</span>
                <span className="font-semibold text-gray-900">{row.count}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-amber-800" style={{ width: `${Math.max(6, Math.round((row.count / total) * 100))}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function QueueTable({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: Array<{ key: string; primary: string; secondary: string; value: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
        <AlertTriangle className="h-4 w-4 text-amber-800" />
        {title}
      </h3>
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">{empty}</p>
        ) : (
          rows.map((row) => (
            <Link key={row.key} href={row.href} className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-gray-900">{row.primary}</span>
                <span className="block truncate text-xs text-gray-500">{row.secondary}</span>
              </span>
              <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">{row.value}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
