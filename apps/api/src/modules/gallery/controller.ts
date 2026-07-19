import { Request, Response, NextFunction } from 'express';
import { galleryService } from './service';
import { successResponse } from '@/lib/envelope';

export const galleryController = {
  async listGalleryItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clubId = req.query.clubId as string | undefined;
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

      const result = await galleryService.listGalleryItems({ clubId, page, limit });
      res.status(200).json(successResponse('OK', result));
    } catch (err) {
      next(err);
    }
  },

  async addGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const caller = req.user!;
      const result = await galleryService.addGalleryItem(
        req.params.id, // club UUID from route param
        caller.id,
        caller.platformRole === 'SUPER_ADMIN',
        req.body,
      );
      res.status(201).json(successResponse('Gallery item added', result));
    } catch (err) {
      next(err);
    }
  },

  async deleteGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const caller = req.user!;
      await galleryService.deleteGalleryItem(
        req.params.id, // gallery item UUID from route param
        caller.id,
        caller.platformRole === 'SUPER_ADMIN',
      );
      res.status(200).json(successResponse('Gallery item deleted', {}));
    } catch (err) {
      next(err);
    }
  },
};
