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
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import PublicationFeedCard from "@/components/publication-feed-card";
import Navbar from "@/components/navbar";
import PublicationModalManager from "@/components/publication-modal-manager";
import FeedBanner from "@/components/feed-banner";
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
  const [showAllPublications, setShowAllPublications] = useState(false);

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
      <Navbar
        showSearch={true}
        searchValue={filters.search}
        onSearchChange={(value) => {
          const newFilters = {
            ...filters,
            search: value || undefined,
            page: 1,
          };
          setFilters(newFilters);
          // Auto-aplicar búsqueda después de un pequeño delay
          setTimeout(() => fetchPublications(newFilters), 300);
        }}
      />

      {/* Header azul extendido como en perfil */}
      <div className="bg-[#097EEC] text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-eras-bold">
            Explora servicios y oportunidades.
          </h1>
          <p className="mt-2 text-blue-100 font-eras text-sm md:text-base">
            Encuentra personas y empresas listas para contratar, vender o
            comprar.
          </p>
        </div>
      </div>

      {/* Content con margen negativo para que se superponga */}
      <div className="container mx-auto px-4 -mt-6 pb-12 overflow-x-hidden">
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-8 w-full max-w-full">
          {/* Main Content - Feed (centro) */}
          <div className="lg:col-span-3 col-span-full w-full max-w-full overflow-x-hidden">
            {/* Create Post Button with Type Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 w-full max-w-4xl mx-auto hover:shadow-xl hover:-translate-y-1 hover:border-gray-200 transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 font-eras-semibold text-gray-900 text-sm sm:text-base">
                  ¿Qué servicio necesitas hoy?
                </div>

                {/* Filtro de Tipo */}
                <div className="relative">
                  <select
                    value={filters.type || ""}
                    onChange={(e) => {
                      const typeValue = e.target.value as PublicationType | "";
                      const newFilters = {
                        ...filters,
                        type: typeValue || undefined,
                        page: 1,
                      };
                      setFilters(newFilters);
                      fetchPublications(newFilters);
                    }}
                    className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-all outline-none appearance-none pr-8 cursor-pointer hover:border-gray-300"
                  >
                    <option value="">Todos los tipos</option>
                    <option value={PublicationType.SERVICE}>
                      Servicios (Oferta)
                    </option>
                    <option value={PublicationType.SERVICE_REQUEST}>
                      Solicitudes de Servicios
                    </option>
                    <option value={PublicationType.JOB}>Empleos</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      const resetFilters = {
                        category: undefined,
                        type: undefined,
                        search: "",
                        page: 1,
                        limit: 10,
                      };
                      setFilters(resetFilters);
                      fetchPublications(resetFilters);
                    }}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 text-gray-700 p-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={() => verifyCreatePublication()}
                    className="bg-[#097EEC] hover:bg-[#097EEC]/90 text-white font-eras-medium w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Publicación
                  </Button>
                </div>
              </div>
            </div>

            {/* Feed Banner Component */}
            <div className="max-w-4xl mx-auto mb-6">
              <FeedBanner
                selectedCategory={filters.category}
                onCategoryClick={(category) => {
                  const newFilters = {
                    ...filters,
                    category:
                      filters.category === category ? undefined : category,
                    page: 1,
                  };
                  setFilters(newFilters);
                  fetchPublications(newFilters);
                }}
              />
            </div>

            {/* Feed */}
            <div className="w-full max-w-full overflow-x-hidden">
              {loading ? (
                // Loading skeletons
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {Array.from({ length: 6 }).map((_, index) => (
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
                  ))}
                </div>
              ) : error ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8 text-center w-full max-w-full">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-eras-bold text-gray-900 mb-2">
                    Error al cargar
                  </h3>
                  <p className="text-gray-600 font-eras">{error}</p>
                </div>
              ) : filteredPublications.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    {(showAllPublications
                      ? filteredPublications
                      : filteredPublications.slice(0, 3)
                    ).map((publication) => (
                      <PublicationFeedCard
                        key={publication.id}
                        publication={publication}
                        userRole={userRoles[0]}
                        publicationBids={publicationBids[publication.id!]}
                        onPublicationDeleted={fetchPublications}
                      />
                    ))}
                  </div>

                  {/* Botón Ver más */}
                  {!showAllPublications && filteredPublications.length > 3 && (
                    <div className="text-center mt-8">
                      <Button
                        onClick={() => setShowAllPublications(true)}
                        variant="outline"
                        className="bg-white hover:bg-gray-50 text-[#097EEC] border-[#097EEC] hover:border-[#097EEC]/80 font-eras-medium px-8 py-3"
                      >
                        Ver más publicaciones ({filteredPublications.length - 3}{" "}
                        restantes)
                      </Button>
                    </div>
                  )}

                  {/* Botón Ver menos */}
                  {showAllPublications && filteredPublications.length > 3 && (
                    <div className="text-center mt-8">
                      <Button
                        onClick={() => setShowAllPublications(false)}
                        variant="outline"
                        className="bg-white hover:bg-gray-50 text-gray-600 border-gray-300 hover:border-gray-400 font-eras-medium px-8 py-3"
                      >
                        Ver menos
                      </Button>
                    </div>
                  )}
                </>
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

            {/* Pagination - Solo mostrar si se están viendo todas las publicaciones */}
            {showAllPublications &&
              filteredPublications.length > 0 &&
              pagination.totalPages > 1 && (
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
