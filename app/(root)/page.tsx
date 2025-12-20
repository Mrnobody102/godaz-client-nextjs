'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductCard, Product } from '@/components/ProductCard';
import { Cart, CartItem } from '@/components/Cart';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';

const handicraftProducts: Product[] = [
  {
    id: 1,
    name: 'Bình Gốm Sứ Bát Tràng',
    category: 'Gốm Sứ',
    price: 350000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1599833114852-724119b27cd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGFydHxlbnwxfHx8fDE3NjYyMTI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Bình gốm truyền thống làm thủ công từ làng Bát Tràng',
  },
  {
    id: 2,
    name: 'Giỏ Tre Đan Thủ Công',
    category: 'Mây Tre',
    price: 180000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3ZlbiUyMGJhc2tldCUyMGNyYWZ0fGVufDF8fHx8MTc2NjIzNzQ4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Giỏ tre đan tay tinh xảo, thân thiện môi trường',
  },
  {
    id: 3,
    name: 'Tranh Thêu Tay',
    category: 'Thêu',
    price: 450000,
    unit: 'bức',
    image:
      'https://images.unsplash.com/photo-1759607236409-1df137ecb3b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kaWNyYWZ0JTIwaGFuZG1hZGUlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NjYyMzc0Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Tranh thêu tay truyền thống với hoa văn tinh tế',
  },
  {
    id: 4,
    name: 'Tô Gốm Sơn Mài',
    category: 'Gốm Sứ',
    price: 280000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1599833114852-724119b27cd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGFydHxlbnwxfHx8fDE3NjYyMTI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Tô gốm sơn mài độc đáo, mang phong cách Việt Nam',
  },
  {
    id: 5,
    name: 'Đèn Lồng Tre',
    category: 'Mây Tre',
    price: 220000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1759142761123-9ab45592b5f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW1ib28lMjBoYW5kaWNyYWZ0JTIwcHJvZHVjdHN8ZW58MXx8fHwxNzY2MjM3NDgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Đèn lồng tre handmade, tạo không gian ấm cúng',
  },
  {
    id: 6,
    name: 'Khay Gỗ Khắc Hoa Văn',
    category: 'Gỗ',
    price: 320000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1661873482206-4e2fa0ba455d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMHdvb2RlbiUyMGNyYWZ0fGVufDF8fHx8MTc2NjEzODE4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Khay gỗ khắc hoa văn thủ công, sang trọng và tinh xảo',
  },
  {
    id: 7,
    name: 'Lọ Hoa Gốm Xanh Cổ',
    category: 'Gốm Sứ',
    price: 420000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1599833114852-724119b27cd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGFydHxlbnwxfHx8fDE3NjYyMTI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Lọ hoa gốm xanh cổ điển, phong cách truyền thống',
  },
  {
    id: 8,
    name: 'Rổ Mây Tự Nhiên',
    category: 'Mây Tre',
    price: 150000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3ZlbiUyMGJhc2tldCUyMGNyYWZ0fGVufDF8fHx8MTc2NjIzNzQ4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Rổ mây tự nhiên đan thủ công, đa năng tiện dụng',
  },
];

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      removeItem(id);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const removeItem = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
      />
      <Hero />

      {/* Products Section */}
      <section id="products" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-gray-900 mb-4">
              Sản Phẩm Thủ Công Mỹ Nghệ
            </h2>
            <p className="text-gray-600">
              Những sản phẩm thủ công tinh xảo được làm bằng tay từ nghệ nhân
              lành nghề
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {handicraftProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-amber-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="mb-2">100% Thủ Công</h3>
              <p className="text-amber-100">
                Sản phẩm được làm hoàn toàn bằng tay bởi nghệ nhân lành nghề
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎨</span>
              </div>
              <h3 className="mb-2">Độc Đáo</h3>
              <p className="text-amber-100">
                Mỗi sản phẩm đều có nét riêng, mang đậm dấu ấn văn hóa Việt
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">♻️</span>
              </div>
              <h3 className="mb-2">Thân Thiện Môi Trường</h3>
              <p className="text-amber-100">
                Sử dụng nguyên liệu tự nhiên, an toàn và bền vững
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl text-gray-900 mb-6">Về Chúng Tôi</h2>
          <p className="text-gray-600 text-lg mb-4">
            Chúng tôi là đơn vị chuyên cung cấp các sản phẩm thủ công mỹ nghệ
            truyền thống Việt Nam.
          </p>
          <p className="text-gray-600 text-lg">
            Với đội ngũ nghệ nhân tâm huyết, chúng tôi cam kết mang đến những
            sản phẩm chất lượng cao, bền đẹp và đậm chất văn hóa dân tộc.
          </p>
        </div>
      </section>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
