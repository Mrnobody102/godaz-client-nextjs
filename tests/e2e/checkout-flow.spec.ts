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
});
