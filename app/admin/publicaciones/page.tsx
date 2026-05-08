"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useResizablePanel } from "@/hooks/useResizablePanel";
import PublicationService from "@/services/PublicationsService";
import { UserService } from "@/services/UsersService";
import {
  Publication,
  PublicationType,
} from "@/interfaces/publication.interface";
import { User } from "@/interfaces/user.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import Navbar from "@/components/navbar";
import AdminSidePanel from "@/components/AdminSidePanel";
import RoleGuard from "@/components/role-guard";
import { Pagination } from "@/components/ui/pagination";
import { PublicationDetailModal } from "./PublicationDetailModal";
import {
  Search,
  Briefcase,
  HandHelping,
  Building2,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  Tag,
  DollarSign,
  User as UserIcon,
  ImageOff,
  Filter,
  X,
} from "lucide-react";

const TYPE_LABELS: Record<
  PublicationType,
  { label: string; color: string; icon: React.ReactNode }
> = {
  [PublicationType.SERVICE]: {
    label: "Oferta",
    color: "bg-blue-100 text-blue-700",
    icon: <Briefcase className="h-3 w-3" />,
  },
  [PublicationType.SERVICE_REQUEST]: {
    label: "Solicitud",
    color: "bg-amber-100 text-amber-700",
    icon: <HandHelping className="h-3 w-3" />,
  },
  [PublicationType.JOB]: {
    label: "Vacante",
    color: "bg-purple-100 text-purple-700",
    icon: <Building2 className="h-3 w-3" />,
  },
};

const PublicacionesPageContent = () => {
  const { width: panelWidth, onMouseDown: onPanelDrag } = useResizablePanel();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtro de publicaciones (título/desc)
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Tab activas / eliminadas
  const [tab, setTab] = useState<"activas" | "eliminadas">("activas");

  // Filtro por tipo
  const [typeFilter, setTypeFilter] = useState<PublicationType | "">("");

  // Filtro por usuario
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<User[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedPub, setSelectedPub] = useState<
    (Publication & { deleted_at?: Date }) | null
  >(null);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Debounce búsqueda de publicaciones
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Búsqueda de usuarios con debounce
  useEffect(() => {
    if (!userQuery.trim()) {
      setUserResults([]);
      setShowUserDropdown(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setSearchingUsers(true);
        const res = await UserService.searchUsers(userQuery, 8);
        setUserResults(res.data ?? []);
        setShowUserDropdown(true);
      } catch {
        setUserResults([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [userQuery]);

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        userInputRef.current &&
        !userInputRef.current.contains(e.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchPublications = useCallback(
    async (
      params: PaginationParams = { page: 1, limit: 15 },
      userId?: number,
      deleted?: boolean,
    ) => {
      try {
        setLoading(true);
        setError(null);
        const response = deleted
          ? await PublicationService.getDeletedPublications(params)
          : userId
            ? await PublicationService.getPublicationsByUser(userId, params)
            : await PublicationService.getPublications(params);
        const { data: pubs, meta } = response.data;
        setPublications(pubs ?? []);
        setPagination({
          total: meta.total ?? 0,
          page: meta.page ?? 1,
          limit: meta.limit ?? 15,
          totalPages: meta.totalPages ?? 0,
          hasNextPage: meta.hasNextPage ?? false,
          hasPrevPage: meta.hasPrevPage ?? false,
        });
      } catch {
        setError("No se pudieron cargar las publicaciones.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const isDeleted = tab === "eliminadas";

  useEffect(() => {
    fetchPublications(
      {
        page: 1,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
      },
      isDeleted
        ? undefined
        : selectedUser?.id
          ? Number(selectedUser.id)
          : undefined,
      isDeleted,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, typeFilter, selectedUser, tab]);

  const handlePageChange = (page: number) => {
    fetchPublications(
      {
        page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        type: typeFilter || undefined,
      },
      isDeleted
        ? undefined
        : selectedUser?.id
          ? Number(selectedUser.id)
          : undefined,
      isDeleted,
    );
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setUserQuery("");
    setUserResults([]);
    setShowUserDropdown(false);
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setUserQuery("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    handleClearUser();
  };

  const hasFilters = searchTerm || typeFilter || selectedUser;

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12 pt-16 lg:pt-20">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8 shadow-sm">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Publicaciones</h1>
            <p className="mt-2 text-blue-100">
              Todas las publicaciones de los usuarios de la plataforma
            </p>
          </div>
        </div>

        {/* Layout sidebar + contenido */}
        <div className="container mx-auto px-4 -mt-4 flex">
          {/* Columna izquierda redimensionable */}
          <div
            className="hidden md:flex flex-col gap-6 flex-shrink-0"
            style={{ width: panelWidth }}
          >
            <AdminSidePanel />
          </div>

          {/* Handle de arrastre */}
          <div
            className="hidden md:flex items-center justify-center w-3 flex-shrink-0 cursor-col-resize group select-none"
            onMouseDown={onPanelDrag}
          >
            <div className="w-0.5 h-12 rounded-full bg-gray-200 group-hover:bg-[#097EEC] transition-colors duration-150" />
          </div>

          <div className="flex-1 min-w-0 ml-3">
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTab("activas")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tab === "activas"
                    ? "bg-[#097EEC] text-white shadow"
                    : "bg-white text-gray-600 hover:bg-gray-100 shadow"
                }`}
              >
                Activas
              </button>
              <button
                onClick={() => setTab("eliminadas")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  tab === "eliminadas"
                    ? "bg-red-500 text-white shadow"
                    : "bg-white text-gray-600 hover:bg-gray-100 shadow"
                }`}
              >
                Eliminadas
              </button>
            </div>

            {/* Barra de filtros */}
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                {/* Búsqueda publicaciones */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar por título, descripción o categoría..."
                    className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none text-sm transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filtro tipo */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <select
                    value={typeFilter}
                    onChange={(e) =>
                      setTypeFilter(e.target.value as PublicationType | "")
                    }
                    className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none text-sm bg-white appearance-none cursor-pointer transition-colors"
                  >
                    <option value="">Todos los tipos</option>
                    <option value={PublicationType.SERVICE}>
                      Oferta de servicio
                    </option>
                    <option value={PublicationType.SERVICE_REQUEST}>
                      Solicitud
                    </option>
                    <option value={PublicationType.JOB}>Vacante</option>
                  </select>
                </div>

                {/* Limpiar + contador */}
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-2 rounded-lg hover:bg-red-50 whitespace-nowrap"
                  >
                    <X className="h-4 w-4" />
                    Limpiar
                  </button>
                )}
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  {pagination.total} resultado
                  {pagination.total !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Buscador de usuarios — solo en tab activas */}
              {!isDeleted && (
                <div className="relative">
                  {selectedUser ? (
                    // Usuario seleccionado — chip
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg w-fit">
                      <UserIcon className="h-4 w-4 text-[#097EEC]" />
                      <span className="text-sm font-medium text-[#097EEC]">
                        {selectedUser.name ?? selectedUser.email}
                      </span>
                      <button
                        onClick={handleClearUser}
                        className="ml-1 text-blue-400 hover:text-blue-700 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative max-w-sm">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input
                        ref={userInputRef}
                        type="text"
                        placeholder="Filtrar por usuario..."
                        className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] outline-none text-sm transition-colors"
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        onFocus={() =>
                          userResults.length > 0 && setShowUserDropdown(true)
                        }
                      />
                      {searchingUsers && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#097EEC]" />
                        </div>
                      )}

                      {/* Dropdown resultados */}
                      {showUserDropdown && userResults.length > 0 && (
                        <div
                          ref={dropdownRef}
                          className="absolute z-20 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                        >
                          {userResults.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => handleSelectUser(u)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
                            >
                              <div className="w-7 h-7 rounded-full bg-[#097EEC] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {(u.name ?? u.email ?? "?")[0].toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {u.name ?? "Sin nombre"}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {u.email}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lista */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#097EEC]" />
                </div>
              ) : error ? (
                <div className="text-center py-24 text-red-500">{error}</div>
              ) : publications.length === 0 ? (
                <div className="text-center py-24 text-gray-400">
                  <ImageOff className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-medium">No hay publicaciones</p>
                  <p className="text-sm">Intenta con otros filtros</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {publications.map((pub) => (
                    <PublicationRow
                      key={pub.id}
                      pub={pub}
                      onOpen={() =>
                        setSelectedPub(
                          pub as Publication & { deleted_at?: Date },
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPub && (
        <PublicationDetailModal
          pub={selectedPub}
          onClose={() => setSelectedPub(null)}
        />
      )}
    </>
  );
};

const PublicationRow = ({
  pub,
  onOpen,
}: {
  pub: Publication & { deleted_at?: Date };
  onOpen: () => void;
}) => {
  const isDeleted = !!pub.deleted_at;
  const typeInfo = TYPE_LABELS[pub.type] ?? {
    label: pub.type,
    color: "bg-gray-100 text-gray-600",
    icon: null,
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className={`flex gap-4 p-4 cursor-pointer transition-colors ${isDeleted ? "bg-red-50 hover:bg-red-100 opacity-75" : "hover:bg-blue-50/60"}`}
    >
      {/* Imagen */}
      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
        {pub.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pub.image_url}
            alt={pub.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageOff className="h-7 w-7" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2 mb-1">
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${typeInfo.color}`}
          >
            {typeInfo.icon}
            {typeInfo.label}
          </span>
          {pub.category && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              <Tag className="h-3 w-3" />
              {pub.category}
            </span>
          )}
          {isDeleted && (
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              Eliminada
            </span>
          )}
        </div>

        <h3 className="font-semibold text-gray-800 text-sm leading-snug truncate">
          {pub.title}
        </h3>

        {pub.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {pub.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-2">
          {pub.user && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <UserIcon className="h-3 w-3 text-[#097EEC]" />
              <span className="font-medium text-gray-700">
                {pub.user.name ?? pub.user.email}
              </span>
            </span>
          )}
          {pub.price != null && (
            <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
              <DollarSign className="h-3 w-3" />
              {Number(pub.price).toLocaleString("es-CO")}
              {pub.priceUnit ? `/${pub.priceUnit}` : ""}
            </span>
          )}
          {pub.visitors != null && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Eye className="h-3 w-3" />
              {pub.visitors}
            </span>
          )}
          {pub.likes != null && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Heart className="h-3 w-3" />
              {pub.likesCount ?? pub.likes.length}
            </span>
          )}
          {pub.comments != null && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <MessageCircle className="h-3 w-3" />
              {pub.comments.length}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-gray-400 ml-auto">
            <Calendar className="h-3 w-3" />
            {formatDate(pub.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

const PublicacionesPage = () => {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <PublicacionesPageContent />
    </RoleGuard>
  );
};

export default PublicacionesPage;
