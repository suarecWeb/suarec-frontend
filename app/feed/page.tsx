"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  AlertCircle,
  User,
  Heart,
  MessageSquare,
  Share2,
  Send,
  MoreHorizontal,
  Handshake,
  Briefcase,
  Building2,
  Tag,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import PublicationFeedCard from "@/components/publication-feed-card";
import Navbar from "@/components/navbar";
import PublicationModalManager from "@/components/publication-modal-manager";
import AdvancedFilters from "@/components/advanced-filters";
import PublicationService from "@/services/PublicationsService";
import {
  Publication,
  PublicationType,
} from "@/interfaces/publication.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import Link from "next/link";
import { ContractService } from "@/services/ContractService";
import { Contract } from "@/interfaces/contract.interface";
import toast from "react-hot-toast";

export default function FeedPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isVerify, setIsVerify] = useState<Boolean | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [publicationBids, setPublicationBids] = useState<{
    [key: string]: { contracts: Contract[]; totalBids: number };
  }>({});

  // Estado para filtros avanzados
  const [filters, setFilters] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    sortBy: "created_at",
    sortOrder: "DESC",
  });

  // Obtener información del usuario al cargar
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUserId(decoded.id);
        setIsVerify(decoded.isVerify);
        setUserRoles(decoded.roles.map((role) => role.name));
      } catch (error) {
        console.error("Error al decodificar token:", error);
      }
    }
  }, []);

  // Función para cargar ofertas de publicaciones
  const loadPublicationBids = async (publicationIds: string[]) => {
    try {
      const bidsPromises = publicationIds.map(async (id) => {
        try {
          const bidsData = await ContractService.getPublicationBids(id);
          return { id, data: bidsData };
        } catch (error) {
          console.error(`Error loading bids for publication ${id}:`, error);
          return { id, data: { contracts: [], totalBids: 0 } };
        }
      });

      const bidsResults = await Promise.all(bidsPromises);
      const bidsMap: {
        [key: string]: { contracts: Contract[]; totalBids: number };
      } = {};

      bidsResults.forEach(({ id, data }) => {
        bidsMap[id] = data;
      });

      setPublicationBids(bidsMap);
    } catch (error) {
      console.error("Error loading publication bids:", error);
    }
  };

  // Función para cargar publicaciones con filtros avanzados
  const fetchPublications = useCallback(
    async (newFilters?: PaginationParams) => {
      try {
        setLoading(true);
        const currentFilters = newFilters || filters;
        console.log("🔍 Frontend - Sending filters:", currentFilters);

        const response =
          await PublicationService.getPublications(currentFilters);

        setPublications(response.data.data);
        setPagination(response.data.meta);

        // Cargar ofertas para las publicaciones
        const publicationIds = response.data.data.map(
          (pub: Publication) => pub.id!,
        );
        await loadPublicationBids(publicationIds);
      } catch (err) {
        console.error("Error fetching publications:", err);
        toast.error("Error al cargar las publicaciones");
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  // Función para manejar cambios en los filtros
  const handleFiltersChange = (newFilters: PaginationParams) => {
    setFilters(newFilters);
  };

  // Función para aplicar filtros
  const handleApplyFilters = () => {
    fetchPublications(filters);
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    const clearedFilters: PaginationParams = {
      page: 1,
      limit: 10,
      sortBy: "created_at",
      sortOrder: "DESC",
    };
    setFilters(clearedFilters);
    fetchPublications(clearedFilters);
  };

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  // Función para manejar cuando se crea una nueva publicación
  const handlePublicationCreated = () => {
    // Recargar las publicaciones para mostrar la nueva
    fetchPublications();
  };

  // Ya no necesitamos filtrar localmente - el backend maneja todos los filtros
  // Las publicaciones ya vienen filtradas del backend
  const filteredPublications = publications;

  // Obtener categorías únicas (ahora se obtienen del backend)
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<PublicationType[]>([]);

  // Cargar categorías y tipos disponibles del backend
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [categoriesResponse, typesResponse] = await Promise.all([
          PublicationService.getAvailableCategories(),
          PublicationService.getAvailableTypes(),
        ]);

        setAvailableCategories(categoriesResponse.data);
        setAvailableTypes(typesResponse.data);
      } catch (error) {
        console.error("Error loading filter options:", error);
      }
    };

    loadFilterOptions();
  }, []);

  // Función para obtener el texto del tipo de publicación
  const getPublicationTypeText = (type: PublicationType) => {
    switch (type) {
      case PublicationType.SERVICE:
        return "Servicios Ofrecidos";
      case PublicationType.SERVICE_REQUEST:
        return "Servicios Solicitados";
      case PublicationType.JOB:
        return "Vacantes de Trabajo";
      default:
        return "Publicación";
    }
  };

  // Función para obtener el icono del tipo de publicación
  const getPublicationTypeIcon = (type: PublicationType) => {
    switch (type) {
      case PublicationType.SERVICE:
        return <Briefcase className="h-4 w-4" />;
      case PublicationType.SERVICE_REQUEST:
        return <Handshake className="h-4 w-4" />;
      case PublicationType.JOB:
        return <Building2 className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  // Formatear fecha
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Hace unos minutos";
    if (diffInHours < 24)
      return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
    if (diffInHours < 48) return "Ayer";
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  function verifyCreatePublication() {
    if (!User) {
      toast.error("Debes iniciar sesión para crear una publicación");
      return false;
    }
    if (!isVerify) {
      toast.error(
        "Debes verificar tu cuenta antes de crear una publicación. Por favor, realiza la verificación en tu perfil.",
      );
      return false;
    }
    return setIsCreateModalOpen(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden main-content">
      <Navbar />

      {/* Header azul extendido como en perfil */}
      <div className="bg-[#097EEC] text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-eras-bold">
            Feed de Publicaciones
          </h1>
          <p className="mt-2 text-blue-100 font-eras text-sm md:text-base">
            Descubre las mejores oportunidades laborales y servicios
          </p>
        </div>
      </div>

      {/* Content con margen negativo para que se superponga */}
      <div className="container mx-auto px-4 -mt-6 pb-12 overflow-x-hidden">
        <div className="grid lg:grid-cols-4 gap-4 lg:gap-8 w-full max-w-full">
          {/* Sidebar izquierdo - Filtros principales */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/20 rounded-xl shadow-sm border border-slate-200/60 p-6 sticky top-24 hover:shadow-md hover:border-blue-300/60 transition-all duration-200">
              <h3 className="text-lg font-eras-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-500/10">
                  <svg
                    className="h-4 w-4 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                Filtros
              </h3>

              {/* Componente de filtros avanzados */}
              <AdvancedFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>

          {/* Main Content - Feed (centro) */}
          <div className="lg:col-span-2 col-span-full w-full max-w-full overflow-x-hidden">
            {/* Filtros móviles */}
            <div className="lg:hidden bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 w-full max-w-full">
              <AdvancedFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Create Post Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 w-full max-w-full hover:shadow-xl hover:-translate-y-1 hover:border-gray-200 transition-all duration-300 cursor-pointer">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 font-eras-semibold text-gray-900 text-sm sm:text-base">
                  ¿Qué estás buscando hoy?
                </div>
                <Button
                  onClick={() => verifyCreatePublication()}
                  className="bg-[#097EEC] hover:bg-[#097EEC]/90 text-white font-eras-medium w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Publicación
                </Button>
              </div>
            </div>
            {/* Feed */}
            <div className="space-y-4 lg:space-y-6 w-full max-w-full overflow-x-hidden">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 w-full max-w-full"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ))
              ) : error ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8 text-center w-full max-w-full">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-eras-bold text-gray-900 mb-2">
                    Error al cargar
                  </h3>
                  <p className="text-gray-600 font-eras">{error}</p>
                </div>
              ) : filteredPublications.length > 0 ? (
                filteredPublications.map((publication) => (
                  <PublicationFeedCard
                    key={publication.id}
                    publication={publication}
                    userRole={userRoles[0]}
                    publicationBids={publicationBids[publication.id!]}
                    onPublicationDeleted={fetchPublications}
                  />
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8 text-center w-full max-w-full">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-eras-bold text-gray-900 mb-2">
                    No se encontraron publicaciones
                  </h3>
                  <p className="text-gray-600 font-eras">
                    Intenta ajustar los filtros o busca con otros términos
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredPublications.length > 0 && pagination.totalPages > 1 && (
              <div className="mt-8 w-full max-w-full overflow-x-hidden">
                <div className="text-center mb-4 text-sm text-gray-600">
                  Página {pagination.page} de {pagination.totalPages}
                </div>
                <div className="w-full max-w-full overflow-x-auto">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) =>
                      fetchPublications({
                        page,
                        limit: pagination.limit,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar derecho - Filtros de categoría y estadísticas */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-xl shadow-sm border border-green-200/60 p-6 sticky top-24 hover:shadow-md transition-all duration-200">
              <h3 className="text-lg font-eras-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gray-100">
                  <svg
                    className="h-4 w-4 text-gray-700"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 3v18h18v-2H5V3H3zm4 14h2V9H7v8zm4 0h2V7h-2v10zm4 0h2V5h-2v12z" />
                  </svg>
                </div>
                Estadísticas
              </h3>

              {/* Estadísticas rápidas */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="font-eras">Total publicaciones</span>
                  <span className="font-eras-bold">{pagination.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-eras">Página actual</span>
                  <span className="font-eras-bold">
                    {pagination.page} de {pagination.totalPages}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de crear publicación */}
      <PublicationModalManager
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPublicationCreated={handlePublicationCreated}
      />
    </div>
  );
}
