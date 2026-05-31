import { Metadata } from 'next';
import { handicraftProducts } from '@/lib/constants/products';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

import { fetchProduct } from '@/lib/api';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  
  let productName = 'Sản phẩm';
  try {
    const apiProduct = await fetchProduct(id);
    productName = apiProduct.name;
  } catch {
    const fallbackProduct = handicraftProducts.find((product) => String(product.id) === id);
    if (fallbackProduct) {
      productName = fallbackProduct.name;
    }
  }

  return {
    title: productName,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const initialProduct =
    handicraftProducts.find((product) => String(product.id) === id) || null;

  return <ProductDetailClient productId={id} initialProduct={initialProduct} />;
}
