import api from "./axios_config";
import Cookies from "js-cookie";
import { UserLevel } from "@/interfaces/level.interface";

export class LevelService {
  static async getUserLevel(period: string = "month"): Promise<UserLevel> {
    const token = Cookies.get("token");

    const response = await api.get("suarec/users/me/level", {
      params: { period },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
}
