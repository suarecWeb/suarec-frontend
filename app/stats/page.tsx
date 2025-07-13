"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { UserStatsService } from "@/services/UserStatsService";
import { StatsTimeRange, UserStats } from "@/interfaces/user-stats.interface";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  DollarSign,
  Briefcase,
  Users,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Target,
  ChevronDown,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";

const StatsPage = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<StatsTimeRange>(StatsTimeRange.LAST_MONTH);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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
  }, [router, selectedTimeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UserStatsService.getUserStats({ timeRange: selectedTimeRange });
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
      setError("Error al cargar las estadísticas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
  };

  const getTimeRangeLabel = (range: StatsTimeRange) => {
    const labels = {
      [StatsTimeRange.LAST_WEEK]: 'Última semana',
      [StatsTimeRange.LAST_MONTH]: 'Último mes',
      [StatsTimeRange.LAST_3_MONTHS]: 'Últimos 3 meses',
      [StatsTimeRange.LAST_6_MONTHS]: 'Últimos 6 meses',
      [StatsTimeRange.LAST_YEAR]: 'Último año',
      [StatsTimeRange.ALL_TIME]: 'Todo el tiempo'
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
                <h1 className="text-3xl font-bold mb-2">Mira lo que has logrado con SUAREC</h1>
                <p className="text-blue-100">
                  Estos son tus resultados increíbles en nuestra plataforma. ¡Sigue así!
                </p>
              </div>

              <div className="flex gap-3">
                {/* Time Range Selector */}
                <div className="relative">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value as StatsTimeRange)}
                    className="appearance-none bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    {(Object.values(StatsTimeRange) as StatsTimeRange[]).map((range) => (
                      <option key={range} value={range} className="text-gray-900">
                        {getTimeRangeLabel(range)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
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
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -mr-10 -mt-10"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.totalEarnings, { showCurrency: true })}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">💰 Dinero Generado</h3>
                  <p className="text-xs text-green-600 font-medium">
                    ¡Esto es lo que has ganado con SUAREC!
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      {stats.totalContractsCompleted}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">🎯 Contratos Exitosos</h3>
                  <p className="text-xs text-blue-600 font-medium">
                    ¡Cada proyecto completado es un éxito más!
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <PieChart className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {stats.totalPublications}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">📢 Servicios Publicados</h3>
                  <p className="text-xs text-purple-600 font-medium">
                    ¡Tu presencia en SUAREC está creciendo!
                  </p>
                </div>
              </div>

              {/* Motivational Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Success Overview */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 shadow-sm border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    🏆 Tu Éxito en SUAREC
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white/70 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">💵 Ingresos promedio por contrato:</span>
                        <span className="font-bold text-green-600 text-lg">
                          {stats.totalContractsCompleted > 0
                            ? formatCurrency(stats.totalEarnings / stats.totalContractsCompleted, { showCurrency: true })
                            : formatCurrency(0, { showCurrency: true })
                          }
                        </span>
                      </div>
                      <p className="text-sm text-green-700">
                        ¡Excelente! Cada contrato te genera buenos ingresos
                      </p>
                    </div>

                    <div className="bg-white/70 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">📊 Tasa de éxito:</span>
                        <span className="font-bold text-blue-600 text-lg">
                          {stats.totalPublications > 0
                            ? Math.round((stats.totalContractsCompleted / stats.totalPublications) * 100)
                            : 0
                          }%
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        {stats.totalPublications > 0 && stats.totalContractsCompleted > 0
                          ? "¡Increíble conversión de publicaciones a contratos!"
                          : "¡Publica más servicios para aumentar tus oportunidades!"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Motivation & Growth */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    🚀 Tu Crecimiento
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-white/70 rounded-lg">
                      <div className="text-3xl mb-2">
                        {stats.totalEarnings > 0 ? "🌟" : "💪"}
                      </div>
                      <h4 className="font-bold text-purple-800 mb-2">
                        {stats.totalEarnings > 0
                          ? "¡Eres un profesional establecido!"
                          : "¡Tu aventura en SUAREC está comenzando!"
                        }
                      </h4>
                      <p className="text-sm text-purple-700">
                        {stats.totalEarnings > 0
                          ? "Has demostrado tu valor en nuestra plataforma. ¡Sigue construyendo tu reputación!"
                          : "¡Estás a un paso de generar tus primeros ingresos con SUAREC!"
                        }
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-white/70 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {stats.totalContractsCompleted}
                        </div>
                        <p className="text-xs text-purple-700">Contratos exitosos</p>
                      </div>
                      <div className="text-center p-3 bg-white/70 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {stats.totalPublications}
                        </div>
                        <p className="text-xs text-purple-700">Servicios ofrecidos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Period Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  📅 Período de Análisis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600 mb-1">
                      {getTimeRangeLabel(selectedTimeRange)}
                    </div>
                    <p className="text-sm text-indigo-700">Período seleccionado</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {stats.totalContractsCompleted > 0 ? '🟢 Activo' : '🟡 Preparándote'}
                    </div>
                    <p className="text-sm text-green-700">Estado en SUAREC</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {stats.totalPublications > 0 ? '📈 Creciendo' : '🌱 Comenzando'}
                    </div>
                    <p className="text-sm text-blue-700">Tu progreso</p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-[#097EEC] to-[#0A6BC7] rounded-xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">
                  {stats.totalEarnings > 0
                    ? "¡Sigue Creciendo con SUAREC! 🎉"
                    : "¡Tu Potencial te Espera! ✨"
                  }
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white/10 rounded-lg p-4">
                    <Briefcase className="h-8 w-8 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Más Contratos</h4>
                    <p className="text-sm text-blue-100">
                      Publica más servicios para atraer nuevos clientes
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <DollarSign className="h-8 w-8 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Mayores Ingresos</h4>
                    <p className="text-sm text-blue-100">
                      Optimiza tus precios y ofrece servicios premium
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Más Clientes</h4>
                    <p className="text-sm text-blue-100">
                      Mejora tu perfil y obtén mejores calificaciones
                    </p>
                  </div>
                </div>
                <p className="text-blue-100">
                  Con SUAREC, cada día es una nueva oportunidad de crecer profesionalmente y aumentar tus ingresos.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default StatsPage;
