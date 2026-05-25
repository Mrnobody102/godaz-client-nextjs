'use client';

import { ShoppingCart, Menu, X, User, LogOut, Globe, Heart, Package } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useTranslations as useNextIntlTranslations,
  useLocale,
} from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import useWishlistStore from '@/stores/wishlistStore';

function useSafeTranslations(ns: string) {
  try {
    return useNextIntlTranslations(ns);
  } catch {
    // Fallback translator when provider is not available (during dev or redirect)
    const fallbackMap: Record<string, string> = {
      'header.title': 'Thủ Công Mỹ Nghệ',
      'header.nav.home': 'Trang Chủ',
      'header.nav.products': 'Sản Phẩm',
      'header.nav.about': 'Giới Thiệu',
      'header.nav.contact': 'Liên Hệ',
      'header.signin': 'Đăng Nhập',
      'header.logout': 'Đăng Xuất',
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

  const handleLanguageChange = (newLocale: string) => {
    router.replace({ pathname: pathname as any }, { locale: newLocale });
    setLangMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-amber-900 rounded-lg flex items-center justify-center text-white font-bold">
              TM
            </div>
            <span className="text-xl font-bold text-amber-900">
              {t('title')}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/#home"
              className="text-gray-700 hover:text-amber-900 transition"
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/#products"
              className="text-gray-700 hover:text-amber-900 transition"
            >
              {t('nav.products')}
            </Link>
            <Link
              href="/#about"
              className="text-gray-700 hover:text-amber-900 transition"
            >
              {t('nav.about')}
            </Link>
            <Link
              href="/#contact"
              className="text-gray-700 hover:text-amber-900 transition"
            >
              {t('nav.contact')}
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
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
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        {locale === 'vi' ? 'Đơn hàng của tôi' : 'My Orders'}
                      </Link>
                      <button
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
                onClick={onAuthClick}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-amber-900 hover:bg-amber-50 rounded-lg transition"
              >
                <User className="w-5 h-5" />
                <span>{t('signin')}</span>
              </button>
            )}

            {/* Language Selector */}
            <div className="relative">
              <button
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
                  ></div>
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-2 z-20">
                    <button
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

            {/* Mobile Menu Button */}
            <button
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <Link
              href="/#home"
              className="block py-2 text-gray-700 hover:text-amber-900 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/#products"
              className="block py-2 text-gray-700 hover:text-amber-900 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.products')}
            </Link>
            <Link
              href="/#about"
              className="block py-2 text-gray-700 hover:text-amber-900 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.about')}
            </Link>
            <Link
              href="/#contact"
              className="block py-2 text-gray-700 hover:text-amber-900 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.contact')}
            </Link>
            {!user && (
              <button
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
