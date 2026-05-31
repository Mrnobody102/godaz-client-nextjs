import { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Thanh toán',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
