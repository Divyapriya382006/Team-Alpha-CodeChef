import { Router } from 'express';
import { galleryController } from './controller';
import { authenticate } from '@/middleware/authenticate';
import { validate } from '@/middleware/validate';
import { addGalleryItemSchema } from './schemas';

export const clubGalleryRoutes = Router({ mergeParams: true });

clubGalleryRoutes.post(
  '/',
  authenticate,
  validate(addGalleryItemSchema),
  galleryController.addGalleryItem,
);

export const galleryRoutes = Router();

galleryRoutes.get('/', galleryController.listGalleryItems);
galleryRoutes.delete('/:id', authenticate, galleryController.deleteGalleryItem);
