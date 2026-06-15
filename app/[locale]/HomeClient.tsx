'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';
import { Product, handicraftProducts } from '@/lib/constants/products';
import { Cart } from '@/components/Cart';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { ProductFilters } from '@/components/ProductFilters';
import useCartStore from '@/stores/cartStore';
import { fetchProducts, toProduct } from '@/lib/api';
import {
  ChevronLeft,
  ChevronRight,
  Leaf,
  PackageCheck,
  Palette,
  SearchX,
} from 'lucide-react';
import {
  clearRecentSearches,
  getRecentSearches,
  saveRecentSearch,
} from '@/lib/searchHistory';

const DEFAULT_PAGE_SIZE = 12;
const PAGE_SIZE_OPTIONS = [12, 24, 48];
const SORT_OPTIONS = [
  'relevance',
  'newest',
  'price-asc',
  'price-desc',
] as const;
const SEARCH_URL_DEBOUNCE_MS = 600;

interface CategoryOption {
  label: string;
  value: string;
}

interface PaginationState {
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

const emptyPagination: PaginationState = {
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: DEFAULT_PAGE_SIZE,
};

function parsePageParam(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 0;
  return Math.floor(parsed) - 1;
}

function parsePageSizeParam(value: string | null) {
  const parsed = Number(value);
  return PAGE_SIZE_OPTIONS.includes(parsed) ? parsed : DEFAULT_PAGE_SIZE;
}

function parseMoneyInput(value: string | null) {
  if (!value) return '';
  const parsed = Number(value.replace(/\D/g, ''));
  if (!Number.isFinite(parsed) || parsed < 0) return '';
  return String(Math.floor(parsed));
}

function parseSortParam(value: string | null, hasSearch = false) {
  if (!value) return hasSearch ? 'relevance' : 'newest';
  return SORT_OPTIONS.includes(value as (typeof SORT_OPTIONS)[number])
    ? value
    : hasSearch
      ? 'relevance'
      : 'newest';
}

function moneyFilter(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replaceAll('đ', 'd')
    .replaceAll('Đ', 'D')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function matchesCategory(product: Product, category: string | null) {
  if (!category) return true;
  return product.categorySlug === category || product.category === category;
}

function categoryOptionsFromProducts(products: Product[]) {
  const options = new Map<string, CategoryOption>();
  products.forEach((product) => {
    const value = product.categorySlug || String(product.category);
    if (!options.has(value)) {
      options.set(value, { label: product.category, value });
    }
  });
  return Array.from(options.values());
}

function buildPageButtons(page: number, totalPages: number) {
  if (totalPages <= 0) return [];
  const windowSize = 5;
  const start = Math.max(0, Math.min(page - 2, totalPages - windowSize));
  const end = Math.min(totalPages, start + windowSize);
  return Array.from({ length: end - start }, (_, index) => start + index);
}

export default function HomeClient() {
  const t = useTranslations('home');
  const tSearch = useTranslations('search');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const queryStringRef = useRef(queryString);
  const syncedQueryStringRef = useRef(queryString);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get('q') || ''
  );
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    () => searchParams.get('category') || null
  );
  const [sortOrder, setSortOrder] = useState(() =>
    parseSortParam(
      searchParams.get('sort'),
      Boolean(searchParams.get('q')?.trim())
    )
  );
  const [page, setPage] = useState(() =>
    parsePageParam(searchParams.get('page'))
  );
  const [pageSize, setPageSize] = useState(() =>
    parsePageSizeParam(searchParams.get('size'))
  );
  const [minPrice, setMinPrice] = useState(() =>
    parseMoneyInput(searchParams.get('minPrice'))
  );
  const [maxPrice, setMaxPrice] = useState(() =>
    parseMoneyInput(searchParams.get('maxPrice'))
  );
  const [inStockOnly, setInStockOnly] = useState(
    () => searchParams.get('inStock') === 'true'
  );
  const [featuredOnly, setFeaturedOnly] = useState(
    () => searchParams.get('featured') === 'true'
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [apiCategories, setApiCategories] = useState<CategoryOption[]>([]);
  const [apiConnected, setApiConnected] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [pagination, setPagination] =
    useState<PaginationState>(emptyPagination);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const {
    items: cartItems,
    addItem,
    updateQuantity,
    removeItem,
  } = useCartStore();

  useEffect(() => {
    queryStringRef.current = queryString;
  }, [queryString]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    if (queryString === syncedQueryStringRef.current) {
      return;
    }
    syncedQueryStringRef.current = queryString;

    const currentParams = new URLSearchParams(queryString);
    const nextSearch = currentParams.get('q') || '';
    const nextCategory = currentParams.get('category') || null;
    const nextSort = parseSortParam(
      currentParams.get('sort'),
      Boolean(nextSearch.trim())
    );
    const nextPage = parsePageParam(currentParams.get('page'));
    const nextSize = parsePageSizeParam(currentParams.get('size'));
    const nextMinPrice = parseMoneyInput(currentParams.get('minPrice'));
    const nextMaxPrice = parseMoneyInput(currentParams.get('maxPrice'));
    const nextInStockOnly = currentParams.get('inStock') === 'true';
    const nextFeaturedOnly = currentParams.get('featured') === 'true';

    setSearchQuery((current) =>
      current === nextSearch ? current : nextSearch
    );
    setDebouncedSearch((current) =>
      current === nextSearch ? current : nextSearch
    );
    setSelectedCategory((current) =>
      current === nextCategory ? current : nextCategory
    );
    setSortOrder((current) => (current === nextSort ? current : nextSort));
    setPage((current) => (current === nextPage ? current : nextPage));
    setPageSize((current) => (current === nextSize ? current : nextSize));
    setMinPrice((current) =>
      current === nextMinPrice ? current : nextMinPrice
    );
    setMaxPrice((current) =>
      current === nextMaxPrice ? current : nextMaxPrice
    );
    setInStockOnly((current) =>
      current === nextInStockOnly ? current : nextInStockOnly
    );
    setFeaturedOnly((current) =>
      current === nextFeaturedOnly ? current : nextFeaturedOnly
    );
  }, [queryString]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, SEARCH_URL_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery.trim() && sortOrder === 'relevance') {
      setSortOrder('newest');
    }
  }, [searchQuery, sortOrder]);

  useEffect(() => {
    const params = new URLSearchParams(queryStringRef.current);

    const setOrDelete = (
      key: string,
      value: string | number | boolean | null
    ) => {
      if (value === null || value === '' || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    };

    setOrDelete('q', debouncedSearch);
    setOrDelete('category', selectedCategory);
    const defaultSortOrder = debouncedSearch ? 'relevance' : 'newest';
    setOrDelete('sort', sortOrder === defaultSortOrder ? null : sortOrder);
    setOrDelete('page', page > 0 ? page + 1 : null);
    setOrDelete('size', pageSize === DEFAULT_PAGE_SIZE ? null : pageSize);
    setOrDelete('minPrice', minPrice);
    setOrDelete('maxPrice', maxPrice);
    setOrDelete('inStock', inStockOnly);
    setOrDelete('featured', featuredOnly);

    const nextQueryString = params.toString();
    if (nextQueryString !== queryStringRef.current) {
      router.replace(
        `${pathname}${nextQueryString ? `?${nextQueryString}` : ''}`,
        {
          scroll: false,
        }
      );
    }
  }, [
    debouncedSearch,
    featuredOnly,
    inStockOnly,
    maxPrice,
    minPrice,
    page,
    pageSize,
    pathname,
    router,
    selectedCategory,
    sortOrder,
  ]);

  const minPriceNumber = moneyFilter(minPrice);
  const maxPriceNumber = moneyFilter(maxPrice);
  const isPriceRangeInvalid =
    minPriceNumber !== undefined &&
    maxPriceNumber !== undefined &&
    minPriceNumber > maxPriceNumber;

  useEffect(() => {
    let ignore = false;

    async function loadProducts() {
      if (isPriceRangeInvalid) {
        setCatalogError(tSearch('invalidPriceRange'));
        setProducts([]);
        setApiConnected(false);
        setPagination(emptyPagination);
        setIsLoadingProducts(false);
        return;
      }

      setCatalogError('');
      setIsLoadingProducts(true);
      try {
        const response = await fetchProducts({
          search: debouncedSearch,
          category: selectedCategory,
          sort: sortOrder,
          page,
          size: pageSize,
          minPrice: minPriceNumber,
          maxPrice: maxPriceNumber,
          inStock: inStockOnly ? true : undefined,
          featured: featuredOnly ? true : undefined,
        });
        if (ignore) return;
        setProducts(response.products.map(toProduct));
        setApiCategories(
          response.categories.map((category) => ({
            label: category.name,
            value: category.slug,
          }))
        );
        setPagination({
          totalElements: response.totalElements,
          totalPages: response.totalPages,
          page: response.page,
          size: response.size,
        });
        setApiConnected(true);
      } catch {
        if (ignore) return;
        setApiConnected(false);
      } finally {
        if (!ignore) {
          setIsLoadingProducts(false);
        }
      }
    }

    loadProducts();

    return () => {
      ignore = true;
    };
  }, [
    debouncedSearch,
    featuredOnly,
    inStockOnly,
    isPriceRangeInvalid,
    maxPriceNumber,
    minPriceNumber,
    page,
    pageSize,
    selectedCategory,
    sortOrder,
    tSearch,
  ]);

  const fallbackCategories = useMemo(
    () => categoryOptionsFromProducts(handicraftProducts),
    []
  );

  const fallbackFilteredProducts = useMemo(() => {
    let result = handicraftProducts.filter((product) => {
      const normalizedQuery = normalizeSearchText(debouncedSearch);
      const matchesSearch =
        normalizeSearchText(product.name).includes(normalizedQuery) ||
        normalizeSearchText(product.description).includes(normalizedQuery) ||
        normalizeSearchText(product.category).includes(normalizedQuery) ||
        normalizeSearchText(product.categorySlug || '').includes(
          normalizedQuery
        );
      const price = Number(product.price);
      const matchesMinPrice =
        minPriceNumber === undefined || price >= minPriceNumber;
      const matchesMaxPrice =
        maxPriceNumber === undefined || price <= maxPriceNumber;
      const matchesInStock =
        !inStockOnly || typeof product.stock !== 'number' || product.stock > 0;
      const matchesFeatured = !featuredOnly || product.featured === true;

      return (
        matchesSearch &&
        matchesCategory(product, selectedCategory) &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesInStock &&
        matchesFeatured &&
        !isPriceRangeInvalid
      );
    });

    if (sortOrder === 'price-asc') {
      result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOrder === 'price-desc') {
      result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [
    debouncedSearch,
    featuredOnly,
    inStockOnly,
    isPriceRangeInvalid,
    maxPriceNumber,
    minPriceNumber,
    selectedCategory,
    sortOrder,
  ]);

  const fallbackTotalPages = Math.ceil(
    fallbackFilteredProducts.length / pageSize
  );
  const fallbackProducts = useMemo(() => {
    const start = page * pageSize;
    return fallbackFilteredProducts.slice(start, start + pageSize);
  }, [fallbackFilteredProducts, page, pageSize]);

  const activeTotalPages = apiConnected
    ? pagination.totalPages
    : fallbackTotalPages;

  useEffect(() => {
    if (
      !isLoadingProducts &&
      activeTotalPages > 0 &&
      page >= activeTotalPages
    ) {
      setPage(activeTotalPages - 1);
    }
  }, [activeTotalPages, isLoadingProducts, page]);

  const categories = apiConnected ? apiCategories : fallbackCategories;
  const displayedProducts = apiConnected ? products : fallbackProducts;
  const activeTotalElements = apiConnected
    ? pagination.totalElements
    : fallbackFilteredProducts.length;
  const pageButtons = useMemo(
    () => buildPageButtons(page, activeTotalPages),
    [activeTotalPages, page]
  );

  const addToCart = (product: Product) => {
    const added = addItem(product);
    if (added) {
      setIsCartOpen(true);
    }
    return added;
  };

  const handleUpdateQuantity = (id: string | number, quantity: number) => {
    if (quantity === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, quantity);
    }
  };

  const handleRemoveItem = (id: string | number) => {
    removeItem(id);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const resetToFirstPage = () => setPage(0);

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    const hasExplicitSort = new URLSearchParams(queryStringRef.current).has(
      'sort'
    );
    if (value.trim() && !hasExplicitSort && sortOrder === 'newest') {
      setSortOrder('relevance');
    }
    if (!value.trim() && sortOrder === 'relevance') {
      setSortOrder('newest');
    }
  };

  const handleSearchSubmit = (query: string) => {
    const trimmedQuery = query.trim();
    handleSearchQueryChange(trimmedQuery);
    setDebouncedSearch(trimmedQuery);
    setPage(0);
    if (trimmedQuery) {
      setRecentSearches(saveRecentSearch(trimmedQuery));
    }
  };

  const handleSelectProductSuggestion = (productId: number) => {
    router.push(`/${locale}/product/${productId}`);
  };

  const handleClearRecentSearches = () => {
    setRecentSearches(clearRecentSearches());
  };

  const clearFilters = () => {
    handleSearchQueryChange('');
    setDebouncedSearch('');
    setSelectedCategory(null);
    setSortOrder('newest');
    setPage(0);
    setPageSize(DEFAULT_PAGE_SIZE);
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setFeaturedOnly(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />
      <Hero />

      <section id="products" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('products.title')}
            </h2>
            <p className="text-lg text-gray-600">{t('products.description')}</p>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>
                {tSearch('resultCount', { count: activeTotalElements })}
              </span>
              {!apiConnected && !isLoadingProducts && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span>{tSearch('offlineFallback')}</span>
                </>
              )}
            </div>

            <div className="hidden lg:flex lg:items-center gap-3">
              <select
                value={sortOrder}
                onChange={(event) => {
                  setSortOrder(event.target.value);
                  resetToFirstPage();
                }}
                className="h-11 w-52 appearance-none rounded-xl border border-gray-300 bg-white px-4 pr-12 text-sm text-gray-700 outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                }}
              >
                {(searchQuery.trim() || sortOrder === 'relevance') && (
                  <option value="relevance">{tSearch('sortRelevance')}</option>
                )}
                <option value="newest">{tSearch('sortNewest')}</option>
                <option value="price-asc">{tSearch('sortPriceAsc')}</option>
                <option value="price-desc">{tSearch('sortPriceDesc')}</option>
              </select>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  resetToFirstPage();
                }}
                className="h-11 w-36 appearance-none whitespace-nowrap rounded-xl border border-gray-300 bg-white px-4 pr-12 text-sm text-gray-700 outline-none focus:border-amber-900 focus:ring-1 focus:ring-amber-900"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                }}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {tSearch('pageSize', { size })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6 lg:items-start">
            <div className="lg:sticky lg:top-24">
              <ProductFilters
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                sortOrder={sortOrder}
                pageSize={pageSize}
                minPrice={minPrice}
                maxPrice={maxPrice}
                inStockOnly={inStockOnly}
                featuredOnly={featuredOnly}
                categories={categories}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                defaultPageSize={DEFAULT_PAGE_SIZE}
                resultCount={activeTotalElements}
                showOfflineFallback={!apiConnected && !isLoadingProducts}
                recentSearches={recentSearches}
                setSearchQuery={handleSearchQueryChange}
                setSelectedCategory={setSelectedCategory}
                setSortOrder={setSortOrder}
                setPageSize={setPageSize}
                setMinPrice={setMinPrice}
                setMaxPrice={setMaxPrice}
                setInStockOnly={setInStockOnly}
                setFeaturedOnly={setFeaturedOnly}
                resetToFirstPage={resetToFirstPage}
                clearFilters={clearFilters}
                onSearchSubmit={handleSearchSubmit}
                onSelectProductSuggestion={handleSelectProductSuggestion}
                onClearRecentSearches={handleClearRecentSearches}
              />
            </div>

            <div>
              {catalogError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {catalogError}
                </div>
              )}

              {isLoadingProducts && displayedProducts.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
                    >
                      <div className="h-64 bg-gray-200" />
                      <div className="p-6 space-y-4">
                        <div className="h-5 bg-gray-200 rounded" />
                        <div className="h-4 bg-gray-100 rounded" />
                        <div className="h-10 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayedProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={addToCart}
                        priority={index === 0}
                      />
                    ))}
                  </div>

                  {activeTotalPages > 1 && (
                    <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-sm text-gray-500">
                        {tSearch('pageOf', {
                          page: page + 1,
                          totalPages: activeTotalPages,
                        })}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPage((current) => Math.max(0, current - 1))
                          }
                          disabled={page === 0}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={tSearch('previous')}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        {pageButtons.map((pageNumber) => (
                          <button
                            key={pageNumber}
                            type="button"
                            onClick={() => setPage(pageNumber)}
                            className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-medium ${
                              pageNumber === page
                                ? 'border-amber-900 bg-amber-900 text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber + 1}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setPage((current) =>
                              Math.min(activeTotalPages - 1, current + 1)
                            )
                          }
                          disabled={page >= activeTotalPages - 1}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={tSearch('next')}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center">
                  <SearchX className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    {tSearch('noResultsTitle')}
                  </h3>
                  <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
                    {tSearch('noResultsBody')}
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
                    >
                      {tSearch('clearFilters')}
                    </button>
                    {recentSearches.map((query) => (
                      <button
                        key={query}
                        type="button"
                        onClick={() => handleSearchSubmit(query)}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                  {categories.length > 0 && (
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {categories.slice(0, 5).map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => {
                            handleSearchQueryChange('');
                            setDebouncedSearch('');
                            setSelectedCategory(category.value);
                            resetToFirstPage();
                          }}
                          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-950 hover:bg-amber-100"
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-amber-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('features.f1_title')}
              </h3>
              <p className="text-amber-100">{t('features.f1_desc')}</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('features.f2_title')}
              </h3>
              <p className="text-amber-100">{t('features.f2_desc')}</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('features.f3_title')}
              </h3>
              <p className="text-amber-100">{t('features.f3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {t('about.title')}
          </h2>
          <p className="text-lg text-gray-600 mb-4 leading-relaxed">
            {t('about.p1')}
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            {t('about.p2')}
          </p>
        </div>
      </section>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
