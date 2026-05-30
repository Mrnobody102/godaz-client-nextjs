import axios, { AxiosError, AxiosInstance } from 'axios';
import { Product } from '@/lib/constants/products';
import { Order } from '@/stores/orderStore';

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

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
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
  price: number | string;
  unit: string;
  image: string;
  description: string;
  stock: number;
  featured: boolean;
}

export interface ProductSearchResponse {
  products: ApiProduct[];
  categories: ApiCategory[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface CheckoutPayload {
  items: Array<{
    productId: number;
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
  name: string;
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
  total: number | string;
  status: Order['status'];
  customer: Order['customer'];
  paymentMethod: string;
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
    price: Number(product.price),
    unit: product.unit,
    image: product.image,
    description: product.description,
    stock: product.stock,
    featured: product.featured,
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
  return toOrder(data);
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

function toOrder(order: ApiOrderResponse): Order {
  return {
    id: order.id,
    date: order.date,
    total: Number(order.total),
    status: (order.status || '').toLowerCase() as any,
    customer: order.customer,
    paymentMethod: order.paymentMethod,
    items: order.items.map((item) => ({
      id: item.productId,
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

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = (error as AxiosError<{ message?: string; errors?: string[] }>).response?.data;
    return data?.message || data?.errors?.join(', ') || error.message;
  }
  return 'Unexpected error';
}

export default api;
