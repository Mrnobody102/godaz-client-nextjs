import { describe, expect, it } from 'vitest';

import {
  getApiErrorMessage,
  toAdminDashboard,
  toAdminCategory,
  toAdminProduct,
  toCartProduct,
  toCoupon,
  toProduct,
  toShippingMethod,
} from '../../lib/api';
import { normalizeOrderStatus, normalizePaymentStatus } from '../../stores/orderStore';

describe('api transformers and errors', () => {
  it('maps api product to ui product correctly', () => {
    const mapped = toProduct({
      id: 1,
      name: 'Test',
      category: 'Gốm Sứ',
      categorySlug: 'gom-su',
      price: '123000',
      unit: 'cái',
      image: 'https://example.com/p.jpg',
      description: 'desc',
      stock: 10,
      featured: true,
    });

    expect(mapped.id).toBe(1);
    expect(mapped.price).toBe(123000);
    expect(mapped.featured).toBe(true);
  });

  it('normalizes numeric price when API sends number', () => {
    const mapped = toProduct({
      id: 2,
      name: 'Another',
      category: 'Gỗ',
      categorySlug: 'go',
      price: 98000,
      unit: 'cái',
      image: 'https://example.com/p2.jpg',
      description: 'desc 2',
      stock: 4,
      featured: false,
    });

    expect(mapped.price).toBe(98000);
    expect(typeof mapped.price).toBe('number');
  });

  it('maps admin product response with numeric price', () => {
    const mapped = toAdminProduct({
      id: 10,
      name: 'Admin Product',
      slug: 'admin-product',
      categoryId: 3,
      category: 'Gom Su',
      categorySlug: 'gom-su',
      categoryActive: true,
      price: '250000.00',
      unit: 'item',
      imageUrl: 'https://example.com/admin.jpg',
      description: 'admin desc',
      stock: 12,
      featured: false,
      active: true,
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
    });

    expect(mapped.price).toBe(250000);
    expect(mapped.categoryId).toBe(3);
    expect(mapped.active).toBe(true);
  });

  it('maps admin category response without dropping active state', () => {
    const mapped = toAdminCategory({
      id: 5,
      name: 'Inactive',
      slug: 'inactive',
      description: null,
      imageUrl: null,
      active: false,
      createdAt: null,
      updatedAt: null,
    });

    expect(mapped.active).toBe(false);
    expect(mapped.slug).toBe('inactive');
  });

  it('maps shipping and coupon monetary fields to numbers', () => {
    const shipping = toShippingMethod({
      id: 1,
      code: 'STANDARD',
      name: 'Standard',
      description: null,
      fee: '30000.00',
      freeThreshold: '1000000.00',
      active: true,
      sortOrder: 10,
      createdAt: null,
      updatedAt: null,
    });
    const coupon = toCoupon({
      id: 2,
      code: 'SAVE10',
      type: 'percent',
      value: '10.00',
      minSubtotal: '100000.00',
      maxDiscount: '50000.00',
      usageLimit: 100,
      usedCount: 3,
      startsAt: null,
      endsAt: null,
      active: true,
      createdAt: null,
      updatedAt: null,
    });

    expect(shipping.fee).toBe(30000);
    expect(shipping.freeThreshold).toBe(1000000);
    expect(coupon.value).toBe(10);
    expect(coupon.maxDiscount).toBe(50000);
  });

  it('maps server cart item to local cart product', () => {
    const mapped = toCartProduct({
      productId: 7,
      variantId: 9,
      name: 'Cart Bowl',
      variantName: 'Large',
      sku: 'BOWL-L',
      category: 'Gom Su',
      categorySlug: 'gom-su',
      price: '150000.00',
      unit: 'item',
      image: 'https://example.com/cart.jpg',
      description: 'cart desc',
      stock: 3,
      quantity: 2,
    });

    expect(mapped.id).toBe(7);
    expect(mapped.cartKey).toBe('7:9');
    expect(mapped.variantId).toBe(9);
    expect(mapped.price).toBe(150000);
    expect(mapped.quantity).toBe(2);
  });

  it('maps admin dashboard response with numeric fields and empty arrays', () => {
    const mapped = toAdminDashboard({
      from: '2026-01-01T00:00:00Z',
      to: '2026-01-30T23:59:59Z',
      kpis: {
        grossRevenue: '300000.00',
        netRevenue: 250000,
        orderCount: 4,
        averageOrderValue: '75000.00',
        pendingPaymentCount: 1,
        refundCount: 1,
      },
      orderStatusBreakdown: null,
      paymentStatusBreakdown: undefined,
      paymentMethodBreakdown: [{ key: 'vnpay', count: 2 }],
      timeSeries: [
        {
          date: '2026-01-02',
          orders: 2,
          grossRevenue: '100000.00',
          netRevenue: '90000.00',
        },
      ],
      lowStockItems: null,
      pendingPaymentOrders: [
        {
          id: 'order-1',
          date: '2026-01-02T00:00:00Z',
          customerName: 'Buyer',
          total: '120000.00',
          status: 'pending_payment',
          paymentMethod: 'momo',
          paymentStatus: undefined,
        },
      ],
      recentOrders: null,
    });

    expect(mapped.kpis.grossRevenue).toBe(300000);
    expect(mapped.kpis.netRevenue).toBe(250000);
    expect(mapped.orderStatusBreakdown).toEqual([]);
    expect(mapped.paymentStatusBreakdown).toEqual([]);
    expect(mapped.paymentMethodBreakdown[0].count).toBe(2);
    expect(mapped.timeSeries[0].netRevenue).toBe(90000);
    expect(mapped.lowStockItems).toEqual([]);
    expect(mapped.pendingPaymentOrders[0].total).toBe(120000);
    expect(mapped.pendingPaymentOrders[0].paymentStatus).toBeNull();
    expect(mapped.recentOrders).toEqual([]);
  });

  it('returns fallback message for unknown errors', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('Unexpected error');
  });

  it('normalizes production order and payment statuses', () => {
    expect(normalizeOrderStatus('PENDING_PAYMENT')).toBe('pending_payment');
    expect(normalizeOrderStatus('confirmed')).toBe('processing');
    expect(normalizePaymentStatus('CAPTURED')).toBe('captured');
    expect(normalizePaymentStatus('REFUNDED')).toBe('refunded');
    expect(normalizePaymentStatus('unknown')).toBeNull();
  });
});
