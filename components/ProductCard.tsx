'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export interface Product {
  id: string | number;
  name: string;
  category: string;
  price: string | number;
  unit: string;
  image: string;
  description: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const t = useTranslations('product');
  const locale = useLocale();

  const priceNum =
    typeof product.price === 'string'
      ? parseFloat(product.price)
      : product.price;
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(priceNum);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-64 w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-amber-900 text-white px-3 py-1 rounded-full text-sm">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-amber-900">
            {t('price_per', { price: formatted, unit: product.unit })}
          </span>

          <button
            onClick={() => onAddToCart(product)}
            className="bg-amber-900 hover:bg-amber-800 text-white p-3 rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">{t('add')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
