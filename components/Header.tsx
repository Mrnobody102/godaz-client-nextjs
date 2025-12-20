'use client';

import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onAuthClick: () => void;
}

export function Header({ cartCount, onCartClick, onAuthClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-amber-900 rounded-lg flex items-center justify-center text-white">
              TM
            </div>
            <span className="text-amber-900">Thủ Công Mỹ Nghệ</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-amber-900 transition">
              Trang Chủ
            </a>
            <a href="#products" className="text-gray-700 hover:text-amber-900 transition">
              Sản Phẩm
            </a>
            <a href="#about" className="text-gray-700 hover:text-amber-900 transition">
              Giới Thiệu
            </a>
            <a href="#contact" className="text-gray-700 hover:text-amber-900 transition">
              Liên Hệ
            </a>
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
                  <span className="hidden md:inline text-gray-700">{user.name}</span>
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
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng Xuất
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
                <span>Đăng Nhập</span>
              </button>
            )}

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
            <a
              href="#home"
              className="block py-2 text-gray-700 hover:text-amber-900 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trang Chủ
            </a>
            <a
              href="#products"
              className="block py-2 text-gray-700 hover:text-amber-900 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sản Phẩm
            </a>
            <a
              href="#about"
              className="block py-2 text-gray-700 hover:text-amber-900 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Giới Thiệu
            </a>
            <a
              href="#contact"
              className="block py-2 text-gray-700 hover:text-amber-900 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Liên Hệ
            </a>
            {!user && (
              <button
                onClick={() => {
                  onAuthClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-amber-900 hover:text-amber-800 transition flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                Đăng Nhập
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}