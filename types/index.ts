import { z } from 'zod';
import {
  cartItemSchema,
  cartSchema,
  insertProductSchema,
} from '@/lib/validators';

export type Cart = z.infer<typeof cartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: string;
  numReviews: number;
  createdAt: Date;
};
