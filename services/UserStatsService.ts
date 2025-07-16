import api from "./axios_config";
import Cookies from "js-cookie";
import {
  UserStats,
  UserStatsDto,
  StatsTimeRange,
} from "@/interfaces/user-stats.interface";

export class UserStatsService {
  static async getUserStats(
    params: UserStatsDto = { timeRange: StatsTimeRange.LAST_MONTH },
  ): Promise<UserStats> {
    const token = Cookies.get("token");

    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    const response = await api.get("suarec/users/me/stats", {
      params: cleanParams,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
}

export { StatsTimeRange };
export type { UserStats, UserStatsDto };
