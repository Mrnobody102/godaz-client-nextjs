import { expect, test } from '@playwright/test';

interface MockProduct {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  category: string;
  categorySlug: string;
  categoryActive: boolean;
  price: string;
  unit: string;
  imageUrl: string | null;
  description: string | null;
  stock: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

test.describe('Admin catalog operations', () => {
  test('renders product admin and creates a product with mocked APIs', async ({ page }) => {
    const categories = [
      {
        id: 1,
        name: 'Gom Su',
        slug: 'gom-su',
        description: 'Ceramics',
        imageUrl: null,
        active: true,
        createdAt: '2026-06-01T00:00:00Z',
        updatedAt: '2026-06-01T00:00:00Z',
      },
    ];
    const products: MockProduct[] = [
      {
        id: 10,
        name: 'Seed Bowl',
        slug: 'seed-bowl',
        categoryId: 1,
        category: 'Gom Su',
        categorySlug: 'gom-su',
        categoryActive: true,
        price: '120000',
        unit: 'item',
        imageUrl: null,
        description: 'Seed product',
        stock: 4,
        featured: false,
        active: true,
        createdAt: '2026-06-01T00:00:00Z',
        updatedAt: '2026-06-01T00:00:00Z',
      },
    ];

    await page.addInitScript(() => {
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'admin',
          name: 'Admin',
          email: 'admin@example.com',
          role: 'ADMIN',
        })
      );
      window.localStorage.setItem('token', 'fake-admin-token');
    });

    await page.route('**/api/admin/categories**', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({ json: categories });
        return;
      }
      await route.fulfill({ status: 200, json: categories[0] });
    });

    await page.route('**/api/admin/products**', async (route) => {
      const request = route.request();
      if (request.method() === 'GET') {
        await route.fulfill({
          json: {
            products,
            totalElements: products.length,
            totalPages: 1,
            page: 0,
            size: 20,
          },
        });
        return;
      }

      if (request.method() === 'POST') {
        const body = request.postDataJSON();
        const next = {
          id: 11,
          name: body.name,
          slug: body.slug || 'mock-vase',
          categoryId: body.categoryId,
          category: 'Gom Su',
          categorySlug: 'gom-su',
          categoryActive: true,
          price: String(body.price),
          unit: body.unit,
          imageUrl: body.imageUrl || null,
          description: body.description || null,
          stock: body.stock,
          featured: body.featured,
          active: body.active,
          createdAt: '2026-06-01T00:00:00Z',
          updatedAt: '2026-06-01T00:00:00Z',
        };
        products.push(next);
        await route.fulfill({ status: 201, json: next });
        return;
      }

      await route.fulfill({ status: 200, json: products[0] });
    });

    await page.goto('/vi/admin/products');

    await expect(page.getByRole('heading', { name: 'Catalog Operations' })).toBeVisible();
    await expect(page.getByText('Seed Bowl')).toBeVisible();

    await page.getByPlaceholder('Name').first().fill('Mock Vase');
    await page.getByPlaceholder('Price').fill('250000');
    await page.getByPlaceholder('Stock').fill('9');
    await page.getByRole('button', { name: 'Create product' }).click();

    await expect(page.getByText('Mock Vase')).toBeVisible();
  });
});
