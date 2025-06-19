import { APP_NAME } from '@/lib/constants';
import Link from 'next/link';

const LogoTitle = () => {
  return (
    <Link href="/" className="flex">
      <span className="lg:block font-bold text-2xl ml-3">{APP_NAME}</span>
    </Link>
  );
};

export default LogoTitle;
