import { expect, test } from '@playwright/test';

const pendingOrder = {
  id: 'order-pending',
  date: '2026-06-02T00:00:00Z',
  items: [],
  subtotal: '200000',
  shippingFee: '0',
  discountAmount: '0',
  total: '200000',
  status: 'pending_payment',
  customer: { name: 'Buyer', phone: '0901234567', address: '123 Test', email: 'b@example.com', note: null },
  paymentMethod: 'vnpay',
  paymentStatus: 'pending',
  reservationExpiresAt: '2026-06-02T00:15:00Z',
  events: [],
};

test.describe('Checkout success recovery branching', () => {
  test('renders pending state for a pending_payment order', async ({ page }) => {
    await page.route('**/api/orders/order-pending', async (route) => {
      await route.fulfill({ json: pendingOrder });
    });

    await page.goto('/en/checkout/success?orderId=order-pending&paymentStatus=pending&gateway=vnpay');

    await expect(page.getByRole('heading', { name: /Payment pending/i })).toBeVisible();
    await expect(page.getByText(/waiting for payment confirmation/i)).toBeVisible();
    // A pending_payment order with a valid gateway can retry payment.
    await expect(page.getByRole('button', { name: /Retry payment/i })).toBeVisible();
  });

  test('renders failed state and offers cart restore', async ({ page }) => {
    await page.route('**/api/orders/order-failed', async (route) => {
      await route.fulfill({ json: { ...pendingOrder, id: 'order-failed', status: 'cancelled' } });
    });

    await page.goto('/en/checkout/success?orderId=order-failed&paymentStatus=failed&gateway=vnpay');

    await expect(page.getByRole('button', { name: /Restore cart/i })).toBeVisible();
  });

  test('renders success state for a paid order', async ({ page }) => {
    await page.route('**/api/orders/order-paid', async (route) => {
      await route.fulfill({ json: { ...pendingOrder, id: 'order-paid', status: 'paid', paymentStatus: 'captured' } });
    });

    await page.goto('/en/checkout/success?orderId=order-paid&paymentStatus=captured&gateway=vnpay');

    await expect(page.getByRole('link', { name: /Continue shopping/i })).toBeVisible();
  });
});
