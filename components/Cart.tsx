'use client';

import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/constants/products';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';

export interface CartItem extends Product {
  quantity: number;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string | number, quantity: number) => void;
  onRemoveItem: (id: string | number) => void;
}

export function Cart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartProps) {
  const t = useTranslations('cart');
  const locale = useLocale();
  const total = items.reduce((sum, item) => {
    const price =
      typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + price * item.quantity;
  }, 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>

      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-gray-900">{t('title')}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('empty')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-gray-50 p-4 rounded-lg"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded"
                  />

                  <div className="flex-1">
                    <h3 className="text-sm text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-amber-900 mb-2">
                      {(() => {
                        const price =
                          typeof item.price === 'string'
                            ? parseFloat(item.price)
                            : item.price;
                        return t('item_price_per', {
                          price: new Intl.NumberFormat(locale, {
                            maximumFractionDigits: 0,
                          }).format(price),
                          unit: item.unit,
                        });
                      })()}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            item.id,
                            Math.max(0, item.quantity - 1)
                          )
                        }
                        className="p-1 hover:bg-gray-200 rounded transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-gray-200 rounded transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-auto text-red-600 hover:text-red-700 text-sm"
                      >
                        {t('remove')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-6">
            <div className="flex justify-between mb-4">
              <span className="text-gray-900">{t('total')}</span>
              <span className="text-2xl text-amber-900">
                {new Intl.NumberFormat(locale, {
                  maximumFractionDigits: 0,
                }).format(total)}
                ₫
              </span>
            </div>
            <Link 
              href="/checkout"
              onClick={onClose}
              className="w-full bg-amber-900 hover:bg-amber-800 text-white py-3 rounded-lg transition text-center block"
            >
              {t('checkout')}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
