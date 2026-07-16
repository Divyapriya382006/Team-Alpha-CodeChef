// No leaderboard endpoint exists anywhere in FINAL_API_CONTRACT.md — "points" and "rank" aren't
// part of the documented schema. These types back a mock-only page built ahead of the backend,
// per an explicit request ("db will be integrated later").

export type LeaderboardSortMetric = "points" | "events" | "projects";

export interface LeaderboardClubEntry {
  rank: number;
  clubId: string;
  name: string;
  logoUrl: string | null;
  totalPoints: number;
  eventsConducted: number;
  activeMembers: number;
}

export interface LeaderboardStudentEntry {
  rank: number;
  userId: string;
  name: string;
  clubName: string;
  points: number;
  eventsParticipated: number;
  projectsPublished: number;
}
