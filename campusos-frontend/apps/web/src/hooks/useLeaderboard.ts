import { useQuery } from "@tanstack/react-query";
import { leaderboardApi, type LeaderboardParams } from "../lib/api/leaderboard";

export function useLeaderboardClubs(params: LeaderboardParams) {
  return useQuery({
    queryKey: ["leaderboard", "clubs", params],
    queryFn: () => leaderboardApi.clubs(params),
  });
}

export function useLeaderboardStudents(params: LeaderboardParams) {
  return useQuery({
    queryKey: ["leaderboard", "students", params],
    queryFn: () => leaderboardApi.students(params),
  });
}
