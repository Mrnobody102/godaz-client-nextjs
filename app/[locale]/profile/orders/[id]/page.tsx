import { Metadata } from 'next';
import CustomerOrderDetailClient from './CustomerOrderDetailClient';

export const metadata: Metadata = {
  title: 'Order Detail',
};

export default function CustomerOrderDetailPage() {
  return <CustomerOrderDetailClient />;
}
