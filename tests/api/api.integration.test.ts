import { describe, expect, it } from 'vitest';

const runIntegration = process.env.RUN_INTEGRATION === '1';
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

describe.skipIf(!runIntegration)('api integration', () => {
  it('fetches products endpoint', async () => {
    const res = await fetch(`${baseUrl}/api/products?page=0&size=5`);
    expect(res.ok).toBe(true);

    const data = await res.json();
    expect(Array.isArray(data.products)).toBe(true);
    expect(typeof data.totalPages).toBe('number');
  });

  it('fetches payment gateways endpoint', async () => {
    const res = await fetch(`${baseUrl}/api/payments/gateways`);
    expect(res.ok).toBe(true);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
