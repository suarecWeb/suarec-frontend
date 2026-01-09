"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { UserStatsService } from "@/services/UserStatsService";
import { StatsTimeRange, UserStats } from "@/interfaces/user-stats.interface";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  DollarSign,
  Briefcase,
  PieChart,
  ChevronDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import toast from "react-hot-toast";
import {
  StatsSummaryCard,
  StatsSuccessOverview,
  StatsGrowthCard,
  StatsPeriodInfo,
  StatsCallToAction,
  StatsLevelAndBadges,
} from "@/components/stats";

const StatsPage = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<StatsTimeRange>(
    StatsTimeRange.LAST_MONTH,
  );
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UserStatsService.getUserStats({
        timeRange: selectedTimeRange,
      });
      setStats(data);
    } catch (err) {
      toast.error("Error al cargar las estadísticas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTimeRange]);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      loadStats();
    } catch (error) {
      console.error("Error al decodificar token:", error);
      router.push("/auth/login");
    }
  }, [router, selectedTimeRange, loadStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
  };

  const getTimeRangeLabel = (range: StatsTimeRange) => {
    const labels = {
      [StatsTimeRange.LAST_WEEK]: "Última semana",
      [StatsTimeRange.LAST_MONTH]: "Último mes",
      [StatsTimeRange.LAST_3_MONTHS]: "Últimos 3 meses",
      [StatsTimeRange.LAST_6_MONTHS]: "Últimos 6 meses",
      [StatsTimeRange.LAST_YEAR]: "Último año",
      [StatsTimeRange.ALL_TIME]: "Todo el tiempo",
    };
    return labels[range];
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#097EEC] to-[#0A6BC7] text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Mira lo que has logrado con SUAREC
                </h1>
                <p className="text-blue-100">
                  Estos son tus resultados increíbles en nuestra plataforma.
                  ¡Sigue así!
                </p>
              </div>

              <div className="flex gap-3">
                {/* Time Range Selector */}
                <div className="relative">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) =>
                      setSelectedTimeRange(e.target.value as StatsTimeRange)
                    }
                    className="appearance-none bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    {(Object.values(StatsTimeRange) as StatsTimeRange[]).map(
                      (range) => (
                        <option
                          key={range}
                          value={range}
                          className="text-gray-900"
                        >
                          {getTimeRangeLabel(range)}
                        </option>
                      ),
                    )}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-4 pb-12">
          {stats && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatsSummaryCard
                  icon={DollarSign}
                  value={formatCurrency(stats.totalEarnings, {
                    showCurrency: true,
                  })}
                  title="Dinero Generado"
                  description="¡Esto es lo que has ganado con SUAREC!"
                  bgColor="bg-green-100"
                  iconColor="text-green-600"
                  valueColor="text-green-600"
                />
                <StatsSummaryCard
                  icon={Briefcase}
                  value={stats.totalContractsCompleted}
                  title="Contratos Exitosos"
                  description="¡Cada proyecto completado es un éxito más!"
                  bgColor="bg-blue-100"
                  iconColor="text-blue-600"
                  valueColor="text-blue-600"
                />
                <StatsSummaryCard
                  icon={PieChart}
                  value={stats.totalPublications}
                  title="Servicios Publicados"
                  description="¡Tu presencia en SUAREC está creciendo!"
                  bgColor="bg-purple-100"
                  iconColor="text-purple-600"
                  valueColor="text-purple-600"
                />
              </div>

              {/* Level and Badges */}
              <StatsLevelAndBadges period={selectedTimeRange} />

              {/* Motivational Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <StatsSuccessOverview
                  totalEarnings={stats.totalEarnings}
                  totalContractsCompleted={stats.totalContractsCompleted}
                  totalPublications={stats.totalPublications}
                />
                <StatsGrowthCard
                  totalEarnings={stats.totalEarnings}
                  totalContractsCompleted={stats.totalContractsCompleted}
                  totalPublications={stats.totalPublications}
                />
              </div>

              {/* Period Information */}
              <StatsPeriodInfo
                selectedTimeRange={selectedTimeRange}
                totalContractsCompleted={stats.totalContractsCompleted}
                totalPublications={stats.totalPublications}
                getTimeRangeLabel={getTimeRangeLabel}
              />

              {/* Call to Action */}
              <StatsCallToAction totalEarnings={stats.totalEarnings} />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default StatsPage;
