export type LevelName = "Nuevo" | "Activo" | "Profesional" | "Elite";

export interface LevelMetrics {
  successfulContracts: number;
  cancelledContracts: number;
  cancelRate: number;
  ratingAvg: number;
  ratingCount: number;
}

export interface LevelRequirement {
  key: string;
  current: number;
  target: number;
  pass: boolean;
}

export interface NextGoal {
  key: string;
  label: string;
  current: number | null;
  target: number | null;
  remaining: number | null;
  pct: number;
}

export interface RecommendedAction {
  cta_key: string;
  label: string;
  deep_link: string | null;
}

export interface PeriodInfo {
  from: string | null;
  to: string | null;
}

export interface UserLevel {
  userId: number;
  period: string;
  current_period: PeriodInfo;
  metrics: LevelMetrics;
  current_level: LevelName;
  next_level: LevelName | null;
  requirements: LevelRequirement[];
  progress_pct: number;
  missing_requirements: string[];
  next_goal: NextGoal;
  recommended_action: RecommendedAction;
}
