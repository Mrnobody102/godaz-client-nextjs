import { expect, test } from '@playwright/test';

test.describe('Checkout flow resilience', () => {
  test('shows checkout page and disables submit when cart is empty', async ({ page }) => {
    await page.goto('/vi/checkout');

    await expect(page.getByRole('heading', { name: /^Thanh Toán$/i })).toBeVisible();

    const submitButton = page.getByRole('button', { name: /Đặt Hàng|Place Order/i });
    await expect(submitButton).toBeDisabled();
  });

  test('shows payment options section and order summary', async ({ page }) => {
    await page.goto('/vi/checkout');

    await expect(page.getByText(/Phương thức thanh toán|Payment Method/i)).toBeVisible();
    await expect(page.getByText(/Tóm tắt đơn hàng|Order Summary/i)).toBeVisible();
  });
});
