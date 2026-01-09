import api from "./axios_config";
import Cookies from "js-cookie";
import { Badge, UserBadge } from "@/interfaces/badge.interface";

export class BadgeService {
  static async getBadgeCatalog(): Promise<Badge[]> {
    const response = await api.get("suarec/badges/catalog");
    return response.data;
  }

  static async getUserBadges(): Promise<UserBadge[]> {
    const token = Cookies.get("token");

    const response = await api.get("suarec/users/me/badges", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
}
