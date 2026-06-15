import type { Product } from '@/lib/constants/products';

const RECENTLY_VIEWED_KEY = 'godaz_recently_viewed_v1';
const MAX_RECENTLY_VIEWED = 8;

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function toStoredProduct(product: Product): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    categorySlug: product.categorySlug,
    sku: product.sku ?? null,
    brand: product.brand ?? null,
    price: product.price,
    unit: product.unit,
    image: product.image,
    description: product.description,
    stock: product.stock,
    featured: product.featured,
  };
}

function isStoredProduct(value: unknown): value is Product {
  if (!value || typeof value !== 'object') return false;
  const product = value as Partial<Product>;
  return Boolean(product.id && product.name && product.image && product.unit);
}

export function getRecentlyViewedProducts() {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter(isStoredProduct).slice(0, MAX_RECENTLY_VIEWED)
      : [];
  } catch {
    return [];
  }
}

export function saveRecentlyViewedProduct(product: Product) {
  if (!canUseStorage()) return getRecentlyViewedProducts();
  const storedProduct = toStoredProduct(product);
  const next = [
    storedProduct,
    ...getRecentlyViewedProducts().filter(
      (item) => String(item.id) !== String(storedProduct.id)
    ),
  ].slice(0, MAX_RECENTLY_VIEWED);
  window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
  return next;
}
