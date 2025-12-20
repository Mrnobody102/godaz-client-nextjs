import { z } from 'zod';
import { formatNumberWithDecimal } from './utils';

export const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    'errors.validation.currency_format'
  );

// Schema for inserting products
export const insertProductSchema = z.object({
  name: z.string().min(3, 'errors.validation.name_min'),
  slug: z.string().min(3, 'errors.validation.slug_min'),
  category: z.string().min(3, 'errors.validation.category_min'),
  brand: z.string().min(3, 'errors.validation.brand_min'),
  description: z.string().min(3, 'errors.validation.description_min'),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, 'errors.validation.images_min'),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'errors.validation.item_id_required'),
  name: z.string().min(1, 'errors.validation.item_name_required'),
  image: z.string().url('errors.validation.invalid_image_url'),
  slug: z.string().min(1, 'errors.validation.item_slug_required'),
  price: z.number().positive('errors.validation.price_positive'),
  quantity: z.number().int().min(0, 'errors.validation.quantity_non_negative'),
});

export const cartSchema = z.object({
  itemsPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'errors.validation.currency_format'),
  shippingPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'errors.validation.currency_format'),
  taxPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'errors.validation.currency_format'),
  totalPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'errors.validation.currency_format'),
  sessionCartId: z.string().min(1, 'errors.validation.session_cart_required'),
  items: z.array(cartItemSchema),
  userId: z.string().nullable().optional(),
});

// Schema for signing in a user
export const signInFormSchema = z.object({
  email: z
    .string()
    .email('errors.validation.invalid_email')
    .min(3, 'errors.validation.email_min'),
  password: z.string().min(3, 'errors.validation.password_min'),
});
