import { expect, test } from '@playwright/test';

const dashboardResponse = {
  from: '2026-01-01T00:00:00Z',
  to: '2026-01-30T23:59:59Z',
  kpis: {
    grossRevenue: '300000.00',
    netRevenue: '250000.00',
    orderCount: 4,
    averageOrderValue: '75000.00',
    pendingPaymentCount: 1,
    refundCount: 1,
  },
  orderStatusBreakdown: [
    { key: 'paid', count: 1 },
    { key: 'pending_payment', count: 1 },
  ],
  paymentStatusBreakdown: [
    { key: 'captured', count: 1 },
    { key: 'pending', count: 1 },
  ],
  paymentMethodBreakdown: [
    { key: 'vnpay', count: 2 },
    { key: 'momo', count: 1 },
  ],
  timeSeries: [
    { date: '2026-01-01', orders: 1, grossRevenue: '100000.00', netRevenue: '100000.00' },
    { date: '2026-01-02', orders: 2, grossRevenue: '200000.00', netRevenue: '150000.00' },
  ],
  lowStockItems: [
    {
      type: 'product',
      productId: 10,
      variantId: null,
      name: 'Low Stock Bowl',
      sku: 'LOW-BOWL',
      category: 'Gom Su',
      stock: 2,
    },
  ],
  pendingPaymentOrders: [
    {
      id: 'pending-order-1',
      date: '2026-01-02T10:00:00Z',
      customerName: 'Pending Buyer',
      total: '90000.00',
      status: 'pending_payment',
      paymentMethod: 'momo',
      paymentStatus: 'pending',
    },
  ],
  recentOrders: [
    {
      id: 'recent-order-1',
      date: '2026-01-03T10:00:00Z',
      customerName: 'Recent Buyer',
      total: '120000.00',
      status: 'paid',
      paymentMethod: 'vnpay',
      paymentStatus: 'captured',
    },
  ],
};

const adminOrderResponse = {
  orders: [
    {
      id: 'admin-order-1',
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
      discountAmount: '0',
      total: '230000',
      status: 'paid',
      customer: {
        name: 'Admin Buyer',
        phone: '0901234567',
        address: '123 Test Street, Ha Noi',
        email: 'buyer@example.com',
      },
      shippingMethod: { code: 'STANDARD', name: 'Standard delivery', fee: '30000' },
      couponCode: null,
      paymentMethod: 'vnpay',
      paymentStatus: 'captured',
      reservationExpiresAt: null,
      guestAccessToken: null,
      events: [
        {
          actorType: 'system',
          actorId: null,
          fromStatus: null,
          toStatus: 'paid',
          reason: 'payment_captured',
          metadata: null,
          createdAt: '2026-06-02T00:00:00Z',
        },
      ],
    },
  ],
  totalElements: 1,
  totalPages: 1,
  page: 0,
  size: 20,
};

async function seedAdminSession(page: import('@playwright/test').Page) {
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
}

test.describe('Admin dashboard analytics', () => {
  test('renders dashboard KPIs, chart, and queues for admin', async ({ page }) => {
    await seedAdminSession(page);

    await page.route('**/api/admin/dashboard**', async (route) => {
      await route.fulfill({ json: dashboardResponse });
    });

    await page.goto('/en/admin');

    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
    await expect(page.getByTestId('dashboard-kpis')).toContainText('Gross revenue');
    await expect(page.getByTestId('dashboard-revenue-chart')).toBeVisible();
    await expect(page.getByText('Payment health')).toBeVisible();
    await expect(page.getByText('Pending Buyer')).toBeVisible();
    await expect(page.getByText('Low Stock Bowl')).toBeVisible();
    await expect(page.getByText('Recent Buyer')).toBeVisible();
  });

  test('shows access denied for non-admin users', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          id: 'user',
          name: 'Buyer',
          email: 'buyer@example.com',
          role: 'USER',
        })
      );
      window.localStorage.setItem('token', 'fake-user-token');
    });

    await page.goto('/en/admin');

    await expect(page.getByRole('heading', { name: 'Admin access required' })).toBeVisible();
  });

  test('clears expired admin session after dashboard 401', async ({ page }) => {
    await seedAdminSession(page);

    await page.route('**/api/admin/dashboard**', async (route) => {
      await route.fulfill({ status: 401, json: { message: 'expired' } });
    });

    await page.goto('/en/admin');

    await expect(page.getByRole('heading', { name: 'Admin access required' })).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => ({
          user: window.localStorage.getItem('user'),
          token: window.localStorage.getItem('token'),
        }))
      )
      .toEqual({ user: null, token: null });
  });

  test('rejects stale localStorage admin user without a token', async ({ page }) => {
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
    });

    await page.goto('/en/admin');

    await expect(page.getByRole('heading', { name: 'Admin access required' })).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem('user')))
      .toBeNull();
  });

  for (const path of ['/admin', '/vi/admin']) {
    test(`smoke renders admin dashboard at ${path}`, async ({ page }) => {
      await seedAdminSession(page);
      await page.route('**/api/admin/dashboard**', async (route) => {
        await route.fulfill({ json: dashboardResponse });
      });

      await page.goto(path);

      await expect(page.getByRole('heading', { name: /Admin Dashboard|Bảng điều khiển admin/ })).toBeVisible();
      await expect(page.getByTestId('dashboard-kpis')).toBeVisible();
    });
  }

  for (const path of ['/admin/orders', '/vi/admin/orders']) {
    test(`smoke renders admin orders at ${path}`, async ({ page }) => {
      await seedAdminSession(page);
      await page.route('**/api/admin/orders**', async (route) => {
        await route.fulfill({ json: adminOrderResponse });
      });

      await page.goto(path);

      await expect(page.getByRole('heading', { name: /Order Operations|Vận hành đơn hàng/ })).toBeVisible();
      await expect(page.getByText('Admin Buyer')).toBeVisible();
    });
  }
});
