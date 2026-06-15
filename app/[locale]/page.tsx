import type { Metadata } from 'next';
import { Suspense } from 'react';
import HomeClient from './HomeClient';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
  }>;
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const [{ locale }, currentSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const isVi = locale !== 'en';
  const query = firstParam(currentSearchParams.q)?.trim();
  const category = firstParam(currentSearchParams.category)?.trim();

  if (query) {
    return {
      title: isVi ? `Tìm "${query}"` : `Search "${query}"`,
      description: isVi
        ? `Kết quả tìm kiếm sản phẩm thủ công cho "${query}".`
        : `Handicraft product search results for "${query}".`,
    };
  }

  if (category) {
    return {
      title: isVi ? `Danh mục ${category}` : `${category} category`,
      description: isVi
        ? `Khám phá sản phẩm thủ công trong danh mục ${category}.`
        : `Explore handicraft products in the ${category} category.`,
    };
  }

  return {
    title: isVi ? 'Trang chủ' : 'Home',
    description: isVi
      ? 'Sản phẩm thủ công Việt Nam được chọn lọc cho mua sắm trực tuyến.'
      : 'Curated Vietnamese handicraft products for online shopping.',
  };
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <HomeClient />
    </Suspense>
  );
}
