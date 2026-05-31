import { Metadata } from 'next';
import { handicraftProducts } from '@/lib/constants/products';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const initialProduct = handicraftProducts.find((product) => String(product.id) === id);
  return {
    title: initialProduct ? initialProduct.name : 'Sản phẩm',
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const initialProduct =
    handicraftProducts.find((product) => String(product.id) === id) || null;

  return <ProductDetailClient productId={id} initialProduct={initialProduct} />;
}
