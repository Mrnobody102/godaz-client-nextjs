'use client';

import Image from 'next/image';
import { Plus, Heart } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Product } from '@/lib/constants/products';
import useWishlistStore from '@/stores/wishlistStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const t = useTranslations('product');
  const tWishlist = useTranslations('wishlist');
  const locale = useLocale();
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  
  const isWished = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWished) {
      removeItem(product.id);
      toast(tWishlist('remove'));
    } else {
      addItem(product);
      toast.success(tWishlist('add'));
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart(product);
    toast.success(product.name + ' ✓');
  };

  const priceNum =
    typeof product.price === 'string'
      ? parseFloat(product.price)
      : product.price;
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(priceNum);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
      <Link href={`/product/${product.id}`} className="relative h-64 w-full block">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          <span className="bg-amber-900 text-white px-3 py-1 rounded-full text-sm">
            {product.category}
          </span>
          <button
            onClick={handleWishlistClick}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
          >
            <Heart className={`w-5 h-5 ${isWished ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <Link href={`/product/${product.id}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-amber-900 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-amber-900">
            {t('price_per', { price: formatted, unit: product.unit })}
          </span>

          <button
            onClick={handleAddToCart}
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
