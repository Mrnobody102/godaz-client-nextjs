import { expect, test } from '@playwright/test';

test.describe('Auth session hardening', () => {
  test('review write requires a real token, not only a stored user', async ({ page }) => {
    let reviewPostCount = 0;

    await page.addInitScript(() => {
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'buyer',
          name: 'Buyer',
          email: 'buyer@example.com',
          role: 'USER',
        })
      );
    });

    await page.route('**/api/products/1/reviews**', async (route) => {
      if (route.request().method() === 'POST') {
        reviewPostCount += 1;
        await route.fulfill({ status: 401, json: { message: 'missing token' } });
        return;
      }

      await route.fulfill({
        json: {
          reviews: [],
          totalElements: 0,
          totalPages: 0,
          page: 0,
          size: 5,
        },
      });
    });

    await page.goto('/vi/product/1');

    await page.getByRole('button', { name: 'Gửi bình luận' }).click();

    await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem('user')))
      .toBeNull();
    expect(reviewPostCount).toBe(0);
  });
});
