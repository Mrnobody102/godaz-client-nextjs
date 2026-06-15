'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  ArrowLeft,
  Heart,
  Minus,
  PackageX,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Cart } from '@/components/Cart';
import { AuthModal } from '@/components/AuthModal';
import { Product, handicraftProducts } from '@/lib/constants/products';
import { ProductCard } from '@/components/ProductCard';
import { ProductReviews } from '@/components/ProductReviews';
import { Link } from '@/i18n/routing';
import useCartStore from '@/stores/cartStore';
import useWishlistStore from '@/stores/wishlistStore';
import { fetchProduct, fetchProducts, toProduct } from '@/lib/api';
import {
  getRecentlyViewedProducts,
  saveRecentlyViewedProduct,
} from '@/lib/recentlyViewed';
import { toast } from 'sonner';

interface Props {
  productId: string;
  initialProduct: Product | null;
}

export default function ProductDetailClient({
  productId,
  initialProduct,
}: Props) {
  const t = useTranslations('productDetail');
  const tWishlist = useTranslations('wishlist');
  const locale = useLocale();
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<
    Product[]
  >([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(!initialProduct);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );

  const {
    items: cartItems,
    addItem: addCartItem,
    updateQuantity,
    removeItem,
  } = useCartStore();
  const {
    isInWishlist,
    addItem: addWishlistItem,
    removeItem: removeWishlistItem,
  } = useWishlistStore();

  useEffect(() => {
    let ignore = false;

    async function loadProduct() {
      setIsLoadingProduct(true);
      try {
        const response = await fetchProduct(productId);
        if (!ignore) {
          setProduct(toProduct(response));
        }
      } catch {
        if (!ignore && !initialProduct) {
          setProduct(null);
        }
      } finally {
        if (!ignore) {
          setIsLoadingProduct(false);
        }
      }
    }

    loadProduct();

    return () => {
      ignore = true;
    };
  }, [initialProduct, productId]);

  useEffect(() => {
    setRecentlyViewedProducts(
      getRecentlyViewedProducts().filter(
        (item) => String(item.id) !== String(productId)
      )
    );
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    setRecentlyViewedProducts(
      saveRecentlyViewedProduct(product).filter(
        (item) => String(item.id) !== String(product.id)
      )
    );
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const currentProduct = product;

    const fallbackRelated = handicraftProducts
      .filter(
        (item) =>
          item.category === currentProduct.category &&
          item.id !== currentProduct.id
      )
      .slice(0, 4);
    setRelatedProducts(fallbackRelated);

    let ignore = false;
    async function loadRelated() {
      try {
        const response = await fetchProducts({
          category: currentProduct.category,
          size: 5,
        });
        if (!ignore) {
          setRelatedProducts(
            response.products
              .map(toProduct)
              .filter((item) => String(item.id) !== String(currentProduct.id))
              .slice(0, 4)
          );
        }
      } catch {
        // Fallback related products are already set.
      }
    }

    loadRelated();

    return () => {
      ignore = true;
    };
  }, [product]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleUpdateQuantity = (id: string | number, nextQuantity: number) => {
    if (nextQuantity === 0) {
      removeItem(id);
    } else {
      updateQuantity(id, nextQuantity);
    }
  };

  const isWished = product ? isInWishlist(product.id) : false;
  const activeVariants =
    product?.variants?.filter((variant) => variant.active) || [];
  const selectedVariant =
    activeVariants.find((variant) => variant.id === selectedVariantId) || null;
  const displayImage = selectedVariant?.imageUrl || product?.image || '';
  const stock = selectedVariant?.stock ?? product?.stock ?? 999;
  const isOutOfStock = stock <= 0;
  const galleryImages = product
    ? [
        product.image,
        ...(product.galleryImages || []).map((image) => image.imageUrl),
        ...activeVariants
          .map((variant) => variant.imageUrl)
          .filter((imageUrl): imageUrl is string => Boolean(imageUrl)),
      ].filter(
        (imageUrl, index, images) =>
          imageUrl && images.indexOf(imageUrl) === index
      )
    : [];

  const priceNum = useMemo(() => {
    if (!product) return 0;
    const price = selectedVariant?.price ?? product.price;
    return typeof price === 'string' ? parseFloat(price) : price;
  }, [product, selectedVariant]);

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(priceNum);

  const handleWishlistClick = () => {
    if (!product) return;

    if (isWished) {
      removeWishlistItem(product.id);
      toast(tWishlist('remove'));
    } else {
      addWishlistItem(product);
      toast.success(tWishlist('add'));
    }
  };

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    const cartProduct: Product = selectedVariant
      ? {
          ...product,
          cartKey: `${product.id}:${selectedVariant.id}`,
          variantId: selectedVariant.id,
          variantName: selectedVariant.name,
          sku: selectedVariant.sku ?? product.sku ?? null,
          price: selectedVariant.price,
          stock: selectedVariant.stock,
          image: selectedVariant.imageUrl || product.image,
        }
      : product;
    const added = addCartItem(cartProduct, quantity);
    if (!added) {
      toast.error(t('stockLimit'));
      return;
    }

    setIsCartOpen(true);
    toast.success(t('addedToCart', { name: product.name }));
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) setQuantity((current) => current - 1);
  };

  const handleIncreaseQuantity = () => {
    setQuantity((current) => Math.min(current + 1, stock));
  };

  const handleSelectVariant = (variantId: number | null) => {
    setSelectedVariantId(variantId);
    setQuantity(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-amber-900 hover:text-amber-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('backToHome')}
          </Link>
        </div>

        {isLoadingProduct && !product ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100 animate-pulse">
            <div className="h-96 md:h-[560px] md:w-1/2 bg-gray-200" />
            <div className="p-8 md:p-12 md:w-1/2 space-y-6">
              <div className="h-8 w-32 bg-gray-200 rounded-full" />
              <div className="h-12 w-3/4 bg-gray-200 rounded" />
              <div className="h-10 w-48 bg-gray-200 rounded" />
              <div className="h-32 bg-gray-100 rounded" />
            </div>
          </div>
        ) : !product ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <PackageX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">{t('notFound')}</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">
              <div className="relative h-96 md:h-auto md:w-1/2 bg-gray-100">
                <Image
                  src={displayImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  loading="eager"
                  fetchPriority="high"
                />
                {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto rounded-xl bg-white/85 p-2 backdrop-blur">
                    {galleryImages.map((imageUrl) => (
                      <button
                        key={imageUrl}
                        type="button"
                        onClick={() => {
                          if (imageUrl === product.image) {
                            handleSelectVariant(null);
                            return;
                          }
                          const variant = activeVariants.find(
                            (item) => item.imageUrl === imageUrl
                          );
                          if (variant) handleSelectVariant(variant.id);
                        }}
                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                          displayImage === imageUrl
                            ? 'border-amber-900'
                            : 'border-white'
                        }`}
                      >
                        <Image
                          src={imageUrl}
                          alt=""
                          fill
                          loading="eager"
                          className="object-cover"
                          sizes="56px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="inline-block bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">
                    {product.category}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                <div className="text-3xl font-bold text-amber-900 mb-3">
                  {t('price_per', { price: formatted, unit: product.unit })}
                </div>
                {typeof product.stock === 'number' && (
                  <p className="text-sm text-gray-500 mb-8">
                    {t('stock')} {stock}
                  </p>
                )}

                {activeVariants.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                      {t('variant')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectVariant(null)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                          selectedVariantId === null
                            ? 'border-amber-900 bg-amber-50 text-amber-900'
                            : 'border-gray-200 text-gray-700'
                        }`}
                      >
                        {t('defaultVariant')}
                      </button>
                      {activeVariants.map((variant) => (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => handleSelectVariant(variant.id)}
                          disabled={variant.stock <= 0}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-45 ${
                            selectedVariantId === variant.id
                              ? 'border-amber-900 bg-amber-50 text-amber-900'
                              : 'border-gray-200 text-gray-700'
                          }`}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-10">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                    {t('description')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {product.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="flex items-center justify-between border-2 border-gray-200 rounded-2xl p-2 w-full sm:w-32 bg-white">
                    <button
                      onClick={handleDecreaseQuantity}
                      type="button"
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-amber-900 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-gray-900 text-lg w-8 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncreaseQuantity}
                      type="button"
                      disabled={quantity >= stock}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-amber-900 transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    type="button"
                    disabled={isOutOfStock}
                    className="flex-1 bg-amber-900 hover:bg-amber-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <ShoppingBag className="w-6 h-6" />
                    {isOutOfStock ? t('soldOut') : t('addToCart')}
                  </button>

                  <button
                    onClick={handleWishlistClick}
                    type="button"
                    className={`w-16 h-16 flex items-center justify-center rounded-2xl border-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 flex-shrink-0 ${
                      isWished
                        ? 'border-red-500 bg-red-50 text-red-500'
                        : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-red-400'
                    }`}
                  >
                    <Heart
                      className={`w-8 h-8 transition-colors ${
                        isWished ? 'fill-red-500' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-gray-100">
                  <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl">
                    <Truck className="w-8 h-8 text-amber-900 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {t('delivery')}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl">
                    <Sparkles className="w-8 h-8 text-amber-900 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {t('handmade')}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl">
                    <ShieldCheck className="w-8 h-8 text-amber-900 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {t('inspection')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <ProductReviews
              productId={product.id}
              onRequireAuth={() => setIsAuthModalOpen(true)}
            />

            {relatedProducts.length > 0 && (
              <div className="mt-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  {t('related')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((relatedProduct, index) => (
                    <ProductCard
                      key={relatedProduct.id}
                      product={relatedProduct}
                      onAddToCart={(nextProduct) => addCartItem(nextProduct)}
                      priority={index === 0}
                    />
                  ))}
                </div>
              </div>
            )}

            {recentlyViewedProducts.length > 0 && (
              <div className="mt-16">
                <h2 className="mb-8 text-2xl font-bold text-gray-900">
                  {t('recentlyViewed')}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {recentlyViewedProducts
                    .slice(0, 4)
                    .map((recentProduct, index) => (
                      <ProductCard
                        key={recentProduct.id}
                        product={recentProduct}
                        onAddToCart={(nextProduct) => addCartItem(nextProduct)}
                        priority={index === 0}
                      />
                    ))}
                </div>
              </div>
            )}
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
