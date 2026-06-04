export interface Product {
  id: string | number;
  cartKey?: string;
  variantId?: number | null;
  variantName?: string | null;
  sku?: string | null;
  brand?: string | null;
  name: string;
  category: string;
  categorySlug?: string;
  price: string | number;
  unit: string;
  image: string;
  description: string;
  stock?: number;
  featured?: boolean;
  galleryImages?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ProductImage {
  id?: number | null;
  imageUrl: string;
  altText?: string | null;
  sortOrder?: number | null;
}

export interface ProductVariant {
  id: number;
  name: string;
  sku?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  active: boolean;
  sortOrder?: number | null;
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
  {
    id: '9',
    name: 'Bộ Ấm Chén Gốm Men Lam',
    category: 'Gốm Sứ',
    categorySlug: 'gom-su',
    price: 520000,
    unit: 'bộ',
    image:
      'https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?auto=format&fit=crop&w=1200&q=80',
    description: 'Bộ ấm chén men lam vẽ tay mang phong cách cổ truyền.',
    stock: 12,
    featured: true,
  },
  {
    id: '10',
    name: 'Mẹt Tre Trang Trí',
    category: 'Mây Tre',
    categorySlug: 'may-tre',
    price: 130000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?auto=format&fit=crop&w=1200&q=80',
    description: 'Mẹt tre thủ công dùng trang trí hoặc bày biện món ăn.',
    stock: 43,
    featured: false,
  },
  {
    id: '11',
    name: 'Hộp Gỗ Sơn Mài',
    category: 'Gỗ',
    categorySlug: 'go',
    price: 390000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80',
    description: 'Hộp gỗ sơn mài tinh xảo, phù hợp làm quà tặng cao cấp.',
    stock: 19,
    featured: true,
  },
  {
    id: '12',
    name: 'Khăn Thêu Hoa Sen',
    category: 'Thêu',
    categorySlug: 'theu',
    price: 210000,
    unit: 'chiếc',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
    description: 'Khăn thêu tay họa tiết hoa sen mềm mại, thanh lịch.',
    stock: 36,
    featured: false,
  },
  {
    id: '13',
    name: 'Đĩa Gốm Vẽ Tay',
    category: 'Gốm Sứ',
    categorySlug: 'gom-su',
    price: 260000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80',
    description: 'Đĩa gốm trang trí vẽ tay, điểm nhấn cho bàn ăn Việt.',
    stock: 28,
    featured: false,
  },
  {
    id: '14',
    name: 'Kệ Tre Mini',
    category: 'Mây Tre',
    categorySlug: 'may-tre',
    price: 340000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80',
    description: 'Kệ tre mini đa năng, phù hợp trang trí không gian nhỏ.',
    stock: 15,
    featured: true,
  },
  {
    id: '15',
    name: 'Tượng Gỗ Phúc Lộc',
    category: 'Gỗ',
    categorySlug: 'go',
    price: 680000,
    unit: 'tượng',
    image:
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80',
    description: 'Tượng gỗ chạm khắc thủ công mang ý nghĩa phong thủy.',
    stock: 9,
    featured: true,
  },
  {
    id: '16',
    name: 'Túi Mây Đan Nắp Gỗ',
    category: 'Mây Tre',
    categorySlug: 'may-tre',
    price: 295000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80',
    description: 'Túi mây đan thời trang, phối nắp gỗ độc đáo.',
    stock: 22,
    featured: false,
  },
  {
    id: '17',
    name: 'Tranh Thêu Phong Cảnh',
    category: 'Thêu',
    categorySlug: 'theu',
    price: 560000,
    unit: 'bức',
    image:
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
    description: 'Tranh thêu phong cảnh Việt Nam, tỉ mỉ từng đường kim.',
    stock: 11,
    featured: true,
  },
  {
    id: '18',
    name: 'Bát Gỗ Ăn Cơm',
    category: 'Gỗ',
    categorySlug: 'go',
    price: 120000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1541013406133-94ed77ee8ba8?auto=format&fit=crop&w=1200&q=80',
    description: 'Bát gỗ tự nhiên hoàn thiện bằng dầu thực vật an toàn.',
    stock: 60,
    featured: false,
  },
  {
    id: '19',
    name: 'Lọ Hương Gốm Men Rạn',
    category: 'Gốm Sứ',
    categorySlug: 'gom-su',
    price: 470000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1599833114852-724119b27cd0?auto=format&fit=crop&w=1200&q=80',
    description: 'Lọ hương men rạn cổ điển, thích hợp không gian thờ cúng.',
    stock: 13,
    featured: false,
  },
  {
    id: '20',
    name: 'Giỏ Picnic Mây',
    category: 'Mây Tre',
    categorySlug: 'may-tre',
    price: 410000,
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?auto=format&fit=crop&w=1200&q=80',
    description: 'Giỏ picnic mây đan thủ công chắc chắn, phong cách vintage.',
    stock: 18,
    featured: true,
  },
];
