import { Request, Response, NextFunction } from 'express';
import { leaderboardService } from './service';
import { successResponse } from '@/lib/envelope';

export const leaderboardController = {
  async getClubsLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const sort = req.query.sort as 'points' | 'events' | 'projects' | undefined;
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

      const result = await leaderboardService.getClubsLeaderboard({ search, sort, page, limit });
      res.status(200).json(successResponse('OK', result));
    } catch (err) {
      next(err);
    }
  },

  async getStudentsLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const sort = req.query.sort as 'points' | 'events' | 'projects' | undefined;
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));

      const result = await leaderboardService.getStudentsLeaderboard({ search, sort, page, limit });
      res.status(200).json(successResponse('OK', result));
    } catch (err) {
      next(err);
    }
  },
};
