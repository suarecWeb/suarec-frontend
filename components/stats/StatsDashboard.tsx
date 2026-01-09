"use client";

import { useState, useEffect } from "react";
import { UserStats } from "@/interfaces/user-stats.interface";
import { UserLevel } from "@/interfaces/level.interface";
import { UserBadge, Badge } from "@/interfaces/badge.interface";
import {
  DollarSign,
  Briefcase,
  PieChart,
  Star,
  TrendingUp,
  Award,
  Target,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { LevelProgressTimeline } from "./LevelProgressTimeline";
import { MetricsGrid } from "./MetricsGrid";
import { UserBadgesCard } from "./UserBadgesCard";
import { formatCurrency } from "@/lib/formatCurrency";

interface StatsDashboardProps {
  stats: UserStats;
  levelData: UserLevel | null;
  userBadges: UserBadge[];
  catalogBadges: Badge[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  stats,
  levelData,
  userBadges,
  catalogBadges,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const metrics = levelData
    ? [
        {
          label: "Contratos Exitosos",
          current: levelData.metrics.successfulContracts,
          previous: 0,
          color: "#3B82F6",
        },
        {
          label: "Calificación Promedio",
          current: levelData.metrics.ratingAvg,
          previous: 0,
          format: (v: number) => v.toFixed(1),
          color: "#F59E0B",
        },
        {
          label: "Total Calificaciones",
          current: levelData.metrics.ratingCount,
          previous: 0,
          color: "#8B5CF6",
        },
        {
          label: "Tasa Cancelación",
          current: levelData.metrics.cancelRate * 100,
          previous: 0,
          format: (v: number) => `${v.toFixed(1)}%`,
          color: "#EF4444",
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={DollarSign}
          title="Ingresos Totales"
          value={formatCurrency(stats.totalEarnings, { showCurrency: true })}
          subtitle="Dinero generado en SUAREC"
          progress={
            levelData
              ? Math.min((stats.totalEarnings / 1000000) * 100, 100)
              : undefined
          }
          color="#10B981"
          bgGradient="from-green-50 to-emerald-100"
        />
        <StatCard
          icon={Briefcase}
          title="Contratos Completados"
          value={stats.totalContractsCompleted}
          subtitle="Proyectos exitosos"
          progress={
            levelData
              ? (levelData.metrics.successfulContracts / 50) * 100
              : undefined
          }
          color="#3B82F6"
          bgGradient="from-blue-50 to-cyan-100"
        />
        <StatCard
          icon={PieChart}
          title="Publicaciones"
          value={stats.totalPublications}
          subtitle="Servicios activos"
          progress={
            levelData
              ? Math.min((stats.totalPublications / 20) * 100, 100)
              : undefined
          }
          color="#8B5CF6"
          bgGradient="from-purple-50 to-pink-100"
        />
      </div>

      {/* Level Progress Timeline */}
      {levelData && (
        <LevelProgressTimeline
          currentLevel={levelData.current_level}
          progress={levelData.progress_pct}
        />
      )}

      {/* Level Details & Next Goal */}
      {levelData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Level Card */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 shadow-xl text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                  Nivel Actual
                </p>
                <h2 className="text-4xl font-bold mt-2">
                  {levelData.current_level}
                </h2>
              </div>
              <div className="text-6xl">
                {levelData.current_level === "Elite" && "👑"}
                {levelData.current_level === "Profesional" && "🏆"}
                {levelData.current_level === "Activo" && "⚡"}
                {levelData.current_level === "Nuevo" && "🌱"}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Progreso al siguiente nivel
                  </span>
                  <span className="text-lg font-bold">
                    {levelData.progress_pct.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${levelData.progress_pct}%` }}
                  />
                </div>
              </div>
              {levelData.next_level && (
                <p className="text-sm opacity-90">
                  Siguiente nivel:{" "}
                  <span className="font-bold">{levelData.next_level}</span>
                </p>
              )}
            </div>
          </div>

          {/* Next Goal Card */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Próximo Objetivo
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  {levelData.next_goal.label}
                </p>
                {levelData.next_goal.remaining !== null &&
                  levelData.next_goal.remaining > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Actual: {levelData.next_goal.current}</span>
                        <span>Meta: {levelData.next_goal.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${levelData.next_goal.pct}%` }}
                        />
                      </div>
                      <p className="text-sm font-bold text-orange-600">
                        Faltan: {levelData.next_goal.remaining}
                      </p>
                    </div>
                  )}
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Acción Recomendada:
                </p>
                <p className="text-sm text-gray-600">
                  {levelData.recommended_action.label}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      {levelData && metrics.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Métricas Detalladas
          </h3>
          <MetricsGrid metrics={metrics} />
        </div>
      )}

      {/* Badges Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="h-6 w-6 text-[#097EEC]" />
          Tus Logros
        </h3>
        <UserBadgesCard userBadges={userBadges} catalogBadges={catalogBadges} />
      </div>

      {/* Requirements Section */}
      {levelData &&
        levelData.next_level &&
        levelData.requirements.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Requisitos para {levelData.next_level}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {levelData.requirements.map((req, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${
                    req.pass
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 capitalize">
                      {req.key.replace(/_/g, " ")}
                    </span>
                    {req.pass ? (
                      <span className="text-green-600 font-bold">✓</span>
                    ) : (
                      <span className="text-gray-400 font-bold">○</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {req.current} / {req.target}
                    </span>
                    <span
                      className={`font-bold ${
                        req.pass ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {req.pass ? "Completado" : "En progreso"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};
