import { Metadata } from 'next';
import ProfileInfoClient from './ProfileInfoClient';

export const metadata: Metadata = {
  title: 'Thông tin cá nhân',
};

export default function ProfileInfoPage() {
  return <ProfileInfoClient />;
}
