import * as mock from "../mock/leaderboard";
import type { Pagination } from "../../types";
import type { LeaderboardClubEntry, LeaderboardStudentEntry } from "../../types/leaderboard";
import { get, USE_MOCK } from "../api";

export type { LeaderboardParams } from "../mock/leaderboard";

export const leaderboardApi = {
  clubs: (params: mock.LeaderboardParams = {}): Promise<{ items: LeaderboardClubEntry[]; pagination: Pagination }> =>
    USE_MOCK ? mock.mockListLeaderboardClubs(params) : get("/leaderboard/clubs", params as Record<string, unknown>),

  students: (params: mock.LeaderboardParams = {}): Promise<{ items: LeaderboardStudentEntry[]; pagination: Pagination }> =>
    USE_MOCK ? mock.mockListLeaderboardStudents(params) : get("/leaderboard/students", params as Record<string, unknown>),
};
