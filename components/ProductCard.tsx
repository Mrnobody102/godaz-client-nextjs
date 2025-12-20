'use client';

import { Plus } from 'lucide-react';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  description: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition group">
      <div className="relative h-64 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
        />
        <div className="absolute top-4 right-4">
          <span className="bg-amber-900 text-white px-3 py-1 rounded-full text-sm">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl text-amber-900">
              {product.price.toLocaleString('vi-VN')}₫
            </span>
            <span className="text-gray-500 text-sm">/{product.unit}</span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="bg-amber-900 hover:bg-amber-800 text-white p-3 rounded-lg transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Thêm</span>
          </button>
        </div>
      </div>
    </div>
  );
}
