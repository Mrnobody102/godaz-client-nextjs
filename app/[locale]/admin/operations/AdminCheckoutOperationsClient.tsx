'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeft, RefreshCw, Save, ShieldAlert, Ticket, Truck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import { Link } from '@/i18n/routing';
import useCartStore from '@/stores/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import {
  Coupon,
  CouponPayload,
  ShippingMethod,
  ShippingMethodPayload,
  createAdminCoupon,
  createAdminShippingMethod,
  deleteAdminCoupon,
  deleteAdminShippingMethod,
  fetchAdminCoupons,
  fetchAdminShippingMethods,
  getApiErrorMessage,
  updateAdminCoupon,
  updateAdminShippingMethod,
} from '@/lib/api';

interface ShippingFormState {
  code: string;
  name: string;
  description: string;
  fee: string;
  freeThreshold: string;
  active: boolean;
  sortOrder: string;
}

interface CouponFormState {
  code: string;
  type: 'fixed' | 'percent';
  value: string;
  minSubtotal: string;
  maxDiscount: string;
  usageLimit: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
}

const emptyShippingForm: ShippingFormState = {
  code: '',
  name: '',
  description: '',
  fee: '0',
  freeThreshold: '',
  active: true,
  sortOrder: '0',
};

const emptyCouponForm: CouponFormState = {
  code: '',
  type: 'fixed',
  value: '',
  minSubtotal: '',
  maxDiscount: '',
  usageLimit: '',
  startsAt: '',
  endsAt: '',
  active: true,
};

function shippingPayload(form: ShippingFormState): ShippingMethodPayload {
  return {
    code: form.code.trim().toUpperCase(),
    name: form.name.trim(),
    description: form.description.trim(),
    fee: Number(form.fee || 0),
    freeThreshold: form.freeThreshold ? Number(form.freeThreshold) : null,
    active: form.active,
    sortOrder: Number(form.sortOrder || 0),
  };
}

function couponPayload(form: CouponFormState): CouponPayload {
  return {
    code: form.code.trim().toUpperCase(),
    type: form.type,
    value: Number(form.value || 0),
    minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : null,
    maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    startsAt: form.startsAt || null,
    endsAt: form.endsAt || null,
    active: form.active,
  };
}

function shippingToForm(method: ShippingMethod): ShippingFormState {
  return {
    code: method.code,
    name: method.name,
    description: method.description || '',
    fee: String(method.fee),
    freeThreshold: method.freeThreshold ? String(method.freeThreshold) : '',
    active: method.active,
    sortOrder: String(method.sortOrder ?? 0),
  };
}

function couponToForm(coupon: Coupon): CouponFormState {
  return {
    code: coupon.code,
    type: coupon.type === 'percent' ? 'percent' : 'fixed',
    value: String(coupon.value),
    minSubtotal: coupon.minSubtotal ? String(coupon.minSubtotal) : '',
    maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : '',
    usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
    startsAt: coupon.startsAt || '',
    endsAt: coupon.endsAt || '',
    active: coupon.active,
  };
}

export default function AdminCheckoutOperationsClient() {
  const locale = useLocale();
  const { user } = useAuth();
  const { items: cartItems, updateQuantity, removeItem } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [shippingForm, setShippingForm] = useState<ShippingFormState>(emptyShippingForm);
  const [couponForm, setCouponForm] = useState<CouponFormState>(emptyCouponForm);
  const [editingShipping, setEditingShipping] = useState<ShippingMethod | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const isAdmin = user?.role === 'ADMIN';
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    [locale]
  );

  const load = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError('');
    try {
      const [nextShipping, nextCoupons] = await Promise.all([
        fetchAdminShippingMethods(),
        fetchAdminCoupons(),
      ]);
      setShippingMethods(nextShipping);
      setCoupons(nextCoupons);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const resetShipping = () => {
    setEditingShipping(null);
    setShippingForm(emptyShippingForm);
  };

  const resetCoupon = () => {
    setEditingCoupon(null);
    setCouponForm(emptyCouponForm);
  };

  const saveShipping = async (event: FormEvent) => {
    event.preventDefault();
    setIsMutating(true);
    setError('');
    try {
      const payload = shippingPayload(shippingForm);
      const saved = editingShipping
        ? await updateAdminShippingMethod(editingShipping.id || '', payload)
        : await createAdminShippingMethod(payload);
      setShippingMethods((current) =>
        editingShipping
          ? current.map((method) => (method.id === saved.id ? saved : method))
          : [saved, ...current]
      );
      resetShipping();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsMutating(false);
    }
  };

  const saveCoupon = async (event: FormEvent) => {
    event.preventDefault();
    setIsMutating(true);
    setError('');
    try {
      const payload = couponPayload(couponForm);
      const saved = editingCoupon
        ? await updateAdminCoupon(editingCoupon.id, payload)
        : await createAdminCoupon(payload);
      setCoupons((current) =>
        editingCoupon
          ? current.map((coupon) => (coupon.id === saved.id ? saved : coupon))
          : [saved, ...current]
      );
      resetCoupon();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsMutating(false);
    }
  };

  const toggleShipping = async (method: ShippingMethod, active: boolean) => {
    try {
      const saved = active
        ? await updateAdminShippingMethod(method.id || '', { ...shippingPayload(shippingToForm(method)), active })
        : await deleteAdminShippingMethod(method.id || '');
      setShippingMethods((current) => current.map((item) => (item.id === saved.id ? saved : item)));
    } catch (toggleError) {
      setError(getApiErrorMessage(toggleError));
    }
  };

  const toggleCoupon = async (coupon: Coupon, active: boolean) => {
    try {
      const saved = active
        ? await updateAdminCoupon(coupon.id, { ...couponPayload(couponToForm(coupon)), active })
        : await deleteAdminCoupon(coupon.id);
      setCoupons((current) => current.map((item) => (item.id === saved.id ? saved : item)));
    } catch (toggleError) {
      setError(getApiErrorMessage(toggleError));
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} onAuthClick={() => setIsAuthModalOpen(true)} />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
          <div className="rounded-2xl border border-amber-100 bg-white p-8 text-center shadow-sm">
            <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-amber-900" />
            <h1 className="text-2xl font-bold text-gray-900">Admin access required</h1>
          </div>
        </main>
        <Footer />
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={(id, quantity) => quantity === 0 ? removeItem(id) : updateQuantity(id, quantity)} onRemoveItem={(id) => removeItem(id)} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} onAuthClick={() => setIsAuthModalOpen(true)} />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center text-amber-900 hover:text-amber-700 transition-colors font-medium">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Storefront
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">Checkout Operations</h1>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Truck className="h-5 w-5 text-amber-900" />
              Shipping methods
            </h2>
            <form onSubmit={saveShipping} className="mb-6 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input required placeholder="Code" value={shippingForm.code} onChange={(event) => setShippingForm({ ...shippingForm, code: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
                <input required placeholder="Name" value={shippingForm.name} onChange={(event) => setShippingForm({ ...shippingForm, name: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
                <input required type="number" min="0" placeholder="Fee" value={shippingForm.fee} onChange={(event) => setShippingForm({ ...shippingForm, fee: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
                <input type="number" min="0" placeholder="Free threshold" value={shippingForm.freeThreshold} onChange={(event) => setShippingForm({ ...shippingForm, freeThreshold: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
              </div>
              <textarea placeholder="Description" value={shippingForm.description} onChange={(event) => setShippingForm({ ...shippingForm, description: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={shippingForm.active} onChange={(event) => setShippingForm({ ...shippingForm, active: event.target.checked })} />
                  Active
                </label>
                <input type="number" placeholder="Sort" value={shippingForm.sortOrder} onChange={(event) => setShippingForm({ ...shippingForm, sortOrder: event.target.value })} className="w-24 rounded-lg border border-gray-300 px-3 py-2" />
                <button disabled={isMutating} className="inline-flex items-center rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                  <Save className="mr-2 h-4 w-4" />
                  {editingShipping ? 'Update' : 'Create'}
                </button>
                {editingShipping && (
                  <button type="button" onClick={resetShipping} className="text-sm font-medium text-gray-600">
                    Cancel
                  </button>
                )}
              </div>
            </form>
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                shippingMethods.map((method) => (
                  <div key={method.id || method.code} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.code} - {currency.format(method.fee)}₫</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${method.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {method.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => { setEditingShipping(method); setShippingForm(shippingToForm(method)); }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700">
                        Edit
                      </button>
                      <button type="button" onClick={() => toggleShipping(method, !method.active)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700">
                        {method.active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Ticket className="h-5 w-5 text-amber-900" />
              Coupons
            </h2>
            <form onSubmit={saveCoupon} className="mb-6 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input required placeholder="Code" value={couponForm.code} onChange={(event) => setCouponForm({ ...couponForm, code: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
                <select value={couponForm.type} onChange={(event) => setCouponForm({ ...couponForm, type: event.target.value as 'fixed' | 'percent' })} className="rounded-lg border border-gray-300 px-3 py-2">
                  <option value="fixed">Fixed</option>
                  <option value="percent">Percent</option>
                </select>
                <input required type="number" min="0" placeholder="Value" value={couponForm.value} onChange={(event) => setCouponForm({ ...couponForm, value: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
                <input type="number" min="0" placeholder="Min subtotal" value={couponForm.minSubtotal} onChange={(event) => setCouponForm({ ...couponForm, minSubtotal: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
                <input type="number" min="0" placeholder="Max discount" value={couponForm.maxDiscount} onChange={(event) => setCouponForm({ ...couponForm, maxDiscount: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
                <input type="number" min="0" placeholder="Usage limit" value={couponForm.usageLimit} onChange={(event) => setCouponForm({ ...couponForm, usageLimit: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
                <input placeholder="Starts at ISO" value={couponForm.startsAt} onChange={(event) => setCouponForm({ ...couponForm, startsAt: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
                <input placeholder="Ends at ISO" value={couponForm.endsAt} onChange={(event) => setCouponForm({ ...couponForm, endsAt: event.target.value })} className="rounded-lg border border-gray-300 px-3 py-2" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={couponForm.active} onChange={(event) => setCouponForm({ ...couponForm, active: event.target.checked })} />
                  Active
                </label>
                <button disabled={isMutating} className="inline-flex items-center rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                  <Save className="mr-2 h-4 w-4" />
                  {editingCoupon ? 'Update' : 'Create'}
                </button>
                {editingCoupon && (
                  <button type="button" onClick={resetCoupon} className="text-sm font-medium text-gray-600">
                    Cancel
                  </button>
                )}
              </div>
            </form>
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : (
                coupons.map((coupon) => (
                  <div key={coupon.id} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{coupon.code}</p>
                        <p className="text-sm text-gray-500">
                          {coupon.type} - {coupon.type === 'percent' ? `${coupon.value}%` : `${currency.format(coupon.value)}₫`} - used {coupon.usedCount}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${coupon.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {coupon.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => { setEditingCoupon(coupon); setCouponForm(couponToForm(coupon)); }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700">
                        Edit
                      </button>
                      <button type="button" onClick={() => toggleCoupon(coupon, !coupon.active)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700">
                        {coupon.active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={(id, quantity) => quantity === 0 ? removeItem(id) : updateQuantity(id, quantity)} onRemoveItem={(id) => removeItem(id)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
