export enum StatsTimeRange {
  LAST_WEEK = 'LAST_WEEK',
  LAST_MONTH = 'LAST_MONTH',
  LAST_3_MONTHS = 'LAST_3_MONTHS',
  LAST_6_MONTHS = 'LAST_6_MONTHS',
  LAST_YEAR = 'LAST_YEAR',
  ALL_TIME = 'ALL_TIME'
}

export interface UserStatsDto {
  timeRange?: StatsTimeRange;
}

// Interfaz básica que coincide con la respuesta del backend
export interface UserStats {
  userId: number;
  totalEarnings: number;
  totalContractsCompleted: number;
  totalPublications: number;
}
