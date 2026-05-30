import { describe, expect, it } from 'vitest';

import { getApiErrorMessage, toProduct } from '@/lib/api';

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

  it('returns fallback message for unknown errors', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('Unexpected error');
  });
});
