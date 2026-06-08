'use client';

import {
  BarChart3,
  ClipboardList,
  FolderTree,
  Globe,
  Heart,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useLocale,
  useTranslations as useNextIntlTranslations,
} from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import useWishlistStore from '@/stores/wishlistStore';

function useSafeTranslations(ns: string) {
  try {
    return useNextIntlTranslations(ns);
  } catch {
    const fallbackMap: Record<string, string> = {
      'header.title': 'Thủ Công Mỹ Nghệ',
      'header.nav.home': 'Trang chủ',
      'header.nav.products': 'Sản phẩm',
      'header.nav.about': 'Giới thiệu',
      'header.nav.contact': 'Liên hệ',
      'header.signin': 'Đăng nhập',
      'header.logout': 'Đăng xuất',
    };

    return (key: string, opts?: Record<string, unknown>) => {
      const full = `${ns}.${key}`;
      const msg = fallbackMap[full];
      if (!msg) return key;
      if (!opts) return msg;
      return msg.replace(/{(\w+)}/g, (_, k) => String(opts[k] ?? ''));
    };
  }
}

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onAuthClick: () => void;
}

type Locale = 'vi' | 'en';

export function Header({ cartCount, onCartClick, onAuthClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const t = useSafeTranslations('header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { items: wishlistItems } = useWishlistStore();
  const wishlistCount = wishlistItems.length;

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const handleLanguageChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setLangMenuOpen(false);
  };

  const navItems = [
    { href: '/#home', label: t('nav.home') },
    { href: '/#products', label: t('nav.products') },
    { href: '/#about', label: t('nav.about') },
    { href: '/#contact', label: t('nav.contact') },
  ] as const;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-amber-900 rounded-lg flex items-center justify-center text-white font-bold">
              TM
            </div>
            <span className="text-xl font-bold text-amber-900">
              {t('title')}
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-amber-900 transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <div className="w-8 h-8 bg-amber-900 rounded-full flex items-center justify-center text-white text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-gray-700">
                    {user.name}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-20">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile/info"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        {locale === 'vi' ? 'Thông tin cá nhân' : 'Profile Info'}
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        {locale === 'vi' ? 'Đơn hàng của tôi' : 'My Orders'}
                      </Link>
                      {user.role === 'ADMIN' && (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <BarChart3 className="w-4 h-4" />
                            Admin Dashboard
                          </Link>
                          <Link
                            href="/admin/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <ClipboardList className="w-4 h-4" />
                            Order Operations
                          </Link>
                          <Link
                            href="/admin/products"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FolderTree className="w-4 h-4" />
                            Catalog Operations
                          </Link>
                          <Link
                            href="/admin/operations"
                            onClick={() => setUserMenuOpen(false)}
                            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Checkout Operations
                          </Link>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2 border-t"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onAuthClick}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-amber-900 hover:bg-amber-50 rounded-lg transition"
              >
                <User className="w-5 h-5" />
                <span>{t('signin')}</span>
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Globe className="w-5 h-5 text-gray-700" />
                <span className="hidden sm:inline text-gray-700 uppercase">
                  {locale}
                </span>
              </button>

              {langMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-2 z-20">
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('vi')}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition ${
                        locale === 'vi'
                          ? 'bg-amber-50 text-amber-900 font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      Tiếng Việt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('en')}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition ${
                        locale === 'en'
                          ? 'bg-amber-50 text-amber-900 font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </>
              )}
            </div>

            <Link
              href="/wishlist"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Heart className="w-6 h-6 text-gray-700" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={onCartClick}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-gray-700 hover:text-amber-900 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <button
                type="button"
                onClick={() => {
                  onAuthClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-amber-900 hover:text-amber-800 transition flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                {t('signin')}
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
