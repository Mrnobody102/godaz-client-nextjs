import { handicraftProducts } from '@/lib/constants/products';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const initialProduct =
    handicraftProducts.find((product) => String(product.id) === id) || null;

  return <ProductDetailClient productId={id} initialProduct={initialProduct} />;
}
