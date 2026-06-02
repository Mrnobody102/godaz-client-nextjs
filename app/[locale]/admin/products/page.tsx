import { Metadata } from 'next';
import AdminProductsClient from './AdminProductsClient';

export const metadata: Metadata = {
  title: 'Catalog Operations',
};

export default function AdminProductsPage() {
  return <AdminProductsClient />;
}
