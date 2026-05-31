import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'Quản lý tài khoản',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
