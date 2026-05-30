'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FilterX, Search, SlidersHorizontal, X } from 'lucide-react';

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from './ui/sheet';

const PRICE_RANGE_MAX = 1000000;
const PRICE_PRESETS = [
  { label: '< 200k', min: '', max: '200000' },
  { label: '200k - 400k', min: '200000', max: '400000' },
  { label: '400k+', min: '400000', max: '' },
];

export interface CategoryOption {
  label: string;
  value: string;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function formatPriceChip(minPrice: string, maxPrice: string) {
  const min = minPrice ? Number(minPrice) : undefined;
  const max = maxPrice ? Number(maxPrice) : undefined;

  if (!min && !max) return '';
  if (min && !max) return `≥ ${formatMoney(min)}`;
  if (!min && max) return `≤ ${formatMoney(max)}`;
  return `${formatMoney(min!)} – ${formatMoney(max!)}`;
}

function Chip({
  label,
  onRemove,
  removeAriaLabel,
}: {
  label: string;
  onRemove?: () => void;
  removeAriaLabel: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          aria-label={removeAriaLabel}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export interface ProductFiltersProps {
  searchQuery: string;
  selectedCategory: string | null;
  sortOrder: string;
  pageSize: number;
  minPrice: string;
  maxPrice: string;
  inStockOnly: boolean;
  featuredOnly: boolean;

  categories: CategoryOption[];
  pageSizeOptions: number[];
  defaultPageSize: number;

  resultCount: number;
  showOfflineFallback: boolean;

  setSearchQuery: (value: string) => void;
  setSelectedCategory: (value: string | null) => void;
  setSortOrder: (value: string) => void;
  setPageSize: (value: number) => void;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
  setInStockOnly: (value: boolean) => void;
  setFeaturedOnly: (value: boolean) => void;

  resetToFirstPage: () => void;
  clearFilters: () => void;
}

export function ProductFilters(props: ProductFiltersProps) {
  const tSearch = useTranslations('search');
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasActiveFilters =
    props.searchQuery.trim() ||
    props.selectedCategory ||
    props.sortOrder !== 'newest' ||
    props.pageSize !== props.defaultPageSize ||
    props.minPrice ||
    props.maxPrice ||
    props.inStockOnly ||
    props.featuredOnly;

  const selectedCategoryLabel = useMemo(() => {
    if (!props.selectedCategory) return '';
    return (
      props.categories.find((c) => c.value === props.selectedCategory)?.label ||
      props.selectedCategory
    );
  }, [props.categories, props.selectedCategory]);

  const priceChip = useMemo(
    () => formatPriceChip(props.minPrice, props.maxPrice),
    [props.maxPrice, props.minPrice]
  );

  const filterChips = (
    <div className="flex flex-wrap items-center gap-2">
      {props.searchQuery.trim() && (
        <Chip
          label={`"${props.searchQuery.trim()}"`}
          removeAriaLabel={tSearch('removeFilter')}
          onRemove={() => {
            props.setSearchQuery('');
            props.resetToFirstPage();
          }}
        />
      )}
      {props.selectedCategory && (
        <Chip
          label={selectedCategoryLabel}
          removeAriaLabel={tSearch('removeFilter')}
          onRemove={() => {
            props.setSelectedCategory(null);
            props.resetToFirstPage();
          }}
        />
      )}
      {priceChip && (
        <Chip
          label={`${tSearch('minPrice')}: ${priceChip}`}
          removeAriaLabel={tSearch('removeFilter')}
          onRemove={() => {
            props.setMinPrice('');
            props.setMaxPrice('');
            props.resetToFirstPage();
          }}
        />
      )}
      {props.inStockOnly && (
        <Chip
          label={tSearch('inStock')}
          removeAriaLabel={tSearch('removeFilter')}
          onRemove={() => {
            props.setInStockOnly(false);
            props.resetToFirstPage();
          }}
        />
      )}
      {props.featuredOnly && (
        <Chip
          label={tSearch('featured')}
          removeAriaLabel={tSearch('removeFilter')}
          onRemove={() => {
            props.setFeaturedOnly(false);
            props.resetToFirstPage();
          }}
        />
      )}
    </div>
  );

  const priceBlock = (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-medium text-gray-500">
          {tSearch('minPrice')}
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={props.minPrice ? formatMoney(Number(props.minPrice)) : ''}
            onChange={(event) => {
              const raw = event.target.value;
              const parsed = raw ? String(Math.max(0, Number(raw.replace(/\D/g, '')) || 0)) : '';
              props.setMinPrice(parsed);
              props.resetToFirstPage();
            }}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-900"
          />
        </label>

        <label className="text-xs font-medium text-gray-500">
          {tSearch('maxPrice')}
          <input
            type="text"
            inputMode="numeric"
            placeholder={formatMoney(PRICE_RANGE_MAX)}
            value={props.maxPrice ? formatMoney(Number(props.maxPrice)) : ''}
            onChange={(event) => {
              const raw = event.target.value;
              const parsed = raw ? String(Math.max(0, Number(raw.replace(/\D/g, '')) || 0)) : '';
              props.setMaxPrice(parsed);
              props.resetToFirstPage();
            }}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-900"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {PRICE_PRESETS.map((preset) => {
          const active = props.minPrice === preset.min && props.maxPrice === preset.max;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                props.setMinPrice(preset.min);
                props.setMaxPrice(preset.max);
                props.resetToFirstPage();
              }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'border-amber-900 bg-amber-900 text-white'
                  : 'border-gray-200 text-gray-600 hover:bg-amber-50'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:hidden">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={tSearch('placeholder')}
              value={props.searchQuery}
              onChange={(event) => {
                props.setSearchQuery(event.target.value);
                props.resetToFirstPage();
              }}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl bg-white text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {tSearch('filters')}
          </button>
        </div>
      </div>

      <aside className="hidden lg:block lg:sticky lg:top-24 lg:h-fit rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-gray-900">{tSearch('filters')}</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={props.clearFilters}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <FilterX className="h-4 w-4" />
            {tSearch('clearFilters')}
          </button>
        )}
        {hasActiveFilters && filterChips}

        <div>
          <p className="mb-2 text-xs font-medium text-gray-500">{tSearch('all')}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                props.setSelectedCategory(null);
                props.resetToFirstPage();
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                props.selectedCategory === null
                  ? 'bg-amber-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-amber-50'
              }`}
            >
              {tSearch('all')}
            </button>
            {props.categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => {
                  props.setSelectedCategory(category.value);
                  props.resetToFirstPage();
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  props.selectedCategory === category.value
                    ? 'bg-amber-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-amber-50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {priceBlock}

        <label className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700">
          <input type="checkbox" checked={props.inStockOnly} onChange={(e)=>{props.setInStockOnly(e.target.checked);props.resetToFirstPage();}} className="h-4 w-4 rounded border-gray-300 text-amber-900 focus:ring-amber-900"/>
          {tSearch('inStock')}
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700">
          <input type="checkbox" checked={props.featuredOnly} onChange={(e)=>{props.setFeaturedOnly(e.target.checked);props.resetToFirstPage();}} className="h-4 w-4 rounded border-gray-300 text-amber-900 focus:ring-amber-900"/>
          {tSearch('featured')}
        </label>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="p-0">
          <SheetHeader className="border-b"><SheetTitle>{tSearch('filters')}</SheetTitle></SheetHeader>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {priceBlock}
          </div>
          <SheetFooter className="border-t">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setMobileOpen(false)} className="h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">{tSearch('apply')}</button>
              <button type="button" onClick={() => { props.clearFilters(); setMobileOpen(false); }} className="h-11 rounded-xl bg-amber-900 px-4 text-sm font-medium text-white hover:bg-amber-800">{tSearch('clearFilters')}</button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
