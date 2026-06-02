'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  ArrowLeft,
  Edit,
  Eye,
  EyeOff,
  FolderTree,
  Package,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  X,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import { Link } from '@/i18n/routing';
import {
  AdminCategory,
  AdminCategoryPayload,
  AdminProduct,
  AdminProductPayload,
  createAdminCategory,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  getApiErrorMessage,
  updateAdminCategory,
  updateAdminProduct,
} from '@/lib/api';
import useCartStore from '@/stores/cartStore';
import { useAuth } from '@/contexts/AuthContext';

type ActiveFilter = 'all' | 'true' | 'false';

interface ProductFormState {
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: string;
  stock: string;
  unit: string;
  imageUrl: string;
  featured: boolean;
  active: boolean;
}

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  active: boolean;
}

const emptyProductForm = (categoryId = ''): ProductFormState => ({
  name: '',
  slug: '',
  categoryId,
  description: '',
  price: '',
  stock: '0',
  unit: 'item',
  imageUrl: '',
  featured: false,
  active: true,
});

const emptyCategoryForm = (): CategoryFormState => ({
  name: '',
  slug: '',
  description: '',
  imageUrl: '',
  active: true,
});

function activeParam(filter: ActiveFilter) {
  if (filter === 'all') return 'all';
  return filter === 'true';
}

function productToPayload(product: AdminProduct, active = product.active): AdminProductPayload {
  return {
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    description: product.description || '',
    price: product.price,
    stock: product.stock,
    unit: product.unit,
    imageUrl: product.imageUrl || '',
    featured: product.featured,
    active,
  };
}

function categoryToPayload(category: AdminCategory, active = category.active): AdminCategoryPayload {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    imageUrl: category.imageUrl || '',
    active,
  };
}

export default function AdminProductsClient() {
  const locale = useLocale();
  const { user } = useAuth();
  const { items: cartItems, updateQuantity, removeItem } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm());
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm());

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = user?.role === 'ADMIN';
  const currency = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    [locale]
  );

  const loadCategories = useCallback(async () => {
    if (!isAdmin) return;
    const nextCategories = await fetchAdminCategories({ active: 'all' });
    setCategories(nextCategories);
    setProductForm((current) =>
      current.categoryId || nextCategories.length === 0
        ? current
        : { ...current, categoryId: String(nextCategories[0].id) }
    );
  }, [isAdmin]);

  const loadProducts = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchAdminProducts({
        search,
        category: categoryFilter,
        active: activeParam(activeFilter),
        sort,
        page,
        size: 20,
      });
      setProducts(response.products);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, categoryFilter, isAdmin, page, search, sort]);

  useEffect(() => {
    loadCategories().catch((loadError) => setError(getApiErrorMessage(loadError)));
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm(emptyProductForm(categories[0] ? String(categories[0].id) : ''));
  };

  const editProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      slug: product.slug,
      categoryId: String(product.categoryId),
      description: product.description || '',
      price: String(product.price),
      stock: String(product.stock),
      unit: product.unit,
      imageUrl: product.imageUrl || '',
      featured: product.featured,
      active: product.active,
    });
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm());
  };

  const editCategory = (category: AdminCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      active: category.active,
    });
  };

  const productPayloadFromForm = (): AdminProductPayload | null => {
    const categoryId = Number(productForm.categoryId);
    const price = Number(productForm.price);
    const stock = Number(productForm.stock);

    if (!categoryId || !Number.isFinite(price) || !Number.isFinite(stock)) {
      setError('Please enter a valid category, price, and stock value.');
      return null;
    }

    return {
      name: productForm.name.trim(),
      slug: productForm.slug.trim(),
      categoryId,
      description: productForm.description.trim(),
      price,
      stock,
      unit: productForm.unit.trim(),
      imageUrl: productForm.imageUrl.trim(),
      featured: productForm.featured,
      active: productForm.active,
    };
  };

  const categoryPayloadFromForm = (): AdminCategoryPayload => ({
    name: categoryForm.name.trim(),
    slug: categoryForm.slug.trim(),
    description: categoryForm.description.trim(),
    imageUrl: categoryForm.imageUrl.trim(),
    active: categoryForm.active,
  });

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault();
    const payload = productPayloadFromForm();
    if (!payload) return;

    setIsMutating(true);
    setError('');
    try {
      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
      } else {
        await createAdminProduct(payload);
      }
      resetProductForm();
      await loadProducts();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsMutating(false);
    }
  };

  const saveCategory = async (event: FormEvent) => {
    event.preventDefault();
    setIsMutating(true);
    setError('');
    try {
      const payload = categoryPayloadFromForm();
      if (editingCategory) {
        await updateAdminCategory(editingCategory.id, payload);
      } else {
        await createAdminCategory(payload);
      }
      resetCategoryForm();
      await loadCategories();
      await loadProducts();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsMutating(false);
    }
  };

  const toggleProduct = async (product: AdminProduct) => {
    setIsMutating(true);
    setError('');
    try {
      if (product.active) {
        await deleteAdminProduct(product.id);
      } else {
        await updateAdminProduct(product.id, productToPayload(product, true));
      }
      await loadProducts();
    } catch (toggleError) {
      setError(getApiErrorMessage(toggleError));
    } finally {
      setIsMutating(false);
    }
  };

  const toggleCategory = async (category: AdminCategory) => {
    setIsMutating(true);
    setError('');
    try {
      if (category.active) {
        await deleteAdminCategory(category.id);
      } else {
        await updateAdminCategory(category.id, categoryToPayload(category, true));
      }
      await loadCategories();
      await loadProducts();
    } catch (toggleError) {
      setError(getApiErrorMessage(toggleError));
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, quantity);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-amber-900 hover:text-amber-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to shop
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catalog Operations</h1>
            <p className="text-sm text-gray-500 mt-1">
              {totalElements} products - {user?.email || '-'}
            </p>
          </div>
          <button
            type="button"
            onClick={loadProducts}
            disabled={!isAdmin || isLoading}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {!user ? (
          <div className="bg-white border border-gray-100 rounded-lg p-8 text-center">
            <ShieldAlert className="w-12 h-12 mx-auto text-amber-700 mb-4" />
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-amber-900 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition"
            >
              Sign in
            </button>
          </div>
        ) : !isAdmin ? (
          <div className="bg-white border border-gray-100 rounded-lg p-8 text-center">
            <ShieldAlert className="w-12 h-12 mx-auto text-red-600 mb-4" />
            <p className="text-gray-700">You do not have access.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-100 bg-white p-4 md:grid-cols-[1fr_180px_150px_170px]">
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                placeholder="Search products"
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm text-gray-700"
              />
              <select
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setPage(0);
                }}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}{category.active ? '' : ' (inactive)'}
                  </option>
                ))}
              </select>
              <select
                value={activeFilter}
                onChange={(event) => {
                  setActiveFilter(event.target.value as ActiveFilter);
                  setPage(0);
                }}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
              >
                <option value="all">All status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name-asc">Name A-Z</option>
                <option value="price-asc">Price low-high</option>
                <option value="price-desc">Price high-low</option>
                <option value="stock-asc">Stock low-high</option>
              </select>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">
              <section className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Stock</th>
                        <th className="px-4 py-3 text-right">Price</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                            No products.
                          </td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product.id} className="hover:bg-amber-50">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                                  {product.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <Package className="h-5 w-5 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{product.name}</p>
                                  <p className="text-xs text-gray-500">{product.slug}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-gray-700">
                              {product.category}
                              {!product.categoryActive && (
                                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                  inactive
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-right font-medium text-gray-900">{product.stock}</td>
                            <td className="px-4 py-4 text-right font-semibold text-gray-900">
                              {currency.format(product.price)} VND
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                  product.active
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {product.active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => editProduct(product)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                  aria-label="Edit product"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleProduct(product)}
                                  disabled={isMutating}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                  aria-label={product.active ? 'Deactivate product' : 'Activate product'}
                                >
                                  {product.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-4 py-3">
                    <button
                      type="button"
                      disabled={page <= 0 || isLoading}
                      onClick={() => setPage((current) => Math.max(0, current - 1))}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
                    <button
                      type="button"
                      disabled={page + 1 >= totalPages || isLoading}
                      onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </section>

              <aside className="space-y-6">
                <section className="bg-white border border-gray-100 rounded-lg p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                      <Package className="h-5 w-5" />
                      {editingProduct ? 'Edit product' : 'New product'}
                    </h2>
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={resetProductForm}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        aria-label="Cancel product edit"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <form onSubmit={saveProduct} className="space-y-3">
                    <input
                      required
                      value={productForm.name}
                      onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Name"
                      className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                    />
                    <input
                      value={productForm.slug}
                      onChange={(event) => setProductForm((current) => ({ ...current, slug: event.target.value }))}
                      placeholder="Slug"
                      className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                    />
                    <select
                      required
                      value={productForm.categoryId}
                      onChange={(event) => setProductForm((current) => ({ ...current, categoryId: event.target.value }))}
                      className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}{category.active ? '' : ' (inactive)'}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={productForm.description}
                      onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Description"
                      className="min-h-24 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        required
                        min="0.01"
                        step="0.01"
                        type="number"
                        value={productForm.price}
                        onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                        placeholder="Price"
                        className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
                      />
                      <input
                        required
                        min="0"
                        type="number"
                        value={productForm.stock}
                        onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))}
                        placeholder="Stock"
                        className="h-10 rounded-lg border border-gray-300 px-3 text-sm"
                      />
                    </div>
                    <input
                      required
                      value={productForm.unit}
                      onChange={(event) => setProductForm((current) => ({ ...current, unit: event.target.value }))}
                      placeholder="Unit"
                      className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                    />
                    <input
                      value={productForm.imageUrl}
                      onChange={(event) => setProductForm((current) => ({ ...current, imageUrl: event.target.value }))}
                      placeholder="Image URL"
                      className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                      <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={productForm.featured}
                          onChange={(event) => setProductForm((current) => ({ ...current, featured: event.target.checked }))}
                        />
                        Featured
                      </label>
                      <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                        <input
                          type="checkbox"
                          checked={productForm.active}
                          onChange={(event) => setProductForm((current) => ({ ...current, active: event.target.checked }))}
                        />
                        Active
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={isMutating}
                      className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-amber-900 px-4 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-50"
                    >
                      {editingProduct ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                      {editingProduct ? 'Save product' : 'Create product'}
                    </button>
                  </form>
                </section>

                <section className="bg-white border border-gray-100 rounded-lg p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                      <FolderTree className="h-5 w-5" />
                      Categories
                    </h2>
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={resetCategoryForm}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        aria-label="Cancel category edit"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <form onSubmit={saveCategory} className="mb-5 space-y-3">
                    <input
                      required
                      value={categoryForm.name}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Category name"
                      className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                    />
                    <input
                      value={categoryForm.slug}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, slug: event.target.value }))}
                      placeholder="Category slug"
                      className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                    />
                    <input
                      value={categoryForm.imageUrl}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, imageUrl: event.target.value }))}
                      placeholder="Image URL"
                      className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm"
                    />
                    <textarea
                      value={categoryForm.description}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Description"
                      className="min-h-20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={categoryForm.active}
                        onChange={(event) => setCategoryForm((current) => ({ ...current, active: event.target.checked }))}
                      />
                      Active
                    </label>
                    <button
                      type="submit"
                      disabled={isMutating}
                      className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      {editingCategory ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                      {editingCategory ? 'Save category' : 'Create category'}
                    </button>
                  </form>

                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{category.name}</p>
                          <p className="truncate text-xs text-gray-500">{category.slug}</p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => editCategory(category)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                            aria-label="Edit category"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleCategory(category)}
                            disabled={isMutating}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            aria-label={category.active ? 'Deactivate category' : 'Activate category'}
                          >
                            {category.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </div>
          </>
        )}
      </main>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={(id) => removeItem(id)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
