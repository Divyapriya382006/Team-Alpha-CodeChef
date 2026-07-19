import { z } from 'zod';

export const addGalleryItemSchema = z.object({
  imageUrl: z.string().url('Invalid image URL').max(500, 'Image URL too long'),
  caption: z.string().max(1000, 'Caption too long').optional().nullable(),
});

export type AddGalleryItemInput = z.infer<typeof addGalleryItemSchema>;
