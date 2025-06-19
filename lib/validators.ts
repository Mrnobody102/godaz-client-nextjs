import { z } from 'zod';
import { formatNumberWithDecimal } from './utils';

export const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    'Price must have exactly two decimal places'
  );

// Schema for inserting products
export const insertProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  category: z.string().min(3, 'Category must be at least 3 characters'),
  brand: z.string().min(3, 'Brand must be at least 3 characters'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, 'Product must have at least one image'),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Item ID is required'),
  name: z.string().min(1, 'Item name is required'),
  image: z.string().url('Invalid image URL'),
  slug: z.string().min(1, 'Item slug is required'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
});

export const cartSchema = z.object({
  itemsPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Items price must be a valid currency amount'),
  shippingPrice: z
    .string()
    .regex(
      /^\d+(\.\d{1,2})?$/,
      'Shipping price must be a valid currency amount'
    ),
  taxPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Tax price must be a valid currency amount'),
  totalPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Total price must be a valid currency amount'),
  sessionCartId: z.string().min(1, 'Session cart ID is required'),
  items: z.array(cartItemSchema),
  userId: z.string().nullable().optional(),
});

// Schema for signing in a user
export const signInFormSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .min(3, 'Email must be at least 3 characters'),
  password: z.string().min(3, 'Password must be at least 3 characters'),
});
