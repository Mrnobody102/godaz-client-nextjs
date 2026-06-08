import axios, { AxiosError, AxiosInstance } from 'axios';
import type { Product } from '@/lib/constants/products';
import {
  normalizeOrderStatus,
  normalizePaymentStatus,
} from '@/stores/orderStore';
import type { Order, OrderEvent, OrderStatus } from '@/stores/orderStore';

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  phone?: string | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  detailAddress?: string | null;
}

export interface UpdateProfileRequest {
  phone: string;
  province: string;
  district?: string;
  ward: string;
  detailAddress: string;
}

export async function updateProfile(request: UpdateProfileRequest) {
  const { data } = await api.put<{ message: string }>('/api/users/profile', request);
  return data;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  category: string;
  categorySlug: string;
  sku?: string | null;
  brand?: string | null;
  price: number | string;
  unit: string;
  image: string;
  description: string;
  stock: number;
  featured: boolean;
  galleryImages?: ApiProductImage[];
  variants?: ApiProductVariant[];
}

export interface ApiProductImage {
  id?: number | null;
  imageUrl: string;
  altText?: string | null;
  sortOrder?: number | null;
}

export interface ApiProductVariant {
  id: number;
  name: string;
  sku?: string | null;
  price: number | string;
  stock: number;
  imageUrl?: string | null;
  active: boolean;
  sortOrder?: number | null;
}

export interface ProductSearchResponse {
  products: ApiProduct[];
  categories: ApiCategory[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface ApiAdminCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type AdminCategory = ApiAdminCategory;

export interface ApiAdminProduct {
  id: number;
  name: string;
  slug: string;
  sku?: string | null;
  brand?: string | null;
  categoryId: number;
  category: string;
  categorySlug: string;
  categoryActive: boolean;
  price: number | string;
  unit: string;
  imageUrl?: string | null;
  description?: string | null;
  stock: number;
  featured: boolean;
  active: boolean;
  galleryImages?: ApiProductImage[];
  variants?: ApiProductVariant[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminProduct extends Omit<ApiAdminProduct, 'price' | 'variants'> {
  price: number;
  variants?: Product['variants'];
}

export interface AdminProductPageResponse {
  products: AdminProduct[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface AdminProductPayload {
  name: string;
  slug?: string;
  sku?: string;
  brand?: string;
  categoryId: number;
  description?: string;
  price: number;
  stock: number;
  unit: string;
  imageUrl?: string;
  featured: boolean;
  active: boolean;
  galleryImages?: ApiProductImage[];
  variants?: Array<{
    id?: number | null;
    name: string;
    sku?: string | null;
    price: number;
    stock: number;
    imageUrl?: string | null;
    active?: boolean;
    sortOrder?: number | null;
  }>;
}

export interface AdminCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
}

export interface ShippingMethod {
  id?: number | null;
  code: string;
  name: string;
  description?: string | null;
  fee: number;
  freeThreshold?: number | null;
  active: boolean;
  sortOrder?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface ApiShippingMethod extends Omit<ShippingMethod, 'fee' | 'freeThreshold'> {
  fee: number | string;
  freeThreshold?: number | string | null;
}

export interface ShippingMethodPayload {
  code: string;
  name: string;
  description?: string;
  fee: number;
  freeThreshold?: number | null;
  active: boolean;
  sortOrder?: number;
}

export interface Coupon {
  id: number;
  code: string;
  type: 'fixed' | 'percent' | string;
  value: number;
  minSubtotal?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  startsAt?: string | null;
  endsAt?: string | null;
  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface ApiCoupon extends Omit<Coupon, 'value' | 'minSubtotal' | 'maxDiscount'> {
  value: number | string;
  minSubtotal?: number | string | null;
  maxDiscount?: number | string | null;
}

export interface CouponPayload {
  code: string;
  type: 'fixed' | 'percent';
  value: number;
  minSubtotal?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  active: boolean;
}

export interface UserAddress {
  id: number;
  recipientName: string;
  phone: string;
  province: string;
  district?: string | null;
  ward: string;
  detailAddress: string;
  defaultAddress: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface UserAddressPayload {
  recipientName: string;
  phone: string;
  province: string;
  district?: string;
  ward: string;
  detailAddress: string;
  defaultAddress?: boolean;
}

export interface CheckoutPayload {
  items: Array<{
    productId: number;
    variantId?: number;
    quantity: number;
  }>;
  customer: {
    name: string;
    phone: string;
    address: string;
    email?: string;
    note?: string;
  };
  paymentMethod: string;
  shippingMethodCode: string;
  couponCode?: string;
  addressId?: number;
}

export interface CheckoutQuotePayload {
  items: CheckoutPayload['items'];
  shippingMethodCode: string;
  couponCode?: string;
}

export interface CheckoutQuote {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  couponCode?: string | null;
  shippingMethod: ShippingMethod;
  shippingMethods: ShippingMethod[];
}

export interface PaymentGatewayAvailability {
  gateway: 'vnpay' | 'momo' | string;
  enabled: boolean;
}

export interface CreatePaymentResponse {
  paymentId: string;
  orderId: string;
  gateway: string;
  status: string;
  amount: number | string;
  paymentUrl: string;
}

export interface ProductReview {
  id: string;
  productId: number;
  userId: string;
  userName: string;
  rating?: number | null;
  content: string;
  edited: boolean;
  mine: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductReviewPageResponse {
  reviews: ProductReview[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

interface ApiOrderItem {
  productId: number;
  variantId?: number | null;
  name: string;
  variantName?: string | null;
  sku?: string | null;
  category: string;
  price: number | string;
  unit: string;
  image: string;
  description: string;
  quantity: number;
}

interface ApiOrderResponse {
  id: string;
  date: string;
  items: ApiOrderItem[];
  subtotal?: number | string;
  shippingFee?: number | string;
  discountAmount?: number | string;
  total: number | string;
  status: string;
  customer: Order['customer'];
  shippingMethod?: {
    code: string;
    name: string;
    fee: number | string;
  } | null;
  couponCode?: string | null;
  paymentMethod: string;
  paymentStatus?: string | null;
  reservationExpiresAt?: string | null;
  refundAmount?: number | string | null;
  refundedAt?: string | null;
  guestAccessToken?: string | null;
  events?: Array<{
    actorType: string;
    actorId?: string | null;
    fromStatus?: string | null;
    toStatus: string;
    reason?: string | null;
    metadata?: string | null;
    createdAt: string;
  }>;
}

interface ApiOrderPageResponse {
  orders: ApiOrderResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export function isNetworkError(error: unknown) {
  return axios.isAxiosError(error) && !error.response;
}

export function toProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    categorySlug: product.categorySlug,
    sku: product.sku ?? null,
    brand: product.brand ?? null,
    price: Number(product.price),
    unit: product.unit,
    image: product.image,
    description: product.description,
    stock: product.stock,
    featured: product.featured,
    galleryImages: product.galleryImages || [],
    variants: (product.variants || []).map(toProductVariant),
  };
}

export function toAdminProduct(product: ApiAdminProduct): AdminProduct {
  return {
    ...product,
    price: Number(product.price),
    variants: (product.variants || []).map(toProductVariant),
  };
}

function toProductVariant(variant: ApiProductVariant): NonNullable<Product['variants']>[number] {
  return {
    ...variant,
    price: Number(variant.price),
  };
}

export function toAdminCategory(category: ApiAdminCategory): AdminCategory {
  return category;
}

export function toShippingMethod(method: ApiShippingMethod): ShippingMethod {
  return {
    ...method,
    fee: Number(method.fee),
    freeThreshold:
      method.freeThreshold === null || typeof method.freeThreshold === 'undefined'
        ? null
        : Number(method.freeThreshold),
  };
}

export function toCoupon(coupon: ApiCoupon): Coupon {
  return {
    ...coupon,
    value: Number(coupon.value),
    minSubtotal:
      coupon.minSubtotal === null || typeof coupon.minSubtotal === 'undefined'
        ? null
        : Number(coupon.minSubtotal),
    maxDiscount:
      coupon.maxDiscount === null || typeof coupon.maxDiscount === 'undefined'
        ? null
        : Number(coupon.maxDiscount),
  };
}

export async function loginRequest(username: string, password: string) {
  const { data } = await api.post<LoginResponse>('/login', {
    username,
    password,
  });
  return data;
}

export async function googleLoginRequest(idToken: string) {
  const { data } = await api.post<LoginResponse>('/login/google', {
    idToken,
  });
  return data;
}

export async function registerRequest(name: string, email: string, password: string) {
  await api.post('/register', {
    name,
    email,
    username: email,
    password,
  });
  return loginRequest(email, password);
}

export async function fetchProducts(params?: {
  search?: string;
  category?: string | null;
  sort?: string;
  page?: number;
  size?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
}) {
  const { data } = await api.get<ProductSearchResponse>('/api/products', {
    params: {
      search: params?.search || undefined,
      category: params?.category || undefined,
      sort: params?.sort || 'newest',
      page: params?.page ?? 0,
      size: params?.size ?? 12,
      minPrice: params?.minPrice,
      maxPrice: params?.maxPrice,
      inStock: params?.inStock,
      featured: params?.featured,
    },
  });
  return data;
}

export async function fetchProduct(id: string | number) {
  const { data } = await api.get<ApiProduct>(`/api/products/${id}`);
  return data;
}

export async function fetchAdminProducts(params?: {
  search?: string;
  category?: string;
  active?: boolean | 'all';
  sort?: string;
  page?: number;
  size?: number;
}) {
  const { data } = await api.get<{
    products: ApiAdminProduct[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  }>('/api/admin/products', {
    params: {
      search: params?.search || undefined,
      category: params?.category || undefined,
      active:
        params?.active === 'all' || typeof params?.active === 'undefined'
          ? undefined
          : params.active,
      sort: params?.sort || 'newest',
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  });
  return {
    ...data,
    products: data.products.map(toAdminProduct),
  };
}

export async function fetchAdminProduct(id: string | number) {
  const { data } = await api.get<ApiAdminProduct>(`/api/admin/products/${id}`);
  return toAdminProduct(data);
}

export async function createAdminProduct(payload: AdminProductPayload) {
  const { data } = await api.post<ApiAdminProduct>('/api/admin/products', payload, {
    headers: {
      'X-Idempotency-Key': getIdempotencyKey('admin-product'),
    },
  });
  return toAdminProduct(data);
}

export async function updateAdminProduct(
  id: string | number,
  payload: AdminProductPayload
) {
  const { data } = await api.put<ApiAdminProduct>(`/api/admin/products/${id}`, payload);
  return toAdminProduct(data);
}

export async function deleteAdminProduct(id: string | number) {
  const { data } = await api.delete<ApiAdminProduct>(`/api/admin/products/${id}`);
  return toAdminProduct(data);
}

export async function fetchAdminCategories(params?: { active?: boolean | 'all' }) {
  const { data } = await api.get<ApiAdminCategory[]>('/api/admin/categories', {
    params: {
      active:
        params?.active === 'all' || typeof params?.active === 'undefined'
          ? undefined
          : params.active,
    },
  });
  return data.map(toAdminCategory);
}

export async function createAdminCategory(payload: AdminCategoryPayload) {
  const { data } = await api.post<ApiAdminCategory>('/api/admin/categories', payload, {
    headers: {
      'X-Idempotency-Key': getIdempotencyKey('admin-category'),
    },
  });
  return toAdminCategory(data);
}

export async function updateAdminCategory(
  id: string | number,
  payload: AdminCategoryPayload
) {
  const { data } = await api.put<ApiAdminCategory>(`/api/admin/categories/${id}`, payload);
  return toAdminCategory(data);
}

export async function deleteAdminCategory(id: string | number) {
  const { data } = await api.delete<ApiAdminCategory>(`/api/admin/categories/${id}`);
  return toAdminCategory(data);
}

export async function fetchShippingMethods() {
  const { data } = await api.get<ApiShippingMethod[]>('/api/checkout/shipping-methods');
  return data.map(toShippingMethod);
}

export async function quoteCheckout(payload: CheckoutQuotePayload) {
  const { data } = await api.post<{
    subtotal: number | string;
    shippingFee: number | string;
    discountAmount: number | string;
    total: number | string;
    couponCode?: string | null;
    shippingMethod: ApiShippingMethod;
    shippingMethods: ApiShippingMethod[];
  }>('/api/checkout/quote', payload);
  return {
    subtotal: Number(data.subtotal),
    shippingFee: Number(data.shippingFee),
    discountAmount: Number(data.discountAmount),
    total: Number(data.total),
    couponCode: data.couponCode ?? null,
    shippingMethod: toShippingMethod(data.shippingMethod),
    shippingMethods: data.shippingMethods.map(toShippingMethod),
  };
}

export async function fetchUserAddresses() {
  const { data } = await api.get<UserAddress[]>('/api/users/addresses');
  return data;
}

export async function createUserAddress(payload: UserAddressPayload) {
  const { data } = await api.post<UserAddress>('/api/users/addresses', payload);
  return data;
}

export async function updateUserAddress(id: string | number, payload: UserAddressPayload) {
  const { data } = await api.put<UserAddress>(`/api/users/addresses/${id}`, payload);
  return data;
}

export async function setDefaultUserAddress(id: string | number) {
  const { data } = await api.post<UserAddress>(`/api/users/addresses/${id}/default`);
  return data;
}

export async function deleteUserAddress(id: string | number) {
  await api.delete(`/api/users/addresses/${id}`);
}

export async function fetchAdminShippingMethods() {
  const { data } = await api.get<ApiShippingMethod[]>('/api/admin/shipping-methods');
  return data.map(toShippingMethod);
}

export async function createAdminShippingMethod(payload: ShippingMethodPayload) {
  const { data } = await api.post<ApiShippingMethod>(
    '/api/admin/shipping-methods',
    payload
  );
  return toShippingMethod(data);
}

export async function updateAdminShippingMethod(id: string | number, payload: ShippingMethodPayload) {
  const { data } = await api.put<ApiShippingMethod>(
    `/api/admin/shipping-methods/${id}`,
    payload
  );
  return toShippingMethod(data);
}

export async function deleteAdminShippingMethod(id: string | number) {
  const { data } = await api.delete<ApiShippingMethod>(`/api/admin/shipping-methods/${id}`);
  return toShippingMethod(data);
}

export async function fetchAdminCoupons() {
  const { data } = await api.get<ApiCoupon[]>('/api/admin/coupons');
  return data.map(toCoupon);
}

export async function createAdminCoupon(payload: CouponPayload) {
  const { data } = await api.post<ApiCoupon>('/api/admin/coupons', payload);
  return toCoupon(data);
}

export async function updateAdminCoupon(id: string | number, payload: CouponPayload) {
  const { data } = await api.put<ApiCoupon>(`/api/admin/coupons/${id}`, payload);
  return toCoupon(data);
}

export async function deleteAdminCoupon(id: string | number) {
  const { data } = await api.delete<ApiCoupon>(`/api/admin/coupons/${id}`);
  return toCoupon(data);
}

export async function fetchProductReviews(productId: string | number, page = 0, size = 5) {
  const { data } = await api.get<ProductReviewPageResponse>(
    `/api/products/${productId}/reviews`,
    {
      params: { page, size },
    }
  );
  return data;
}

export async function createProductReview(
  productId: string | number,
  payload: { rating?: number | null; content: string }
) {
  const { data } = await api.post<ProductReview>(
    `/api/products/${productId}/reviews`,
    payload
  );
  return data;
}

export async function updateProductReview(
  reviewId: string,
  payload: { rating?: number | null; content: string }
) {
  const { data } = await api.put<ProductReview>(`/api/reviews/${reviewId}`, payload);
  return data;
}

export async function deleteProductReview(reviewId: string) {
  await api.delete(`/api/reviews/${reviewId}`);
}

function getIdempotencyKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function createOrder(payload: CheckoutPayload) {
  const { data } = await api.post<ApiOrderResponse>('/api/orders', payload, {
    headers: {
      'X-Idempotency-Key': getIdempotencyKey('order'),
    },
  });
  const order = toOrder(data);
  if (order.guestAccessToken) {
    saveGuestOrderToken(order.id, order.guestAccessToken);
  }
  return order;
}

export async function fetchPaymentGateways() {
  const { data } = await api.get<PaymentGatewayAvailability[]>('/api/payments/gateways');
  return data;
}

export async function createPayment(orderId: string, gateway: 'vnpay' | 'momo') {
  const { data } = await api.post<CreatePaymentResponse>(
    '/api/payments',
    {
      orderId,
      gateway,
    },
    {
      headers: {
        'X-Idempotency-Key': getIdempotencyKey('payment'),
      },
    }
  );
  return data;
}

export async function fetchOrder(orderId: string) {
  const guestToken = getGuestOrderToken(orderId);
  const { data } = await api.get<ApiOrderResponse>(`/api/orders/${orderId}`, {
    headers: guestToken ? { 'X-Guest-Order-Token': guestToken } : undefined,
  });
  return toOrder(data);
}

export async function fetchMyOrders(page = 0, size = 10) {
  const { data } = await api.get<ApiOrderPageResponse>('/api/orders/my', {
    params: { page, size },
  });
  return {
    orders: data.orders.map(toOrder),
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    page: data.page,
    size: data.size,
  };
}

export async function fetchAdminOrders(params?: {
  status?: OrderStatus | 'all';
  paymentMethod?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  size?: number;
}) {
  const { data } = await api.get<ApiOrderPageResponse>('/api/admin/orders', {
    params: {
      status: params?.status && params.status !== 'all' ? params.status : undefined,
      paymentMethod: params?.paymentMethod || undefined,
      createdFrom: params?.createdFrom || undefined,
      createdTo: params?.createdTo || undefined,
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  });
  return {
    orders: data.orders.map(toOrder),
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    page: data.page,
    size: data.size,
  };
}

export async function transitionAdminOrder(
  orderId: string,
  status: OrderStatus,
  reason?: string
) {
  const { data } = await api.post<ApiOrderResponse>(
    `/api/admin/orders/${orderId}/transitions`,
    {
      status,
      reason,
    }
  );
  return toOrder(data);
}

function toOrder(order: ApiOrderResponse): Order {
  const subtotal = Number(order.subtotal ?? order.total);
  const shippingFee = Number(order.shippingFee ?? 0);
  const discountAmount = Number(order.discountAmount ?? 0);
  return {
    id: order.id,
    date: order.date,
    subtotal,
    shippingFee,
    discountAmount,
    total: Number(order.total),
    status: normalizeOrderStatus(order.status || ''),
    customer: order.customer,
    shippingMethod: order.shippingMethod
      ? {
          code: order.shippingMethod.code,
          name: order.shippingMethod.name,
          fee: Number(order.shippingMethod.fee),
        }
      : null,
    couponCode: order.couponCode ?? null,
    paymentMethod: order.paymentMethod,
    paymentStatus: normalizePaymentStatus(order.paymentStatus),
    reservationExpiresAt: order.reservationExpiresAt ?? null,
    refundAmount: order.refundAmount == null ? null : Number(order.refundAmount),
    refundedAt: order.refundedAt ?? null,
    guestAccessToken: order.guestAccessToken ?? null,
    events: (order.events || []).map(toOrderEvent),
    items: order.items.map((item) => ({
      id: item.productId,
      cartKey: item.variantId ? `${item.productId}:${item.variantId}` : String(item.productId),
      variantId: item.variantId ?? null,
      variantName: item.variantName ?? null,
      sku: item.sku ?? null,
      name: item.name,
      category: item.category,
      price: Number(item.price),
      unit: item.unit,
      image: item.image,
      description: item.description,
      quantity: item.quantity,
    })),
  };
}

function saveGuestOrderToken(orderId: string, token: string) {
  if (typeof window === 'undefined') return;
  try {
    const existing = window.localStorage.getItem('guestOrderTokens');
    const tokens = existing ? JSON.parse(existing) as Record<string, string> : {};
    tokens[orderId] = token;
    window.localStorage.setItem('guestOrderTokens', JSON.stringify(tokens));
  } catch {
    window.localStorage.setItem('guestOrderTokens', JSON.stringify({ [orderId]: token }));
  }
}

export function getGuestOrderToken(orderId: string) {
  if (typeof window === 'undefined') return null;
  const existing = window.localStorage.getItem('guestOrderTokens');
  if (!existing) return null;
  try {
    const tokens = JSON.parse(existing) as Record<string, string>;
    return tokens[orderId] || null;
  } catch {
    return null;
  }
}

function toOrderEvent(event: NonNullable<ApiOrderResponse['events']>[number]): OrderEvent {
  return {
    actorType: event.actorType,
    actorId: event.actorId,
    fromStatus: event.fromStatus ? normalizeOrderStatus(event.fromStatus) : null,
    toStatus: normalizeOrderStatus(event.toStatus),
    reason: event.reason,
    metadata: event.metadata,
    createdAt: event.createdAt,
  };
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<{ message?: string; errors?: string[] }>).response?.data;
    return data?.message || data?.errors?.join(', ') || error.message;
  }
  return 'Unexpected error';
}

export default api;
