import { Metadata } from 'next';
import AdminCheckoutOperationsClient from './AdminCheckoutOperationsClient';

export const metadata: Metadata = {
  title: 'Checkout Operations',
};

export default function AdminCheckoutOperationsPage() {
  return <AdminCheckoutOperationsClient />;
}
