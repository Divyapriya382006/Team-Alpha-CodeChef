import { delay, mockClubMembershipsDb, mockClubsDb, mockEventsDb, mockProjectsDb, mockUsersDb, paginate } from "./db";
import type { LeaderboardClubEntry, LeaderboardSortMetric, LeaderboardStudentEntry } from "../../types/leaderboard";

// No FINAL_API_CONTRACT.md endpoint backs any of this. Club/student event & project counts below
// are real derived numbers from the existing mock database; "points" is a placeholder scoring
// formula with no backend definition yet. Swap this whole file out once a real /leaderboard
// endpoint exists.

export interface LeaderboardParams {
  search?: string;
  sort?: LeaderboardSortMetric;
  page?: number;
  limit?: number;
}

interface ClubEntryInternal {
  clubId: string;
  name: string;
  logoUrl: string | null;
  totalPoints: number;
  eventsConducted: number;
  activeMembers: number;
  projectsCount: number;
}

function buildClubEntries(): ClubEntryInternal[] {
  return mockClubsDb.map((club) => {
    const eventsConducted = mockEventsDb.filter((e) => e.clubId === club.id && e.status === "APPROVED").length;
    const activeMembers = mockClubMembershipsDb.filter((m) => m.clubId === club.id).length;
    const projectsCount = mockProjectsDb.filter((p) => p.clubId === club.id).length;
    return {
      clubId: club.id,
      name: club.name,
      logoUrl: club.logoUrl,
      totalPoints: eventsConducted * 20 + activeMembers * 5 + projectsCount * 10,
      eventsConducted,
      activeMembers,
      projectsCount,
    };
  });
}

function clubSortValue(entry: ClubEntryInternal, sort: LeaderboardSortMetric): number {
  if (sort === "events") return entry.eventsConducted;
  if (sort === "projects") return entry.projectsCount;
  return entry.totalPoints;
}

export async function mockListLeaderboardClubs(params: LeaderboardParams = {}) {
  let entries = buildClubEntries();
  if (params.search) {
    const q = params.search.toLowerCase();
    entries = entries.filter((e) => e.name.toLowerCase().includes(q));
  }
  const sort = params.sort ?? "points";
  entries = [...entries].sort((a, b) => clubSortValue(b, sort) - clubSortValue(a, sort));
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const { items, pagination } = paginate(entries, page, limit);
  const ranked: LeaderboardClubEntry[] = items.map((e, i) => ({
    rank: (page - 1) * limit + i + 1,
    clubId: e.clubId,
    name: e.name,
    logoUrl: e.logoUrl,
    totalPoints: e.totalPoints,
    eventsConducted: e.eventsConducted,
    activeMembers: e.activeMembers,
  }));
  return delay({ items: ranked, pagination });
}

interface StudentEntryInternal {
  userId: string;
  name: string;
  clubName: string;
  points: number;
  eventsParticipated: number;
  projectsPublished: number;
}

function buildStudentEntries(): StudentEntryInternal[] {
  return mockUsersDb
    .filter((u) => u.platformRole === "STUDENT")
    .map((u) => {
      const eventsParticipated = mockEventsDb.filter((e) => e.registrations.includes(u.id)).length;
      const projectsPublished = mockProjectsDb.filter((p) => p.createdBy === u.id).length;
      const membership = mockClubMembershipsDb.find((m) => m.userId === u.id);
      const clubName = membership ? (mockClubsDb.find((c) => c.id === membership.clubId)?.name ?? "—") : "—";
      return {
        userId: u.id,
        name: u.name,
        clubName,
        points: eventsParticipated * 10 + projectsPublished * 25,
        eventsParticipated,
        projectsPublished,
      };
    });
}

function studentSortValue(entry: StudentEntryInternal, sort: LeaderboardSortMetric): number {
  if (sort === "events") return entry.eventsParticipated;
  if (sort === "projects") return entry.projectsPublished;
  return entry.points;
}

export async function mockListLeaderboardStudents(params: LeaderboardParams = {}) {
  let entries = buildStudentEntries();
  if (params.search) {
    const q = params.search.toLowerCase();
    entries = entries.filter((e) => e.name.toLowerCase().includes(q) || e.clubName.toLowerCase().includes(q));
  }
  const sort = params.sort ?? "points";
  entries = [...entries].sort((a, b) => studentSortValue(b, sort) - studentSortValue(a, sort));
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const { items, pagination } = paginate(entries, page, limit);
  const ranked: LeaderboardStudentEntry[] = items.map((e, i) => ({ ...e, rank: (page - 1) * limit + i + 1 }));
  return delay({ items: ranked, pagination });
}
