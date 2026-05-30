'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { toast } from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import useCartStore from '@/stores/cartStore';
import { Link } from '@/i18n/routing';
import useOrderStore, { Order } from '@/stores/orderStore';
import {
  createOrder,
  createPayment,
  fetchPaymentGateways,
  getApiErrorMessage,
  isNetworkError,
  PaymentGatewayAvailability,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface LocationOption {
  code: number;
  name: string;
}

function isValidPhone(phone: string) {
  return /^[0-9+\-\s().]{8,20}$/.test(phone.trim());
}

export default function CheckoutClient() {
  const t = useTranslations('checkout');
  const tHome = useTranslations('productDetail');
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  const [formData, setFormData] = useState({ 
    name: '', 
    email: '',
    phone: '', 
    province: '',
    district: '',
    ward: '',
    detailAddress: '',
    note: ''
  });
  
  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayAvailability[]>([]);

  const { items: cartItems, clearCart, updateQuantity, removeItem } = useCartStore();
  const { addOrder } = useOrderStore();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + price * item.quantity;
  }, 0);
  const stockIssues = cartItems.filter(
    (item) => typeof item.stock === 'number' && item.quantity > item.stock
  );
  const stockIssueNames = stockIssues.map((item) => item.name).join(', ');
  const hasStockIssue = stockIssues.length > 0;
  const gatewayEnabled = useMemo(
    () =>
      paymentGateways.reduce<Record<string, boolean>>((result, gateway) => {
        result[gateway.gateway] = gateway.enabled;
        return result;
      }, {}),
    [paymentGateways]
  );

  useEffect(() => {
    let active = true;
    fetchPaymentGateways()
      .then((gateways) => {
        if (active) setPaymentGateways(gateways);
      })
      .catch(() => {
        if (active) setPaymentGateways([]);
      });

    setIsLoadingAddress(true);
    fetch('https://provinces.open-api.vn/api/p/')
      .then((res) => res.json())
      .then((data) => {
        if (active) setProvinces(data);
      })
      .finally(() => {
        if (active) setIsLoadingAddress(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (formData.province) {
      const p = provinces.find((p) => p.name === formData.province);
      if (p) {
        setIsLoadingAddress(true);
        fetch(`https://provinces.open-api.vn/api/p/${p.code}?depth=2`)
          .then((res) => res.json())
          .then((data) => {
            if (active) setDistricts(data.districts || []);
          })
          .finally(() => {
            if (active) setIsLoadingAddress(false);
          });
      }
    } else {
      setDistricts([]);
      setWards([]);
    }
    return () => {
      active = false;
    };
  }, [formData.province, provinces]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    if (formData.district) {
      const d = districts.find((d) => d.name === formData.district);
      if (d) {
        setIsLoadingAddress(true);
        fetch(`https://provinces.open-api.vn/api/d/${d.code}?depth=2`)
          .then((res) => res.json())
          .then((data) => {
            if (active) setWards(data.wards || []);
          })
          .finally(() => {
            if (active) setIsLoadingAddress(false);
          });
      }
    } else {
      setWards([]);
    }
    return () => {
      active = false;
    };
  }, [formData.district, districts]);

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, quantity);
    }
  };

  const createLocalOrder = (customer: Order['customer']): Order => ({
    id: Math.floor(Math.random() * 1000000).toString(),
    date: new Date().toISOString(),
    items: [...cartItems],
    total,
    status: paymentMethod === 'cod' ? 'processing' : 'pending_payment',
    customer,
    paymentMethod,
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || isSubmitting) return;

    setError('');

    if (paymentMethod !== 'cod' && !user) {
      setError(
        locale === 'vi'
          ? 'Vui long dang nhap de thanh toan truc tuyen.'
          : 'Please sign in to use online payment.'
      );
      setIsAuthModalOpen(true);
      return;
    }

    if (hasStockIssue) {
      setError(
        locale === 'vi'
          ? `Một số sản phẩm đã vượt quá tồn kho: ${stockIssueNames}. Vui lòng giảm số lượng trước khi đặt hàng.`
          : `Some products exceed available stock: ${stockIssueNames}. Please reduce quantities before checkout.`
      );
      return;
    }

    const fullAddress = [
      formData.detailAddress.trim(),
      formData.ward.trim(),
      formData.district.trim(),
      formData.province.trim(),
    ]
      .filter(Boolean)
      .join(', ');

    const customer = {
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim(),
      address: fullAddress,
      note: formData.note.trim() || undefined,
    };

    if (!isValidPhone(customer.phone)) {
      setError(
        locale === 'vi'
          ? 'Số điện thoại chưa hợp lệ.'
          : 'Please enter a valid phone number.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let nextOrder: Order | null = null;
      const numericItems = cartItems
        .map((item) => ({
          productId: Number(item.id),
          quantity: item.quantity,
        }))
        .filter((item) => Number.isFinite(item.productId));

      if (user && numericItems.length === cartItems.length) {
        try {
          nextOrder = await createOrder({
            items: numericItems,
            customer,
            paymentMethod,
          });
        } catch (apiError) {
          if (!isNetworkError(apiError)) {
            throw apiError;
          }
        }
      }

      if (!nextOrder) {
        nextOrder = createLocalOrder(customer);
      }

      if (paymentMethod === 'vnpay' || paymentMethod === 'momo') {
        const payment = await createPayment(nextOrder.id, paymentMethod);
        addOrder(nextOrder);
        clearCart();
        window.location.href = payment.paymentUrl;
        return;
      }

      addOrder(nextOrder);
      clearCart();
      router.push(`/checkout/success?orderId=${nextOrder.id}`);
    } catch (checkoutError) {
      const apiMessage = getApiErrorMessage(checkoutError);
      setError(
        apiMessage && !apiMessage.includes('status code')
          ? apiMessage
          : locale === 'vi'
            ? 'Không thể đặt hàng. Vui lòng kiểm tra tồn kho hoặc thử lại sau.'
            : 'Could not place the order. Please check stock or try again later.'
      );
    } finally {
      setIsSubmitting(false);
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
          <Link
            href="/"
            className="inline-flex items-center text-amber-900 hover:text-amber-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {tHome('backToHome')}
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>

        {!user && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              {locale === 'vi'
                ? 'Bạn có thể đặt hàng nhanh. Đăng nhập để đồng bộ đơn hàng với tài khoản.'
                : 'You can checkout as a guest. Sign in to sync orders with your account.'}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {hasStockIssue && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              {locale === 'vi'
                ? `Có sản phẩm vượt quá tồn kho: ${stockIssueNames}. Hãy giảm số lượng trong giỏ hàng.`
                : `Some cart items exceed available stock: ${stockIssueNames}. Reduce quantities before checkout.`}
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('shipping')}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('province')} {isLoadingAddress && <span className="text-amber-900 animate-pulse text-xs ml-1">...</span>}
                      </label>
                      <Select
                        required
                        value={formData.province}
                        onValueChange={(val) => setFormData({ ...formData, province: val, district: '', ward: '' })}
                      >
                        <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900 bg-white h-[42px]">
                          <SelectValue placeholder={t('selectProvince')} />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((p) => (
                            <SelectItem key={p.code} value={p.name}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('district')} {isLoadingAddress && <span className="text-amber-900 animate-pulse text-xs ml-1">...</span>}
                      </label>
                      <Select
                        required
                        disabled={!formData.province}
                        value={formData.district}
                        onValueChange={(val) => setFormData({ ...formData, district: val, ward: '' })}
                      >
                        <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900 bg-white disabled:bg-gray-100 h-[42px]">
                          <SelectValue placeholder={t('selectDistrict')} />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((d) => (
                            <SelectItem key={d.code} value={d.name}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('ward')} {isLoadingAddress && <span className="text-amber-900 animate-pulse text-xs ml-1">...</span>}
                      </label>
                      <Select
                        required
                        disabled={!formData.district}
                        value={formData.ward}
                        onValueChange={(val) => setFormData({ ...formData, ward: val })}
                      >
                        <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900 bg-white disabled:bg-gray-100 h-[42px]">
                          <SelectValue placeholder={t('selectWard')} />
                        </SelectTrigger>
                        <SelectContent>
                          {wards.map((w) => (
                            <SelectItem key={w.code} value={w.name}>{w.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('detailAddress')}</label>
                    <input
                      type="text"
                      required
                      value={formData.detailAddress}
                      onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('note')}</label>
                    <textarea
                      rows={2}
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('payment')}</h2>
                <div className="space-y-4">
                  {[
                    ['cod', t('cod')],
                    ['vnpay', t('banking')],
                    ['momo', t('momo')],
                  ].map(([value, label]) => {
                    const isOnlineGateway = value === 'vnpay' || value === 'momo';
                    const isDisabled =
                      isOnlineGateway && (!gatewayEnabled[value] || !user);

                    return (
                    <label
                      key={value}
                      className={`flex items-center p-4 border rounded-xl transition-colors ${
                        isDisabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer'
                      } ${
                        paymentMethod === value
                          ? 'border-amber-900 bg-amber-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={value}
                        checked={paymentMethod === value}
                        disabled={isDisabled}
                        onChange={() => setPaymentMethod(value)}
                        className="h-4 w-4 text-amber-900 focus:ring-amber-900"
                      />
                      <span className="ml-3 font-medium text-gray-900">
                        {label}
                        {isOnlineGateway && !gatewayEnabled[value] && (
                          <span className="ml-2 text-xs text-gray-500">
                            {locale === 'vi' ? '(chua cau hinh)' : '(not configured)'}
                          </span>
                        )}
                      </span>
                    </label>
                    );
                  })}
                </div>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {locale === 'vi' ? 'Tóm tắt đơn hàng' : 'Order Summary'}
              </h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-gray-500">
                        {locale === 'vi' ? 'SL:' : 'Qty:'} {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-gray-900">
                      {new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
                        (typeof item.price === 'string' ? parseFloat(item.price) : item.price) *
                          item.quantity
                      )}
                      ₫
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                  <span>{locale === 'vi' ? 'Tổng cộng' : 'Total'}</span>
                  <span className="text-amber-900">
                    {new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(total)}₫
                  </span>
                </div>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={cartItems.length === 0 || isSubmitting || hasStockIssue}
                className="w-full bg-amber-900 hover:bg-amber-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? locale === 'vi'
                    ? 'Đang đặt hàng...'
                    : 'Placing order...'
                  : t('placeOrder')}
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
        onRemoveItem={(id) => removeItem(id)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
