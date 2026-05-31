import { Metadata } from 'next';
import CheckoutSuccessClient from './CheckoutSuccessClient';

export const metadata: Metadata = {
  title: 'Đặt hàng thành công',
};

export default function CheckoutSuccessPage() {
  return <CheckoutSuccessClient />;
}
