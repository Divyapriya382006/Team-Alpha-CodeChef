import * as mock from "../mock/leaderboard";
import type { Pagination } from "../../types";
import type { LeaderboardClubEntry, LeaderboardStudentEntry } from "../../types/leaderboard";

export type { LeaderboardParams } from "../mock/leaderboard";

// Unlike every other lib/api/*.ts file, there's no USE_MOCK branch here — no real endpoint is
// documented for this yet ("db will be integrated later"), so it's mock-only until one exists.
export const leaderboardApi = {
  clubs: (params: mock.LeaderboardParams = {}): Promise<{ items: LeaderboardClubEntry[]; pagination: Pagination }> =>
    mock.mockListLeaderboardClubs(params),

  students: (params: mock.LeaderboardParams = {}): Promise<{ items: LeaderboardStudentEntry[]; pagination: Pagination }> =>
    mock.mockListLeaderboardStudents(params),
};
