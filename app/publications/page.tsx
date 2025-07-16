/* eslint-disable */
"use client";
import StartChatButton from "@/components/start-chat-button";

import { useEffect, useState } from "react";
import PublicationService from "@/services/PublicationsService";
import { Publication } from "@/interfaces/publication.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";
import {
  PlusCircle,
  Edit,
  Trash2,
  AlertCircle,
  Search,
  Calendar,
  Eye,
  Tag,
  User,
  FileText,
  User2Icon,
  Building2,
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";

const PublicationsPageContent = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [myPublications, setMyPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [myPagination, setMyPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

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

  // Función para cargar todas las publicaciones
  const fetchPublications = async (
    params: PaginationParams = { page: 1, limit: pagination.limit },
  ) => {
    try {
      setLoading(true);
      const response = await PublicationService.getPublications(params);
      setPublications(response.data.data);
      setPagination(response.data.meta);
    } catch (err) {
      setError("Error al cargar las publicaciones");
      console.error("Error al obtener publicaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar mis publicaciones
  const fetchMyPublications = async (
    params: PaginationParams = { page: 1, limit: myPagination.limit },
  ) => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      // Idealmente deberías tener un endpoint para obtener publicaciones por usuario
      // Pero por ahora podemos filtrar las publicaciones en el cliente
      const response = await PublicationService.getPublications({
        ...params,
        // Si tu API soporta filtrado por userId, deberías agregarlo aquí:
        // userId: currentUserId
      });

      // Filtrar solo las publicaciones del usuario actual
      const userPublications = response.data.data.filter(
        (pub) => parseInt(pub.user?.id || "0") === currentUserId,
      );

      setMyPublications(userPublications);

      // Actualizar paginación para mis publicaciones
      // Nota: Esto es una aproximación, ya que estamos filtrando del lado del cliente
      setMyPagination({
        ...response.data.meta,
        total: userPublications.length,
        totalPages: Math.ceil(userPublications.length / params.limit!),
        hasNextPage: userPublications.length > params.limit!,
        hasPrevPage: params.page! > 1,
      });
    } catch (err) {
      setError("Error al cargar tus publicaciones");
      console.error("Error al obtener publicaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos cuando cambia la pestaña activa o el ID del usuario
  useEffect(() => {
    if (activeTab === "all") {
      fetchPublications();
    } else if (activeTab === "my" && currentUserId) {
      fetchMyPublications();
    }
  }, [activeTab, currentUserId]);

  // Manejadores para cambio de página
  const handlePageChange = (page: number) => {
    if (activeTab === "all") {
      fetchPublications({ page, limit: pagination.limit });
    } else {
      fetchMyPublications({ page, limit: myPagination.limit });
    }
  };

  // Función para eliminar publicación
  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta publicación?")) {
      try {
        await PublicationService.deletePublication(id);

        // Recargar la sección actual
        if (activeTab === "all") {
          fetchPublications({ page: pagination.page, limit: pagination.limit });
        } else {
          fetchMyPublications({
            page: myPagination.page,
            limit: myPagination.limit,
          });
        }
      } catch (err) {
        console.error("Error al eliminar publicación:", err);
        setError("Error al eliminar la publicación");
      }
    }
  };

  // Verificar si el usuario puede editar una publicación
  const canEditPublication = (publication: Publication) => {
    if (!currentUserId) return false;

    // El propietario o un administrador pueden editar
    return publication.userId === currentUserId || userRoles.includes("ADMIN");
  };

  // Filtrar publicaciones según el término de búsqueda
  const getFilteredPublications = (publications: Publication[]) => {
    if (!searchTerm) return publications;

    return publications.filter(
      (pub) =>
        pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pub.description &&
          pub.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        pub.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  const filteredAllPublications = getFilteredPublications(publications);
  const filteredMyPublications = getFilteredPublications(myPublications);

  // Formatear fecha
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Renderizar tarjeta de publicación
  const renderPublicationCard = (publication: Publication) => {
    const isEditable = canEditPublication(publication);

    // NO mostrar publicaciones sin imágenes
    if (
      !publication.image_url &&
      (!publication.gallery_images || publication.gallery_images.length === 0)
    ) {
      return null;
    }

    return (
      <div
        key={publication.id}
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        {/* Link para ver el detalle de la publicación */}
        <Link href={`/publications/${publication.id}`}>
          {/* Publication Image */}
          <div className="h-40 bg-gray-200 relative">
            {publication.image_url ? (
              <img
                src={publication.image_url}
                alt={publication.title}
                className="w-full h-full object-cover"
              />
            ) : publication.gallery_images &&
              publication.gallery_images.length > 0 ? (
              <img
                src={publication.gallery_images[0]}
                alt={publication.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
                <div className="text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-60" />
                  <span className="text-sm font-medium">Sin imagen</span>
                </div>
              </div>
            )}
          </div>

          {/* Publication Content */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-[#097EEC]" />
              <span className="text-xs font-medium text-[#097EEC] bg-blue-50 px-2 py-0.5 rounded-full">
                {publication.category}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
              {publication.title}
            </h3>

            {publication.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {publication.description}
              </p>
            )}

            <div className="flex items-center text-xs text-gray-500 mb-4">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Creado: {formatDate(publication.created_at)}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500 mb-4">
              <User2Icon className="h-3 w-3 mr-1" />
              <span>Autor: {publication.user?.name}</span>
            </div>
          </div>
        </Link>

        {/* Actions - solo mostrar si puede editar */}
        <div className="px-4 pb-4">
          <div className="flex justify-between pt-3 border-t border-gray-100">
            {isEditable ? (
              <>
                <Link href={`/publications/${publication.id}/edit`}>
                  <button className="text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1 text-sm">
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    publication.id && handleDelete(publication.id);
                  }}
                  className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/publications/${publication.id}`}
                  className="text-[#097EEC] hover:text-[#0A6BC7] transition-colors flex items-center gap-1 text-sm"
                >
                  <span>Ver detalles</span>
                </Link>

                {/* Botón de chat si no es el autor */}
                {currentUserId && publication.userId !== currentUserId && (
                  <StartChatButton
                    recipientType="business"
                    recipientId={parseInt(publication.user?.id || "0")}
                    recipientName="Autor"
                    className="text-xs px-2 py-1"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Publicaciones</h1>
            <p className="mt-2 text-blue-100">
              Explora y gestiona ofertas y oportunidades en la plataforma
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar publicaciones..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Link href="/publications/create">
                <button className="bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>Crear publicación</span>
                </button>
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Tabs for All/My Publications */}
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList className="grid grid-cols-2 mb-6 w-full sm:w-80">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white"
                >
                  Ver todas
                </TabsTrigger>
                <TabsTrigger
                  value="my"
                  className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white"
                >
                  Mis publicaciones
                </TabsTrigger>
              </TabsList>

              {/* All Publications Tab */}
              <TabsContent value="all">
                {loading ? (
                  <div className="py-32 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
                  </div>
                ) : (
                  <>
                    {filteredAllPublications.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredAllPublications.map((publication) =>
                          renderPublicationCard(publication),
                        )}
                      </div>
                    ) : (
                      <div className="py-16 text-center">
                        <div className="bg-gray-50 inline-flex rounded-full p-6 mb-4">
                          <AlertCircle className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          No hay publicaciones disponibles
                        </h3>
                        <p className="mt-2 text-gray-500">
                          No se encontraron publicaciones que coincidan con tu
                          búsqueda.
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

                    {/* Results Summary */}
                    {!loading &&
                      !error &&
                      filteredAllPublications.length > 0 && (
                        <div className="mt-6 text-sm text-gray-500 text-center">
                          Mostrando {filteredAllPublications.length} de{" "}
                          {pagination.total} publicaciones
                        </div>
                      )}
                  </>
                )}
              </TabsContent>

              {/* My Publications Tab */}
              <TabsContent value="my">
                {loading ? (
                  <div className="py-32 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
                  </div>
                ) : (
                  <>
                    {!currentUserId ? (
                      <div className="py-16 text-center">
                        <div className="bg-gray-50 inline-flex rounded-full p-6 mb-4">
                          <User className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Inicia sesión para ver tus publicaciones
                        </h3>
                        <p className="mt-2 text-gray-500">
                          Necesitas iniciar sesión para ver y gestionar tus
                          publicaciones.
                        </p>
                        <Link href="/auth/login">
                          <button className="mt-4 bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors">
                            Iniciar sesión
                          </button>
                        </Link>
                      </div>
                    ) : filteredMyPublications.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredMyPublications.map((publication) =>
                          renderPublicationCard(publication),
                        )}
                      </div>
                    ) : (
                      <div className="py-16 text-center">
                        <div className="bg-gray-50 inline-flex rounded-full p-6 mb-4">
                          <FileText className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          No has creado publicaciones aún
                        </h3>
                        <p className="mt-2 text-gray-500">
                          Crea tu primera publicación para ofrecer tus servicios
                          o buscar oportunidades.
                        </p>
                        <Link href="/publications/create">
                          <button className="mt-4 bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2 mx-auto">
                            <PlusCircle className="h-5 w-5" />
                            <span>Crear publicación</span>
                          </button>
                        </Link>
                      </div>
                    )}

                    {/* Pagination for My Publications */}
                    {myPagination.totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <Pagination
                          currentPage={myPagination.page}
                          totalPages={myPagination.totalPages}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    )}

                    {/* Results Summary for My Publications */}
                    {!loading &&
                      !error &&
                      currentUserId &&
                      filteredMyPublications.length > 0 && (
                        <div className="mt-6 text-sm text-gray-500 text-center">
                          Mostrando {filteredMyPublications.length} de{" "}
                          {myPagination.total} publicaciones
                        </div>
                      )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

// Componente principal protegido con RoleGuard
const PublicationsPage = () => {
  return (
    <RoleGuard allowedRoles={["ADMIN", "BUSINESS", "PERSON"]}>
      <PublicationsPageContent />
    </RoleGuard>
  );
};

export default PublicationsPage;
