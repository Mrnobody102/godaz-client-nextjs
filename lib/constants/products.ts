export interface Product {
  id: string | number;
  name: string;
  category: string;
  categorySlug?: string;
  price: string | number;
  unit: string;
  image: string;
  description: string;
  stock?: number;
  featured?: boolean;
}

export const handicraftProducts: Product[] = [
  {
    id: '1',
    name: 'Bình Gốm Sứ Bát Tràng',
    category: 'Gốm Sứ',
    categorySlug: 'gom-su',
    price: 350000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1599833114852-724119b27cd0?auto=format&fit=crop&w=1200&q=80',
    description: 'Bình gốm truyền thống làm thủ công từ làng Bát Tràng.',
    stock: 24,
    featured: true,
  },
  {
    id: '2',
    name: 'Giỏ Tre Đan Thủ Công',
    category: 'Mây Tre',
    categorySlug: 'may-tre',
    price: 180000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?auto=format&fit=crop&w=1200&q=80',
    description: 'Giỏ tre đan tay tinh xảo, thân thiện môi trường.',
    stock: 48,
    featured: true,
  },
  {
    id: '3',
    name: 'Tranh Thêu Tay',
    category: 'Thêu',
    categorySlug: 'theu',
    price: 450000,
    unit: 'bức',
    image:
      'https://images.unsplash.com/photo-1759607236409-1df137ecb3b6?auto=format&fit=crop&w=1200&q=80',
    description: 'Tranh thêu tay truyền thống với hoa văn tinh tế.',
    stock: 16,
    featured: true,
  },
  {
    id: '4',
    name: 'Tô Gốm Sơn Mài',
    category: 'Gốm Sứ',
    categorySlug: 'gom-su',
    price: 280000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1599833114852-724119b27cd0?auto=format&fit=crop&w=1200&q=80',
    description: 'Tô gốm sơn mài độc đáo, mang phong cách Việt Nam.',
    stock: 32,
    featured: false,
  },
  {
    id: '5',
    name: 'Đèn Lồng Tre',
    category: 'Mây Tre',
    categorySlug: 'may-tre',
    price: 220000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1759142761123-9ab45592b5f6?auto=format&fit=crop&w=1200&q=80',
    description: 'Đèn lồng tre handmade tạo không gian ấm cúng.',
    stock: 27,
    featured: true,
  },
  {
    id: '6',
    name: 'Khay Gỗ Khắc Hoa Văn',
    category: 'Gỗ',
    categorySlug: 'go',
    price: 320000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1661873482206-4e2fa0ba455d?auto=format&fit=crop&w=1200&q=80',
    description: 'Khay gỗ khắc hoa văn thủ công, sang trọng và tinh xảo.',
    stock: 21,
    featured: false,
  },
  {
    id: '7',
    name: 'Lọ Hoa Gốm Xanh Cổ',
    category: 'Gốm Sứ',
    categorySlug: 'gom-su',
    price: 420000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1599833114852-724119b27cd0?auto=format&fit=crop&w=1200&q=80',
    description: 'Lọ hoa gốm xanh cổ điển, phong cách truyền thống.',
    stock: 14,
    featured: false,
  },
  {
    id: '8',
    name: 'Rổ Mây Tự Nhiên',
    category: 'Mây Tre',
    categorySlug: 'may-tre',
    price: 150000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?auto=format&fit=crop&w=1200&q=80',
    description: 'Rổ mây tự nhiên đan thủ công, đa năng tiện dụng.',
    stock: 54,
    featured: false,
  },
];
