"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Briefcase,
  Building2,
  Plus,
  TrendingUp,
  Calendar,
  Eye,
  Tag,
  AlertCircle,
  User,
  Heart,
  MessageSquare,
  Share2,
  Send,
  MoreHorizontal,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import PublicationFeedCard from "@/components/publication-feed-card";
import Navbar from "@/components/navbar";
import PublicationModalManager from "@/components/publication-modal-manager";
import PublicationService from "@/services/PublicationsService";
import { Publication, PublicationType } from "@/interfaces/publication.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import Link from "next/link";
import { ContractService } from "@/services/ContractService";
import { Contract } from "@/interfaces/contract.interface";
import toast from "react-hot-toast";

// Categorías disponibles para filtrado
const PUBLICATION_CATEGORIES = [
  "Tecnología",
  "Construcción",
  "Salud",
  "Educación",
  "Servicios",
  "Gastronomía",
  "Transporte",
  "Manufactura",
  "Finanzas",
  "Agricultura",
  "Otro",
];

export default function FeedPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPublicationType, setSelectedPublicationType] = useState<PublicationType | "">("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
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
    limit: 5, // Cambiar a 5 publicaciones por página
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [publicationBids, setPublicationBids] = useState<{
    [key: string]: { contracts: Contract[]; totalBids: number };
  }>({});

  // Obtener información del usuario al cargar
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUserId(decoded.id);
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

  // Función para cargar publicaciones
  const fetchPublications = useCallback(
    async (params: PaginationParams = { page: 1, limit: pagination.limit }) => {
      try {
        setLoading(true);
        console.log("🔍 Frontend - Sending type:", selectedPublicationType);
        const response = await PublicationService.getPublications({
          ...params,
          type: selectedPublicationType || undefined,
        });

        // Ordenar publicaciones por fecha (más recientes primero)
        const sortedPublications = response.data.data.sort(
          (a: Publication, b: Publication) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB.getTime() - dateA.getTime(); // Orden descendente (más reciente primero)
          },
        );

        setPublications(sortedPublications);
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
    [pagination.limit, selectedPublicationType],
  );

  // Cargar datos al montar el componente y cuando cambien los filtros
  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  // Función para manejar cuando se crea una nueva publicación
  const handlePublicationCreated = () => {
    // Recargar las publicaciones para mostrar la nueva
    fetchPublications();
  };

  // Filtrar publicaciones
  const filteredPublications = publications.filter((pub) => {
    // Primero filtrar publicaciones eliminadas (solo mostrar las activas)
    if (pub.deleted_at) {
      return false; // Excluir publicaciones eliminadas
    }

    const matchesSearch =
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pub.description &&
        pub.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pub.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || pub.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas
  const categories = [
    "all",
    ...Array.from(new Set(publications.map((pub) => pub.category))),
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="container mx-auto px-4 -mt-6 pb-12">
        <div className="grid lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Sidebar izquierdo - Filtros principales */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-eras-bold text-gray-900 mb-4">
                Filtros
              </h3>

              {/* Búsqueda */}
              <div className="mb-6">
                <label className="block text-sm font-eras-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Título, descripción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 font-eras"
                  />
                </div>
              </div>

              {/* Tipo de publicación */}
              <div className="mb-6">
                <label className="block text-sm font-eras-medium text-gray-700 mb-2">
                  Tipo de publicación
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="type-all"
                      type="radio"
                      name="publicationType"
                      value=""
                      checked={selectedPublicationType === ""}
                      onChange={(e) => setSelectedPublicationType(e.target.value as PublicationType | "")}
                      className="text-[#097EEC] focus:ring-[#097EEC]"
                    />
                    <span className="text-sm font-eras">Todos los tipos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="type-service"
                      type="radio"
                      name="publicationType"
                      value={PublicationType.SERVICE}
                      checked={selectedPublicationType === PublicationType.SERVICE}
                      onChange={(e) => setSelectedPublicationType(e.target.value as PublicationType)}
                      className="text-[#097EEC] focus:ring-[#097EEC]"
                    />
                    <span className="text-sm font-eras flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      Servicios Ofrecidos
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="type-service-request"
                      type="radio"
                      name="publicationType"
                      value={PublicationType.SERVICE_REQUEST}
                      checked={selectedPublicationType === PublicationType.SERVICE_REQUEST}
                      onChange={(e) => setSelectedPublicationType(e.target.value as PublicationType)}
                      className="text-[#097EEC] focus:ring-[#097EEC]"
                    />
                    <span className="text-sm font-eras flex items-center gap-1">
                      <Handshake className="h-3 w-3" />
                      Servicios Solicitados
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="type-job"
                      type="radio"
                      name="publicationType"
                      value={PublicationType.JOB}
                      checked={selectedPublicationType === PublicationType.JOB}
                      onChange={(e) => setSelectedPublicationType(e.target.value as PublicationType)}
                      className="text-[#097EEC] focus:ring-[#097EEC]"
                    />
                    <span className="text-sm font-eras flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Vacantes de Trabajo
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Feed (centro) */}
          <div className="lg:col-span-2 col-span-full">
            {/* Filtros móviles */}
            <div className="lg:hidden bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="flex flex-col gap-4">
                {/* Búsqueda móvil */}
                <div>
                  <label className="block text-sm font-eras-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Título, descripción..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 font-eras"
                    />
                  </div>
                </div>

                {/* Tipo de publicación móvil */}
                <div>
                  <label className="block text-sm font-eras-medium text-gray-700 mb-2">
                    Tipo de publicación
                  </label>
                  <select
                    value={selectedPublicationType}
                    onChange={(e) => setSelectedPublicationType(e.target.value as PublicationType | "")}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm"
                  >
                    <option value="">Todos los tipos</option>
                    <option value={PublicationType.SERVICE}>Servicios Ofrecidos</option>
                    <option value={PublicationType.SERVICE_REQUEST}>Servicios Solicitados</option>
                    <option value={PublicationType.JOB}>Vacantes de Trabajo</option>
                  </select>
                </div>

                {/* Categoría móvil */}
                <div>
                  <label className="block text-sm font-eras-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "Todas las categorías" : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Create Post Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 font-eras-semibold text-gray-900 text-sm sm:text-base">
                  ¿Qué estás buscando hoy?
                </div>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#097EEC] hover:bg-[#097EEC]/90 text-white font-eras-medium w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Publicación
                </Button>
              </div>
            </div>

            {/* Feed */}
            <div className="space-y-4 lg:space-y-6">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6"
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8 text-center">
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8 text-center">
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
              <div className="mt-8">
                <div className="text-center mb-4 text-sm text-gray-600">
                  Página {pagination.page} de {pagination.totalPages}
                </div>
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
            )}
          </div>

          {/* Sidebar derecho - Filtros de categoría y estadísticas */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-eras-bold text-gray-900 mb-4">
                Categorías
              </h3>

              {/* Categoría */}
              <div className="mb-6">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-[#097EEC] focus:ring-[#097EEC]"
                      />
                      <span className="text-sm font-eras">
                        {category === "all" ? "Todas las categorías" : category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-eras-bold text-gray-900 mb-3">
                  Estadísticas
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-eras">Total publicaciones</span>
                    <span className="font-eras-bold">
                      {filteredPublications.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-eras">Categorías</span>
                    <span className="font-eras-bold">
                      {categories.length - 1}
                    </span>
                  </div>
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
