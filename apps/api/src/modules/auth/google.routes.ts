import { Router } from 'express';
import passport from '../../lib/passport';
import { signToken } from '../../lib/jwt';

const router = Router();

const googleEnabled = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

router.get('/google', (req, res, next) => {
  if (!googleEnabled) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=google_not_configured`
    );
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    if (!googleEnabled) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_not_configured`
      );
    }
    next();
  },
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
  }),
  (req, res) => {
    try {
      const user = req.user as { id: string; email: string; platformRole: string };

      // CRITICAL: must use `userId` as the field name — authenticate.ts reads payload.userId
      const token = signToken({ userId: user.id, email: user.email, role: user.platformRole });

      res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}`);
    } catch {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=token_failed`);
    }
  }
);

export default router;
