import { expect, test } from '@playwright/test';

test.describe('Checkout flow resilience', () => {
  test('shows checkout page and disables submit when cart is empty', async ({ page }) => {
    await page.goto('/vi/checkout');

    await expect(page.getByTestId('checkout-title')).toBeVisible();
    await expect(page.getByTestId('checkout-shipping-section')).toBeVisible();
    await expect(page.getByTestId('checkout-submit')).toBeDisabled();
  });

  test('shows payment options section and order summary', async ({ page }) => {
    await page.goto('/vi/checkout');

    await expect(page.getByTestId('checkout-payment-section')).toBeVisible();
    await expect(page.getByTestId('checkout-order-summary')).toBeVisible();
  });

  test('creates a guest COD order with shipping and coupon quote', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'godaz-cart-storage',
        JSON.stringify({
          state: {
            items: [
              {
                id: 1,
                name: 'Mock Bowl',
                category: 'Gom Su',
                categorySlug: 'gom-su',
                price: 200000,
                unit: 'item',
                image: 'https://example.com/bowl.jpg',
                description: 'Mock product',
                stock: 5,
                featured: false,
                quantity: 1,
              },
            ],
          },
          version: 0,
        })
      );
    });

    await page.route('https://provinces.open-api.vn/**', async (route) => {
      if (route.request().url().includes('/p/1?depth=2')) {
        await route.fulfill({
          json: { wards: [{ code: 101, name: 'Dich Vong' }] },
        });
        return;
      }
      await route.fulfill({ json: [{ code: 1, name: 'Ha Noi' }] });
    });

    await page.route('**/api/payments/gateways', async (route) => {
      await route.fulfill({
        json: [
          { gateway: 'vnpay', enabled: false },
          { gateway: 'momo', enabled: false },
        ],
      });
    });

    await page.route('**/api/checkout/shipping-methods', async (route) => {
      await route.fulfill({
        json: [
          {
            id: 1,
            code: 'STANDARD',
            name: 'Standard delivery',
            description: null,
            fee: '30000',
            freeThreshold: null,
            active: true,
            sortOrder: 10,
            createdAt: null,
            updatedAt: null,
          },
        ],
      });
    });

    await page.route('**/api/checkout/quote', async (route) => {
      const body = route.request().postDataJSON();
      const hasCoupon = body.couponCode === 'SAVE10';
      await route.fulfill({
        json: {
          subtotal: '200000',
          shippingFee: '30000',
          discountAmount: hasCoupon ? '20000' : '0',
          total: hasCoupon ? '210000' : '230000',
          couponCode: hasCoupon ? 'SAVE10' : null,
          shippingMethod: {
            id: 1,
            code: 'STANDARD',
            name: 'Standard delivery',
            description: null,
            fee: '30000',
            freeThreshold: null,
            active: true,
            sortOrder: 10,
            createdAt: null,
            updatedAt: null,
          },
          shippingMethods: [
            {
              id: 1,
              code: 'STANDARD',
              name: 'Standard delivery',
              description: null,
              fee: '30000',
              freeThreshold: null,
              active: true,
              sortOrder: 10,
              createdAt: null,
              updatedAt: null,
            },
          ],
        },
      });
    });

    const orderResponse = {
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
        address: '123 Test Street, Dich Vong, Cau Giay, Ha Noi',
        email: 'guest@example.com',
        note: null,
      },
      shippingMethod: { code: 'STANDARD', name: 'Standard delivery', fee: '30000' },
      couponCode: 'SAVE10',
      paymentMethod: 'cod',
      paymentStatus: null,
      reservationExpiresAt: null,
      events: [],
    };

    await page.route('**/api/orders', async (route) => {
      await route.fulfill({
        status: 201,
        json: { ...orderResponse, guestAccessToken: 'guest-token' },
      });
    });
    await page.route('**/api/orders/guest-order', async (route) => {
      await route.fulfill({ json: { ...orderResponse, guestAccessToken: null } });
    });

    await page.goto('/vi/checkout');

    const shipping = page.getByTestId('checkout-shipping-section');
    await shipping.locator('input[type="text"]').nth(0).fill('Guest Buyer');
    await shipping.locator('input[type="tel"]').fill('0901234567');
    await shipping.locator('input[type="email"]').fill('guest@example.com');
    await shipping.getByRole('combobox').nth(0).click();
    await page.getByRole('option', { name: 'Ha Noi' }).click();
    await shipping.locator('input[type="text"]').nth(1).fill('Cau Giay');
    await shipping.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Dich Vong' }).click();
    await shipping.locator('input[type="text"]').nth(2).fill('123 Test Street');

    await page.getByPlaceholder('SAVE10').fill('SAVE10');
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByText('210.000₫')).toBeVisible();

    await page.getByTestId('checkout-submit').click();
    await expect(page).toHaveURL(/checkout\/success/);
  });
});
