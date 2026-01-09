"use client";

import { useState, useEffect } from "react";
import { UserStats } from "@/interfaces/user-stats.interface";
import { UserLevel } from "@/interfaces/level.interface";
import { UserBadge, Badge } from "@/interfaces/badge.interface";
import { LevelService } from "@/services/LevelService";
import { BadgeService } from "@/services/BadgeService";
import { StatsDashboard } from "./StatsDashboard";
import { Loader2, AlertCircle } from "lucide-react";

interface StatsDashboardContainerProps {
  stats: UserStats;
  period: string;
}

export const StatsDashboardContainer: React.FC<
  StatsDashboardContainerProps
> = ({ stats, period }) => {
  const [levelData, setLevelData] = useState<UserLevel | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [catalogBadges, setCatalogBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const periodMap: Record<string, string> = {
          LAST_WEEK: "week",
          LAST_MONTH: "month",
          LAST_3_MONTHS: "quarter",
          LAST_6_MONTHS: "quarter",
          LAST_YEAR: "year",
          ALL_TIME: "total",
        };
        const backendPeriod = periodMap[period] || "month";

        const [level, badges, catalog] = await Promise.all([
          LevelService.getUserLevel(backendPeriod),
          BadgeService.getUserBadges(),
          BadgeService.getBadgeCatalog(),
        ]);

        setLevelData(level);
        setUserBadges(badges);
        setCatalogBadges(catalog);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("No se pudieron cargar algunos datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#097EEC] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !levelData) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
          <div>
            <h3 className="text-yellow-800 font-semibold">
              Dashboard en modo limitado
            </h3>
            <p className="text-yellow-700 text-sm mt-1">
              Mostrando estadísticas básicas. Algunas funciones avanzadas no
              están disponibles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StatsDashboard
      stats={stats}
      levelData={levelData}
      userBadges={userBadges}
      catalogBadges={catalogBadges}
    />
  );
};
