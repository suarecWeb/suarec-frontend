export type BadgeType = "LEVEL" | "ACHIEVEMENT";

export interface Badge {
  id: number;
  key: string;
  name: string;
  type: BadgeType;
  level_required: string | null;
  description: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface UserBadge {
  id: number;
  userId: number;
  badgeId: number;
  awarded_at: string;
  badge: Badge;
}

export interface BadgeCatalog {
  badges: Badge[];
}
