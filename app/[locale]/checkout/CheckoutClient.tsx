'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { AlertCircle, ArrowLeft, MapPin, Ticket, Truck, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import useCartStore from '@/stores/cartStore';
import { Link } from '@/i18n/routing';
import useOrderStore from '@/stores/orderStore';
import {
  CheckoutQuote,
  PaymentGatewayAvailability,
  ShippingMethod,
  UserAddress,
  createOrder,
  createPayment,
  createUserAddress,
  deleteUserAddress,
  fetchPaymentGateways,
  fetchShippingMethods,
  fetchUserAddresses,
  getApiErrorMessage,
  quoteCheckout,
  setDefaultUserAddress,
} from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface LocationOption {
  code: number;
  name: string;
}

function isValidPhone(phone: string) {
  return /^[0-9+\-\s().]{8,20}$/.test(phone.trim());
}

function addressToLine(address: UserAddress) {
  return [
    address.detailAddress,
    address.ward,
    address.district,
    address.province,
  ]
    .filter(Boolean)
    .join(', ');
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
  const [quoteError, setQuoteError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const [provinces, setProvinces] = useState<LocationOption[]>([]);
  const [wards, setWards] = useState<LocationOption[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('manual');
  const [saveAddress, setSaveAddress] = useState(false);

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [shippingMethodCode, setShippingMethodCode] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    detailAddress: '',
    note: '',
  });

  const [paymentGateways, setPaymentGateways] = useState<
    PaymentGatewayAvailability[]
  >([]);

  const {
    items: cartItems,
    clearCart,
    updateQuantity,
    removeItem,
  } = useCartStore();
  const { addOrder } = useOrderStore();

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => {
    const price =
      typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + price * item.quantity;
  }, 0);
  const stockIssues = cartItems.filter(
    (item) => typeof item.stock === 'number' && item.quantity > item.stock
  );
  const stockIssueNames = stockIssues.map((item) => item.name).join(', ');
  const hasStockIssue = stockIssues.length > 0;
  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    [locale]
  );
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

    fetchShippingMethods()
      .then((methods) => {
        if (!active) return;
        setShippingMethods(methods);
        setShippingMethodCode((current) => current || methods[0]?.code || '');
      })
      .catch(() => {
        if (active) setShippingMethods([]);
      });

    setIsLoadingAddress(true);
    fetch('https://provinces.open-api.vn/api/v2/p/')
      .then((res) => res.json())
      .then((data) => {
        if (active) setProvinces(data);
      })
      .catch(() => {
        if (active) setProvinces([]);
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
    if (!user) {
      setAddresses([]);
      setSelectedAddressId('manual');
      return;
    }

    fetchUserAddresses()
      .then((nextAddresses) => {
        if (!active) return;
        setAddresses(nextAddresses);
        const preferred =
          nextAddresses.find((address) => address.defaultAddress) ||
          nextAddresses[0];
        if (preferred) {
          setSelectedAddressId(String(preferred.id));
          applyAddress(preferred);
        }
      })
      .catch(() => {
        if (active) setAddresses([]);
      });

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    let active = true;
    if (formData.province) {
      const province = provinces.find(
        (current) => current.name === formData.province
      );
      if (province) {
        setIsLoadingAddress(true);
        fetch(`https://provinces.open-api.vn/api/v2/p/${province.code}?depth=2`)
          .then((res) => res.json())
          .then((data) => {
            if (active) setWards(data.wards || []);
          })
          .catch(() => {
            if (active) setWards([]);
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
  }, [formData.province, provinces]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        province: prev.province || user.province || '',
        district: prev.district || user.district || '',
        ward: prev.ward || user.ward || '',
        detailAddress: prev.detailAddress || user.detailAddress || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    const numericItems = cartItems
      .map((item) => ({
        productId: Number(item.id),
        variantId:
          typeof item.variantId === 'number' && Number.isFinite(item.variantId)
            ? item.variantId
            : undefined,
        quantity: item.quantity,
      }))
      .filter((item) => Number.isFinite(item.productId));

    if (
      numericItems.length === 0 ||
      numericItems.length !== cartItems.length ||
      !shippingMethodCode
    ) {
      setQuote(null);
      setQuoteError('');
      return;
    }

    quoteCheckout({
      items: numericItems,
      shippingMethodCode,
      couponCode: appliedCoupon || undefined,
    })
      .then((nextQuote) => {
        if (!active) return;
        setQuote(nextQuote);
        setQuoteError('');
        setShippingMethods(nextQuote.shippingMethods);
      })
      .catch((quoteFailure) => {
        if (!active) return;
        setQuote(null);
        setQuoteError(getApiErrorMessage(quoteFailure));
      });

    return () => {
      active = false;
    };
  }, [appliedCoupon, cartItems, shippingMethodCode]);

  const applyAddress = (address: UserAddress) => {
    setFormData((current) => ({
      ...current,
      name: address.recipientName,
      phone: address.phone,
      province: address.province,
      district: address.district || '',
      ward: address.ward,
      detailAddress: address.detailAddress,
    }));
  };

  const handleSelectAddress = (value: string) => {
    setSelectedAddressId(value);
    if (value === 'manual') return;
    const selected = addresses.find((address) => String(address.id) === value);
    if (selected) applyAddress(selected);
  };

  const handleSetDefaultAddress = async (address: UserAddress) => {
    try {
      const updated = await setDefaultUserAddress(address.id);
      setAddresses((current) =>
        current.map((item) => ({
          ...item,
          defaultAddress: item.id === updated.id,
        }))
      );
    } catch (addressError) {
      setError(getApiErrorMessage(addressError));
    }
  };

  const handleDeleteAddress = async (address: UserAddress) => {
    try {
      await deleteUserAddress(address.id);
      setAddresses((current) =>
        current.filter((item) => item.id !== address.id)
      );
      if (selectedAddressId === String(address.id)) {
        setSelectedAddressId('manual');
      }
    } catch (addressError) {
      setError(getApiErrorMessage(addressError));
    }
  };

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, quantity);
    }
  };

  const applyCoupon = () => {
    setAppliedCoupon(couponInput.trim().toUpperCase());
  };

  const clearCoupon = () => {
    setAppliedCoupon('');
    setCouponInput('');
  };

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    if (cartItems.length === 0 || isSubmitting) return;

    setError('');

    if (!shippingMethodCode) {
      setError(
        locale === 'vi'
          ? 'Vui lòng chọn phương thức giao hàng.'
          : 'Please choose a shipping method.'
      );
      return;
    }

    if (paymentMethod !== 'cod' && !user) {
      setError(
        locale === 'vi'
          ? 'Vui lòng đăng nhập để thanh toán trực tuyến.'
          : 'Please sign in to use online payment.'
      );
      setIsAuthModalOpen(true);
      return;
    }

    if (hasStockIssue) {
      setError(
        locale === 'vi'
          ? `Có sản phẩm vượt quá tồn kho: ${stockIssueNames}.`
          : `Some products exceed available stock: ${stockIssueNames}.`
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

    if (!customer.name || !customer.address || !customer.phone) {
      setError(
        locale === 'vi'
          ? 'Vui lòng nhập đủ thông tin giao hàng.'
          : 'Please complete shipping information.'
      );
      return;
    }

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
      const numericItems = cartItems
        .map((item) => ({
          productId: Number(item.id),
          variantId:
            typeof item.variantId === 'number' &&
            Number.isFinite(item.variantId)
              ? item.variantId
              : undefined,
          quantity: item.quantity,
        }))
        .filter((item) => Number.isFinite(item.productId));

      if (numericItems.length !== cartItems.length) {
        throw new Error('Cart contains items that cannot be checked out.');
      }

      let addressId =
        user && selectedAddressId !== 'manual'
          ? Number(selectedAddressId)
          : undefined;

      if (user && saveAddress && !addressId) {
        const savedAddress = await createUserAddress({
          recipientName: customer.name,
          phone: customer.phone,
          province: formData.province.trim(),
          district: formData.district.trim(),
          ward: formData.ward.trim(),
          detailAddress: formData.detailAddress.trim(),
          defaultAddress: addresses.length === 0,
        });
        setAddresses((current) => [savedAddress, ...current]);
        setSelectedAddressId(String(savedAddress.id));
        addressId = savedAddress.id;
      }

      const nextOrder = await createOrder({
        items: numericItems,
        customer,
        paymentMethod,
        shippingMethodCode,
        couponCode: appliedCoupon || undefined,
        addressId,
      });

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
            ? 'Không thể đặt hàng. Vui lòng kiểm tra lại.'
            : 'Could not place the order. Please check details and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedSubtotal = quote?.subtotal ?? subtotal;
  const displayedShipping = quote?.shippingFee ?? 0;
  const displayedDiscount = quote?.discountAmount ?? 0;
  const displayedTotal = quote?.total ?? subtotal;

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

        <h1
          data-testid="checkout-title"
          className="text-3xl font-bold text-gray-900 mb-8"
        >
          {t('title')}
        </h1>

        {!user && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              {locale === 'vi'
                ? 'Bạn có thể đặt COD nhanh. Đăng nhập để dùng thanh toán trực tuyến và lưu địa chỉ.'
                : 'You can place a COD guest order. Sign in for online payment and saved addresses.'}
            </p>
          </div>
        )}

        {(error || quoteError) && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error || quoteError}</p>
          </div>
        )}

        {hasStockIssue && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">
              {locale === 'vi'
                ? `Có sản phẩm vượt quá tồn kho: ${stockIssueNames}.`
                : `Some cart items exceed available stock: ${stockIssueNames}.`}
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <form
              id="checkout-form"
              onSubmit={handleCheckout}
              className="space-y-8"
            >
              <div
                data-testid="checkout-shipping-section"
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-900" />
                  {t('shipping')}
                </h2>

                {user && addresses.length > 0 && (
                  <div className="mb-5 rounded-xl border border-gray-200 p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'vi' ? 'Địa chỉ đã lưu' : 'Saved address'}
                    </label>
                    <Select
                      value={selectedAddressId}
                      onValueChange={handleSelectAddress}
                    >
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">
                          {locale === 'vi'
                            ? 'Nhập địa chỉ mới'
                            : 'Enter a new address'}
                        </SelectItem>
                        {addresses.map((address) => (
                          <SelectItem
                            key={address.id}
                            value={String(address.id)}
                          >
                            {address.recipientName} - {addressToLine(address)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-600"
                        >
                          <span>{address.recipientName}</span>
                          {!address.defaultAddress && (
                            <button
                              type="button"
                              className="text-amber-900"
                              onClick={() => handleSetDefaultAddress(address)}
                            >
                              Default
                            </button>
                          )}
                          <button
                            type="button"
                            className="text-red-600"
                            onClick={() => handleDeleteAddress(address)}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('name')}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('phone')}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('province')}{' '}
                        {isLoadingAddress && (
                          <span className="text-amber-900 animate-pulse text-xs ml-1">
                            ...
                          </span>
                        )}
                      </label>
                      <Select
                        required
                        value={formData.province}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            province: value,
                            ward: '',
                          })
                        }
                      >
                        <SelectTrigger className="w-full bg-white h-[42px]">
                          <SelectValue placeholder={t('selectProvince')} />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem
                              key={province.code}
                              value={province.name}
                            >
                              {province.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {locale === 'vi' ? 'Quận/Huyện' : 'District'}
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) =>
                          setFormData({ ...formData, district: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('ward')}{' '}
                        {isLoadingAddress && (
                          <span className="text-amber-900 animate-pulse text-xs ml-1">
                            ...
                          </span>
                        )}
                      </label>
                      <Select
                        required
                        disabled={!formData.province}
                        value={formData.ward}
                        onValueChange={(value) =>
                          setFormData({ ...formData, ward: value })
                        }
                      >
                        <SelectTrigger className="w-full bg-white disabled:bg-gray-100 h-[42px]">
                          <SelectValue placeholder={t('selectWard')} />
                        </SelectTrigger>
                        <SelectContent>
                          {wards.map((ward) => (
                            <SelectItem key={ward.code} value={ward.name}>
                              {ward.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('detailAddress')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.detailAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          detailAddress: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900"
                    />
                  </div>

                  {user && selectedAddressId === 'manual' && (
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(event) =>
                          setSaveAddress(event.target.checked)
                        }
                        className="h-4 w-4 text-amber-900 focus:ring-amber-900"
                      />
                      {locale === 'vi'
                        ? 'Lưu địa chỉ này'
                        : 'Save this address'}
                    </label>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('note')}
                    </label>
                    <textarea
                      rows={2}
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-900 focus:border-amber-900"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-900" />
                  {locale === 'vi'
                    ? 'Phương thức giao hàng'
                    : 'Shipping method'}
                </h2>
                <div className="grid gap-3">
                  {shippingMethods.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      {locale === 'vi'
                        ? 'Chưa có phương thức giao hàng.'
                        : 'No shipping methods available.'}
                    </p>
                  ) : (
                    shippingMethods.map((method) => (
                      <label
                        key={method.code}
                        className={`flex items-center justify-between gap-4 rounded-xl border p-4 transition ${
                          shippingMethodCode === method.code
                            ? 'border-amber-900 bg-amber-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={method.code}
                            checked={shippingMethodCode === method.code}
                            onChange={() => setShippingMethodCode(method.code)}
                            className="h-4 w-4 text-amber-900 focus:ring-amber-900"
                          />
                          <span>
                            <span className="block font-medium text-gray-900">
                              {method.name}
                            </span>
                            {method.freeThreshold ? (
                              <span className="block text-xs text-gray-500">
                                {locale === 'vi' ? 'Miễn phí từ' : 'Free from'}{' '}
                                {currency.format(method.freeThreshold)}₫
                              </span>
                            ) : null}
                          </span>
                        </span>
                        <span className="font-semibold text-gray-900">
                          {currency.format(method.fee)}₫
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div
                data-testid="checkout-payment-section"
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('payment')}
                </h2>
                <div className="space-y-4">
                  {[
                    ['cod', t('cod')],
                    ['vnpay', t('banking')],
                    ['momo', t('momo')],
                  ].map(([value, label]) => {
                    const isOnlineGateway =
                      value === 'vnpay' || value === 'momo';
                    const isDisabled =
                      isOnlineGateway && (!gatewayEnabled[value] || !user);

                    return (
                      <label
                        key={value}
                        className={`flex items-center p-4 border rounded-xl transition-colors ${
                          isDisabled
                            ? 'cursor-not-allowed opacity-55'
                            : 'cursor-pointer'
                        } ${paymentMethod === value ? 'border-amber-900 bg-amber-50' : 'border-gray-200'}`}
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
                              {locale === 'vi'
                                ? '(chưa cấu hình)'
                                : '(not configured)'}
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
            <div
              data-testid="checkout-order-summary"
              className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {locale === 'vi' ? 'Tóm tắt đơn hàng' : 'Order Summary'}
              </h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      {item.variantName && (
                        <p className="text-xs text-gray-500 truncate">
                          {item.variantName}
                        </p>
                      )}
                      <p className="text-gray-500">
                        {locale === 'vi' ? 'SL:' : 'Qty:'} {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-gray-900">
                      {currency.format(
                        (typeof item.price === 'string'
                          ? parseFloat(item.price)
                          : item.price) * item.quantity
                      )}
                      ₫
                    </span>
                  </div>
                ))}
              </div>

              <div className="mb-5 rounded-xl border border-gray-200 p-3">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Ticket className="w-4 h-4 text-amber-900" />
                  {locale === 'vi' ? 'Mã giảm giá' : 'Coupon'}
                </label>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                    placeholder="SAVE10"
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-900 focus:ring-amber-900"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={clearCoupon}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="rounded-lg bg-amber-900 px-3 py-2 text-sm font-medium text-white"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="mt-2 text-xs font-medium text-emerald-700">
                    {appliedCoupon}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6 space-y-3 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>{locale === 'vi' ? 'Tạm tính' : 'Subtotal'}</span>
                  <span>{currency.format(displayedSubtotal)}₫</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>{locale === 'vi' ? 'Phí giao hàng' : 'Shipping'}</span>
                  <span>{currency.format(displayedShipping)}₫</span>
                </div>
                {displayedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>{locale === 'vi' ? 'Giảm giá' : 'Discount'}</span>
                    <span>-{currency.format(displayedDiscount)}₫</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>{locale === 'vi' ? 'Tổng cộng' : 'Total'}</span>
                  <span className="text-amber-900">
                    {currency.format(displayedTotal)}₫
                  </span>
                </div>
              </div>
              <button
                data-testid="checkout-submit"
                type="submit"
                form="checkout-form"
                disabled={
                  cartItems.length === 0 ||
                  isSubmitting ||
                  hasStockIssue ||
                  !shippingMethodCode ||
                  Boolean(quoteError)
                }
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
