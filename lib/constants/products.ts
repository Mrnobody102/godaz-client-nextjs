export interface Product {
  id: string | number;
  name: string;
  category: string;
  price: string | number;
  unit: string;
  image: string;
  description: string;
}

export const handicraftProducts: Product[] = [
  {
    id: '1',
    name: 'Bình Gốm Sứ Bát Tràng',
    category: 'Gốm Sứ',
    price: '350000',
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1599833114852-724119b27cd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGFydHxlbnwxfHx8fDE3NjYyMTI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Bình gốm truyền thống làm thủ công từ làng Bát Tràng',
  },
  {
    id: '2',
    name: 'Giỏ Tre Đan Thủ Công',
    category: 'Mây Tre',
    price: '180000',
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3ZlbiUyMGJhc2tldCUyMGNyYWZ0fGVufDF8fHx8MTc2NjIzNzQ4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Giỏ tre đan tay tinh xảo, thân thiện môi trường',
  },
  {
    id: '3',
    name: 'Tranh Thêu Tay',
    category: 'Thêu',
    price: '450000',
    unit: 'bức',
    image:
      'https://images.unsplash.com/photo-1759607236409-1df137ecb3b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kaWNyYWZ0JTIwaGFuZG1hZGUlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NjYyMzc0Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Tranh thêu tay truyền thống với hoa văn tinh tế',
  },
  {
    id: '4',
    name: 'Tô Gốm Sơn Mài',
    category: 'Gốm Sứ',
    price: '280000',
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1599833114852-724119b27cd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGFydHxlbnwxfHx8fDE3NjYyMTI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Tô gốm sơn mài độc đáo, mang phong cách Việt Nam',
  },
  {
    id: '5',
    name: 'Đèn Lồng Tre',
    category: 'Mây Tre',
    price: '220000',
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1759142761123-9ab45592b5f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYW1ib28lMjBoYW5kaWNyYWZ0JTIwcHJvZHVjdHN8ZW58MXx8fHwxNzY2MjM3NDgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Đèn lồng tre handmade, tạo không gian ấm cúng',
  },
  {
    id: '6',
    name: 'Khay Gỗ Khắc Hoa Văn',
    category: 'Gỗ',
    price: '320000',
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1661873482206-4e2fa0ba455d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYW5kbWFkZSUyMHdvb2RlbiUyMGNyYWZ0fGVufDF8fHx8MTc2NjEzODE4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Khay gỗ khắc hoa văn thủ công, sang trọng và tinh xảo',
  },
  {
    id: '7',
    name: 'Lọ Hoa Gốm Xanh Cổ',
    category: 'Gốm Sứ',
    price: '420000',
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1599833114852-724119b27cd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZXJhbWljJTIwcG90dGVyeSUyMGFydHxlbnwxfHx8fDE3NjYyMTI2OTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Lọ hoa gốm xanh cổ điển, phong cách truyền thống',
  },
  {
    id: '8',
    name: 'Rổ Mây Tự Nhiên',
    category: 'Mây Tre',
    price: '150000',
    unit: 'cái',
    image:
      'https://images.unsplash.com/photo-1596626417050-39c7f6ddd2c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3ZlbiUyMGJhc2tldCUyMGNyYWZ0fGVufDF8fHx8MTc2NjIzNzQ4MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Rổ mây tự nhiên đan thủ công, đa năng tiện dụng',
  },
];
