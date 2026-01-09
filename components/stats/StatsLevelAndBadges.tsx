"use client";

import { useState, useEffect } from "react";
import { LevelService } from "@/services/LevelService";
import { BadgeService } from "@/services/BadgeService";
import { UserLevel } from "@/interfaces/level.interface";
import { UserBadge, Badge } from "@/interfaces/badge.interface";
import { UserLevelCard } from "./UserLevelCard";
import { UserBadgesCard } from "./UserBadgesCard";
import { AlertCircle } from "lucide-react";

interface StatsLevelAndBadgesProps {
  period: string;
}

export const StatsLevelAndBadges: React.FC<StatsLevelAndBadgesProps> = ({
  period,
}) => {
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

        // Convertir el período al formato del backend
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
        console.error("Error loading level and badges:", err);
        setError("Error al cargar niveles y badges");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md mb-8">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-500" />
          <div>
            <h3 className="text-yellow-800 font-medium">
              Información no disponible
            </h3>
            <p className="text-yellow-700 text-sm">
              No se pudieron cargar los datos de niveles y badges. Intenta
              recargar la página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {levelData && <UserLevelCard levelData={levelData} />}
      <UserBadgesCard userBadges={userBadges} catalogBadges={catalogBadges} />
    </div>
  );
};
