import { expect, test } from '@playwright/test';

test.describe('Home filters and listing', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/products/suggestions**', async (route) => {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'content-type, authorization',
      };
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: corsHeaders });
        return;
      }

      const requestUrl = new URL(route.request().url());
      const query = requestUrl.searchParams.get('q') || '';
      if (!query.trim()) {
        await route.fulfill({ headers: corsHeaders, json: [] });
        return;
      }

      await route.fulfill({
        headers: corsHeaders,
        json: [
          {
            type: 'category',
            label: 'Gốm Sứ',
            productId: null,
            categorySlug: 'gom-su',
            imageUrl: null,
            price: null,
          },
          {
            type: 'product',
            label: 'Bình Gốm Sứ Bát Tràng',
            productId: 1,
            categorySlug: 'gom-su',
            imageUrl:
              'https://images.unsplash.com/photo-1599833114852-724119b27cd0?auto=format&fit=crop&w=1200&q=80',
            price: '350000.00',
          },
        ],
      });
    });
  });

  test('desktop sidebar filter and toolbar render correctly', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'desktop-only test');

    await page.goto('/vi');

    await expect(
      page.getByRole('heading', { name: /Sản Phẩm Thủ Công Mỹ Nghệ/i })
    ).toBeVisible();
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
      const input = page.getByPlaceholder(/Tìm kiếm sản phẩm/i).first();
      await input.fill('gom');
      await expect(input).toHaveValue('gom');
      return;
    }

    const categoryButton = page
      .getByRole('button', { name: /Gốm Sứ/i })
      .first();
    await categoryButton.click();

    await expect
      .poll(() => new URL(page.url()).searchParams.get('category'))
      .toBe('gom-su');
  });

  test('desktop autocomplete applies category suggestion with keyboard', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'desktop-only test');

    await page.goto('/vi');

    const input = page.locator('aside input[type="search"]').first();
    await input.fill('gom');
    await expect(
      page.getByRole('option', { name: /Gốm Sứ/i }).first()
    ).toBeVisible();

    await input.press('ArrowDown');
    await input.press('Enter');

    await expect
      .poll(() => new URL(page.url()).searchParams.get('category'))
      .toBe('gom-su');
  });

  test('mobile autocomplete submits query from search row', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'mobile-only test');

    await page.goto('/vi');

    const input = page.getByPlaceholder(/Tìm kiếm sản phẩm/i).first();
    await input.fill('gom su');
    await expect(
      page.getByRole('option', { name: /Tìm "gom su"/i })
    ).toBeVisible();

    await input.press('Enter');

    await expect
      .poll(() => new URL(page.url()).searchParams.get('q'))
      .toBe('gom su');
  });

  test('product detail shows recently viewed products', async ({ page }) => {
    await page.goto('/vi/product/1');
    await expect(
      page.getByRole('heading', { name: /Bình Gốm Sứ/i })
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const raw = window.localStorage.getItem('godaz_recently_viewed_v1');
          return raw ? JSON.parse(raw).length : 0;
        })
      )
      .toBeGreaterThan(0);

    await page.goto('/vi/product/2');
    await expect(
      page.getByRole('heading', { name: /Đã xem gần đây/i })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Bình Gốm Sứ/i }).first()
    ).toBeVisible();
  });
});
