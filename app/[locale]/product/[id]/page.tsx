import type { Metadata } from 'next';
import { handicraftProducts } from '@/lib/constants/products';
import { fetchProduct } from '@/lib/api';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const isVi = locale !== 'en';

  let productName = isVi ? 'Sản phẩm' : 'Product';
  let description = isVi
    ? 'Chi tiết sản phẩm thủ công tại Godaz.'
    : 'Handicraft product details at Godaz.';
  let image: string | undefined;
  try {
    const apiProduct = await fetchProduct(id);
    productName = apiProduct.name;
    description = apiProduct.description || description;
    image = apiProduct.image || undefined;
  } catch {
    const fallbackProduct = handicraftProducts.find(
      (product) => String(product.id) === id
    );
    if (fallbackProduct) {
      productName = fallbackProduct.name;
      description = fallbackProduct.description || description;
      image = fallbackProduct.image;
    }
  }

  return {
    title: productName,
    description,
    openGraph: {
      title: productName,
      description,
      images: image ? [{ url: image, alt: productName }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const initialProduct =
    handicraftProducts.find((product) => String(product.id) === id) || null;

  return <ProductDetailClient productId={id} initialProduct={initialProduct} />;
}
