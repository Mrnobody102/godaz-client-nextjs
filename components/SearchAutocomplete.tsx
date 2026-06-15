'use client';

import Image from 'next/image';
import { useEffect, useId, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Clock, Loader2, PackageSearch, Search, Tag } from 'lucide-react';

import { fetchProductSuggestions, type ProductSuggestion } from '@/lib/api';

type SuggestionRow =
  | { kind: 'suggestion'; suggestion: ProductSuggestion }
  | { kind: 'recent'; label: string }
  | { kind: 'search'; query: string };

interface SearchAutocompleteProps {
  value: string;
  placeholder: string;
  recentSearches: string[];
  categorySuggestions?: Array<{
    label: string;
    value: string;
  }>;
  inputClassName?: string;
  onChange: (value: string) => void;
  onSubmitSearch: (query: string) => void;
  onSelectCategory: (slug: string) => void;
  onSelectProduct: (productId: number) => void;
  onClearRecentSearches: () => void;
}

function formatPrice(value: number | null, locale: string) {
  if (value === null) return null;
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value);
  return locale === 'vi' ? `${formatted}₫` : `${formatted} VND`;
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replaceAll('đ', 'd')
    .replaceAll('Đ', 'D')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function SearchAutocomplete({
  value,
  placeholder,
  recentSearches,
  categorySuggestions = [],
  inputClassName,
  onChange,
  onSubmitSearch,
  onSelectCategory,
  onSelectProduct,
  onClearRecentSearches,
}: SearchAutocompleteProps) {
  const tSearch = useTranslations('search');
  const locale = useLocale();
  const listboxId = useId();
  const trimmedValue = value.trim();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!trimmedValue) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);
    const timeout = window.setTimeout(async () => {
      try {
        const nextSuggestions = await fetchProductSuggestions(trimmedValue, 6);
        if (!ignore) {
          setSuggestions(nextSuggestions.filter((item) => item.label.trim()));
        }
      } catch {
        if (!ignore) {
          setSuggestions([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timeout);
    };
  }, [trimmedValue]);

  useEffect(() => {
    if (trimmedValue && suggestions.length > 0) {
      setOpen(true);
    }
  }, [suggestions.length, trimmedValue]);

  const rows = useMemo<SuggestionRow[]>(() => {
    if (trimmedValue) {
      const normalizedQuery = normalizeText(trimmedValue);
      const localCategorySuggestions = categorySuggestions
        .filter((category) =>
          normalizeText(
            `${category.label} ${category.value.replaceAll('-', ' ')}`
          ).includes(normalizedQuery)
        )
        .slice(0, 4)
        .map<ProductSuggestion>((category) => ({
          type: 'category',
          label: category.label,
          productId: null,
          categorySlug: category.value,
          imageUrl: null,
          price: null,
        }));
      const localCategorySlugs = new Set(
        localCategorySuggestions.map((category) => category.categorySlug)
      );
      const remoteSuggestions = suggestions.filter(
        (suggestion) =>
          suggestion.type !== 'category' ||
          !localCategorySlugs.has(suggestion.categorySlug)
      );
      return [
        ...localCategorySuggestions.map((suggestion) => ({
          kind: 'suggestion' as const,
          suggestion,
        })),
        ...remoteSuggestions.map((suggestion) => ({
          kind: 'suggestion' as const,
          suggestion,
        })),
        { kind: 'search', query: trimmedValue },
      ];
    }
    return recentSearches.map((label) => ({ kind: 'recent' as const, label }));
  }, [categorySuggestions, recentSearches, suggestions, trimmedValue]);

  const showPanel =
    open && (rows.length > 0 || loading || Boolean(trimmedValue));

  const selectRow = (row: SuggestionRow) => {
    setOpen(false);
    setActiveIndex(-1);
    if (row.kind === 'recent') {
      onSubmitSearch(row.label);
      return;
    }
    if (row.kind === 'search') {
      onSubmitSearch(row.query);
      return;
    }
    if (row.suggestion.type === 'category' && row.suggestion.categorySlug) {
      onSelectCategory(row.suggestion.categorySlug);
      return;
    }
    if (row.suggestion.type === 'product' && row.suggestion.productId) {
      onSelectProduct(row.suggestion.productId);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      if (rows.length > 0) {
        setActiveIndex((current) => (current + 1) % rows.length);
      }
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (rows.length > 0) {
        setActiveIndex((current) =>
          current <= 0 ? rows.length - 1 : current - 1
        );
      }
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (open && activeIndex >= 0 && rows[activeIndex]) {
        selectRow(rows[activeIndex]);
        return;
      }
      onSubmitSearch(trimmedValue);
      setOpen(false);
      return;
    }
    if (event.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={showPanel}
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        className={inputClassName}
      />

      {showPanel && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border border-gray-200 bg-white py-2 shadow-xl"
        >
          {!trimmedValue && recentSearches.length > 0 && (
            <div className="mb-1 flex items-center justify-between px-3 py-1">
              <p className="text-xs font-semibold uppercase text-gray-500">
                {tSearch('recentSearches')}
              </p>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={onClearRecentSearches}
                className="text-xs font-medium text-amber-900 hover:text-amber-700"
              >
                {tSearch('clearRecent')}
              </button>
            </div>
          )}

          {trimmedValue && (
            <div className="mb-1 flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase text-gray-500">
              <span>{tSearch('suggestions')}</span>
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            </div>
          )}

          {trimmedValue && !loading && suggestions.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-500">
              {tSearch('noSuggestions')}
            </p>
          )}

          {rows.map((row, index) => {
            const active = index === activeIndex;
            const rowId = `${listboxId}-option-${index}`;
            if (row.kind === 'recent') {
              return (
                <button
                  key={`recent-${row.label}`}
                  id={rowId}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectRow(row)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${
                    active
                      ? 'bg-amber-50 text-amber-950'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{row.label}</span>
                </button>
              );
            }

            if (row.kind === 'search') {
              return (
                <button
                  key={`search-${row.query}`}
                  id={rowId}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectRow(row)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${
                    active
                      ? 'bg-amber-50 text-amber-950'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="truncate">
                    {tSearch('searchFor', { query: row.query })}
                  </span>
                </button>
              );
            }

            const suggestion = row.suggestion;
            const price = formatPrice(suggestion.price, locale);
            return (
              <button
                key={`${suggestion.type}-${suggestion.productId ?? suggestion.categorySlug}-${suggestion.label}`}
                id={rowId}
                type="button"
                role="option"
                aria-selected={active}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectRow(row)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                  active
                    ? 'bg-amber-50 text-amber-950'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-500">
                  {suggestion.imageUrl ? (
                    <Image
                      src={suggestion.imageUrl}
                      alt=""
                      fill
                      loading="eager"
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : suggestion.type === 'category' ? (
                    <Tag className="h-4 w-4" />
                  ) : (
                    <PackageSearch className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {suggestion.label}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {suggestion.type === 'category'
                      ? tSearch('viewCategory')
                      : price || tSearch('viewProduct')}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
