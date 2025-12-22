import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Trang chủ',
  description:
    'Chuyên cung cấp các sản phẩm thủ công mỹ nghệ truyền thống, làm thủ công 100%',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
