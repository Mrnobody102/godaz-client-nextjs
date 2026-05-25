import { notFound } from 'next/navigation';
import { handicraftProducts } from '@/lib/constants/products';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  const product = handicraftProducts.find((p) => String(p.id) === resolvedParams.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
