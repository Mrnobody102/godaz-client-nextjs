import { Metadata } from 'next';
import AdminOrdersClient from './AdminOrdersClient';

export const metadata: Metadata = {
  title: 'Order Operations',
};

export default function AdminOrdersPage() {
  return <AdminOrdersClient />;
}
