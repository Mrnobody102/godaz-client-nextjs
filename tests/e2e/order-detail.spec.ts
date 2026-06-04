import { expect, test } from '@playwright/test';

test.describe('Customer order detail', () => {
  test('renders cost breakdown and timeline for a guest order', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'guestOrderTokens',
        JSON.stringify({ 'guest-order': 'guest-token' })
      );
    });

    await page.route('**/api/orders/guest-order', async (route) => {
      await route.fulfill({
        json: {
          id: 'guest-order',
          date: '2026-06-02T00:00:00Z',
          items: [
            {
              productId: 1,
              name: 'Mock Bowl',
              category: 'Gom Su',
              price: '200000',
              unit: 'item',
              image: 'https://example.com/bowl.jpg',
              description: 'Mock product',
              quantity: 1,
            },
          ],
          subtotal: '200000',
          shippingFee: '30000',
          discountAmount: '20000',
          total: '210000',
          status: 'processing',
          customer: {
            name: 'Guest Buyer',
            phone: '0901234567',
            address: '123 Test Street, Ha Noi',
            email: 'guest@example.com',
            note: 'No note',
          },
          shippingMethod: { code: 'STANDARD', name: 'Standard delivery', fee: '30000' },
          couponCode: 'SAVE10',
          paymentMethod: 'cod',
          paymentStatus: null,
          reservationExpiresAt: null,
          guestAccessToken: null,
          events: [
            {
              actorType: 'customer',
              actorId: 'guest',
              fromStatus: null,
              toStatus: 'processing',
              reason: 'order_created_cod_stock_committed',
              metadata: null,
              createdAt: '2026-06-02T00:00:00Z',
            },
          ],
        },
      });
    });

    await page.goto('/vi/profile/orders/guest-order');

    await expect(page.getByRole('heading', { name: /guest-order/ })).toBeVisible();
    await expect(page.getByText('Standard delivery')).toBeVisible();
    await expect(page.getByText('SAVE10')).toBeVisible();
    await expect(page.getByText('Timeline')).toBeVisible();
  });
});
