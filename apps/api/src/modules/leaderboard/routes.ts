import { Router } from 'express';
import { leaderboardController } from './controller';

const router = Router();

router.get('/clubs', leaderboardController.getClubsLeaderboard);
router.get('/students', leaderboardController.getStudentsLeaderboard);

export default router;
