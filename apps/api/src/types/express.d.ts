import { PlatformRole } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      platformRole: PlatformRole;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
