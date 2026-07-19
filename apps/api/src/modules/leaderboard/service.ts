import { prisma } from '@/lib/prisma';

export interface LeaderboardParams {
  search?: string;
  sort?: 'points' | 'events' | 'projects';
  page: number;
  limit: number;
}

export const leaderboardService = {
  async getClubsLeaderboard({ search, sort, page, limit }: LeaderboardParams) {
    const clubs = await prisma.club.findMany({
      where: search
        ? { name: { contains: search, mode: 'insensitive' } }
        : {},
      select: {
        id: true,
        name: true,
        logoUrl: true,
        events: {
          where: { status: 'APPROVED' },
          select: { id: true },
        },
        memberships: {
          select: { id: true },
        },
        projects: {
          select: { id: true },
        },
      },
    });

    const entries = clubs.map((club) => {
      const eventsConducted = club.events.length;
      const activeMembers = club.memberships.length;
      const projectsCount = club.projects.length;
      const totalPoints = eventsConducted * 20 + activeMembers * 5 + projectsCount * 10;

      return {
        clubId: club.id,
        name: club.name,
        logoUrl: club.logoUrl,
        totalPoints,
        eventsConducted,
        activeMembers,
        projectsCount, // Keep for sorting
      };
    });

    // Sort
    if (sort === 'events') {
      entries.sort((a, b) => b.eventsConducted - a.eventsConducted);
    } else if (sort === 'projects') {
      entries.sort((a, b) => b.projectsCount - a.projectsCount);
    } else {
      entries.sort((a, b) => b.totalPoints - a.totalPoints);
    }

    const total = entries.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginated = entries.slice(offset, offset + limit);

    // Map to final shape with rank (excluding internal fields like projectsCount if not in type,
    // but the frontend supports LeaderboardClubEntry which doesn't strictly forbid extra fields)
    const items = paginated.map((entry, index) => ({
      rank: offset + index + 1,
      clubId: entry.clubId,
      name: entry.name,
      logoUrl: entry.logoUrl,
      totalPoints: entry.totalPoints,
      eventsConducted: entry.eventsConducted,
      activeMembers: entry.activeMembers,
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  async getStudentsLeaderboard({ search, sort, page, limit }: LeaderboardParams) {
    const students = await prisma.user.findMany({
      where: {
        platformRole: 'STUDENT',
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              {
                clubMemberships: {
                  some: {
                    club: { name: { contains: search, mode: 'insensitive' } },
                  },
                },
              },
            ]
          : undefined,
      },
      select: {
        id: true,
        name: true,
        clubMemberships: {
          select: {
            club: {
              select: { name: true },
            },
          },
        },
        eventRegistrations: {
          select: { id: true },
        },
        projects: {
          select: { id: true },
        },
      },
    });

    const entries = students.map((student) => {
      const eventsParticipated = student.eventRegistrations.length;
      const projectsPublished = student.projects.length;
      const points = eventsParticipated * 10 + projectsPublished * 25;
      const clubName = student.clubMemberships[0]?.club?.name ?? '—';

      return {
        userId: student.id,
        name: student.name,
        clubName,
        points,
        eventsParticipated,
        projectsPublished,
      };
    });

    // Sort
    if (sort === 'events') {
      entries.sort((a, b) => b.eventsParticipated - a.eventsParticipated);
    } else if (sort === 'projects') {
      entries.sort((a, b) => b.projectsPublished - a.projectsPublished);
    } else {
      entries.sort((a, b) => b.points - a.points);
    }

    const total = entries.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginated = entries.slice(offset, offset + limit);

    const items = paginated.map((entry, index) => ({
      ...entry,
      rank: offset + index + 1,
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },
};
