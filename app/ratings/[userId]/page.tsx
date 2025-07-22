// app/ratings/[userId]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import StarRating from "@/components/star-rating";
import RatingModal from "@/components/rating-modal";
import RoleGuard from "@/components/role-guard";
import { Pagination } from "@/components/ui/pagination";
import RatingService, {
  Rating,
  RatingStats,
  RatingCategory,
} from "@/services/RatingService";
import { UserService } from "@/services/UsersService";
import { User } from "@/interfaces/user.interface";
import {
  Star,
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  Award,
  Plus,
  Filter,
  ArrowLeft,
  Loader2,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import toast from "react-hot-toast";

const UserRatingsPageContent = () => {
  const params = useParams();
  const userId = parseInt(
    Array.isArray(params.userId) ? params.userId[0] : params.userId,
  );

  const [user, setUser] = useState<User | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error("Error al decodificar token:", error);
      }
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await UserService.getUserById(userId);
      setUser(response.data);
    } catch (err) {
      toast.error("Error al cargar la información del usuario");
    }
  }, [userId]);

  const fetchRatings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await RatingService.getUserRatings(
        userId,
        pagination.page,
        pagination.limit,
      );

      let filteredRatings = response.data;
      if (selectedCategory !== "all") {
        filteredRatings = response.data.filter(
          (rating: Rating) => rating.category === selectedCategory,
        );
      }

      setRatings(filteredRatings);
      setPagination(response.meta);
    } catch (err) {
      console.error("Error al cargar calificaciones:", err);
      setError("Error al cargar las calificaciones");
    } finally {
      setLoading(false);
    }
  }, [userId, pagination.page, pagination.limit, selectedCategory]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await RatingService.getUserRatingStats(userId);
      setStats(response);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchRatings();
      fetchStats();
    }
  }, [userId, pagination.page, fetchUserData, fetchRatings, fetchStats]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case RatingCategory.SERVICE:
        return "Servicio";
      case RatingCategory.EMPLOYER:
        return "Empleador";
      case RatingCategory.EMPLOYEE:
        return "Empleado";
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case RatingCategory.SERVICE:
        return "bg-blue-100 text-blue-800";
      case RatingCategory.EMPLOYER:
        return "bg-green-100 text-green-800";
      case RatingCategory.EMPLOYEE:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canRateUser = () => {
    return currentUserId && currentUserId !== userId;
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href="/publications"
                className="inline-flex items-center text-blue-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Volver
              </Link>
            </div>
            <h1 className="text-3xl font-bold">
              Calificaciones de {user?.name || "Usuario"}
            </h1>
            <p className="mt-2 text-blue-100">
              Opiniones y reseñas de la comunidad
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#097EEC]" />
                  Estadísticas de Calificaciones
                </h3>

                {stats ? (
                  <div className="space-y-6">
                    {/* Overall rating */}
                    <div className="text-center p-4 bg-[#097EEC]/5 rounded-lg">
                      <div className="text-3xl font-bold text-[#097EEC] mb-2">
                        {stats.averageRating.toFixed(1)}
                      </div>
                      <StarRating
                        rating={stats.averageRating}
                        readonly
                        size="lg"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Basado en {stats.totalRatings} calificación
                        {stats.totalRatings !== 1 ? "es" : ""}
                      </p>
                    </div>

                    {/* Rating distribution */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">
                        Distribución
                      </h4>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((starCount) => (
                          <div
                            key={starCount}
                            className="flex items-center gap-2"
                          >
                            <span className="text-sm w-6">{starCount}</span>
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#097EEC] h-2 rounded-full"
                                style={{
                                  width: `${
                                    stats.totalRatings > 0
                                      ? (stats.ratingDistribution[starCount] /
                                          stats.totalRatings) *
                                        100
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">
                              {stats.ratingDistribution[starCount] || 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Category stats */}
                    {Object.keys(stats.categoryStats).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3">
                          Por Categoría
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(stats.categoryStats).map(
                            ([category, data]) => (
                              <div
                                key={category}
                                className="flex justify-between items-center"
                              >
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}
                                >
                                  {getCategoryLabel(category)}
                                </span>
                                <div className="flex items-center gap-2">
                                  <StarRating
                                    rating={data.average}
                                    readonly
                                    size="sm"
                                  />
                                  <span className="text-sm text-gray-600">
                                    ({data.count})
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      No hay estadísticas disponibles
                    </p>
                  </div>
                )}

                {/* Rate user button */}
                {canRateUser() && (
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="w-full mt-6 bg-[#097EEC] text-white px-4 py-3 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Calificar Usuario
                  </button>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                {/* Filter and actions */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-gray-400" />
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none"
                      >
                        <option value="all">Todas las categorías</option>
                        {Object.values(RatingCategory).map((category) => (
                          <option key={category} value={category}>
                            {getCategoryLabel(category)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-red-800 font-medium">Error</h3>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {loading ? (
                  <div className="py-12 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
                  </div>
                ) : (
                  <>
                    {/* Ratings list */}
                    {ratings.length > 0 ? (
                      <div className="space-y-6">
                        {ratings.map((rating) => (
                          <div
                            key={rating.id}
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-[#097EEC]/10 rounded-full p-2">
                                  <Users className="h-5 w-5 text-[#097EEC]" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {rating.reviewer.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatDate(rating.created_at)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(rating.category)}`}
                                >
                                  {getCategoryLabel(rating.category)}
                                </span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <StarRating rating={rating.stars} readonly />
                            </div>

                            {rating.comment && (
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                                  <p className="text-gray-700 text-sm">
                                    {rating.comment}
                                  </p>
                                </div>
                              </div>
                            )}

                            {rating.workContract && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                  Trabajo relacionado:{" "}
                                  {rating.workContract.title}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <div className="bg-gray-50 inline-flex rounded-full p-6 mb-4">
                          <Star className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          No hay calificaciones disponibles
                        </h3>
                        <p className="mt-2 text-gray-500">
                          {selectedCategory === "all"
                            ? "Este usuario aún no ha recibido calificaciones."
                            : `No hay calificaciones para la categoría "${getCategoryLabel(selectedCategory)}".`}
                        </p>
                      </div>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <Pagination
                          currentPage={pagination.page}
                          totalPages={pagination.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && currentUserId && user && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          revieweeId={userId}
          revieweeName={user.name}
          reviewerId={currentUserId}
          onRatingSubmitted={() => {
            fetchRatings();
            fetchStats();
          }}
        />
      )}
    </>
  );
};

const UserRatingsPage = () => {
  return (
    <RoleGuard allowedRoles={["ADMIN", "BUSINESS", "PERSON"]}>
      <UserRatingsPageContent />
    </RoleGuard>
  );
};

export default UserRatingsPage;
