import { z } from 'zod';

export const cartItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
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

export type Cart = z.infer<typeof cartSchema>;
