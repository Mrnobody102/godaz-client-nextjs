import { expect, test } from '@playwright/test';

test.describe('Home filters and listing', () => {
  test('desktop sidebar filter and toolbar render correctly', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop-only test');

    await page.goto('/vi');

    await expect(page.getByRole('heading', { name: /Sản Phẩm Thủ Công Mỹ Nghệ/i })).toBeVisible();
    await expect(page.locator('aside').first()).toBeVisible();

    const sortSelect = page.locator('select').first();
    await expect(sortSelect).toBeVisible();
  });

  test('mobile filter sheet opens and closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only test');

    await page.goto('/vi');
    await page.getByRole('button', { name: /Bộ lọc/i }).click();

    await expect(page.getByRole('heading', { name: /Bộ lọc/i })).toBeVisible();

    await page.getByRole('button', { name: /Áp dụng/i }).click();
    await expect(page.getByRole('heading', { name: /Bộ lọc/i })).toBeHidden();
  });

  test('filter updates URL params', async ({ page, isMobile }) => {
    await page.goto('/vi');

    if (isMobile) {
      const input = page.getByPlaceholder(/Tìm kiếm sản phẩm/i);
      await input.fill('gom');
      await expect(input).toHaveValue('gom');
      await expect
        .poll(() => new URL(page.url()).searchParams.get('q'))
        .toBe('gom');
      return;
    }

    const categoryButton = page.getByRole('button', { name: /Gốm Sứ/i }).first();
    await categoryButton.click();

    await expect
      .poll(() => new URL(page.url()).searchParams.get('category'))
      .toBe('gom-su');
  });
});
