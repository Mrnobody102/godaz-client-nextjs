import { describe, expect, it } from 'vitest';

import {
  getApiErrorMessage,
  toAdminCategory,
  toAdminProduct,
  toProduct,
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

  it('returns fallback message for unknown errors', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('Unexpected error');
  });

  it('normalizes production order and payment statuses', () => {
    expect(normalizeOrderStatus('PENDING_PAYMENT')).toBe('pending_payment');
    expect(normalizeOrderStatus('confirmed')).toBe('processing');
    expect(normalizePaymentStatus('CAPTURED')).toBe('captured');
    expect(normalizePaymentStatus('unknown')).toBeNull();
  });
});
