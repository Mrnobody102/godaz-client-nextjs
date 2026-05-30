import { expect, test } from '@playwright/test';

test.describe('Home filters and listing', () => {
  test('desktop sidebar filter and toolbar render correctly', async ({ page }) => {
    await page.goto('/vi');

    await expect(page.getByRole('heading', { name: /Sản Phẩm Thủ Công Mỹ Nghệ/i })).toBeVisible();
    await expect(page.getByRole('complementary')).toBeVisible();

    const sortSelect = page.locator('select').first();
    await expect(sortSelect).toBeVisible();

    await expect(page).toHaveScreenshot('home-desktop.png', {
      fullPage: true,
    });
  });

  test('mobile filter sheet opens and closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only test');

    await page.goto('/vi');
    await page.getByRole('button', { name: /Bộ lọc/i }).click();

    await expect(page.getByRole('heading', { name: /Bộ lọc/i })).toBeVisible();
    await expect(page).toHaveScreenshot('home-mobile-filter-sheet.png', {
      fullPage: true,
    });

    await page.getByRole('button', { name: /Áp dụng/i }).click();
    await expect(page.getByRole('heading', { name: /Bộ lọc/i })).not.toBeVisible();
  });

  test('filter updates URL params', async ({ page }) => {
    await page.goto('/vi');

    await page.getByPlaceholder(/Tìm kiếm sản phẩm/i).fill('Gốm');
    await page.waitForTimeout(400);

    await expect(page).toHaveURL(/q=G%E1%BB%91m|q=Gốm/);
  });
});
