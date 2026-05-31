import { Metadata } from 'next';
import WishlistClient from './WishlistClient';

export const metadata: Metadata = {
  title: 'Sản phẩm yêu thích',
};

export default function WishlistPage() {
  return <WishlistClient />;
}
