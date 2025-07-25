/* eslint-disable */
"use client";
import { useEffect, useState } from "react";
import CompanyService from "@/services/CompanyService";
import { Company } from "@/interfaces/company.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import Navbar from "@/components/navbar";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";
import {
  PlusCircle,
  Edit,
  Trash2,
  AlertCircle,
  Search,
  Building2,
  Mail,
  Phone,
  Calendar,
  Eye,
  User,
  Info,
} from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import Image from "next/image";
import { toast } from "react-hot-toast";

const CompaniesPageContent = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
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
        toast.error("Error al decodificar el token");
      }
    }
  }, []);

  // Cargar empresas
  const fetchCompanies = async (
    params: PaginationParams = { page: 1, limit: pagination.limit },
  ) => {
    try {
      setLoading(true);
      const response = await CompanyService.getCompanies(params);
      setCompanies(response.data.data);
      setPagination(response.data.meta);
    } catch (err) {
      toast.error("Error al cargar las empresas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handlePageChange = (page: number) => {
    fetchCompanies({ page, limit: pagination.limit });
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return userRoles.includes("ADMIN");
  };

  // Verificar si el usuario es dueño de la empresa
  const isOwner = (company: Company) => {
    return company.user && company.user.id === currentUserId?.toString();
  };

  // Verificar si el usuario puede gestionar la empresa (admin o dueño)
  const canManageCompany = (company: Company) => {
    return isAdmin() || isOwner(company);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin()) {
      toast.error("No tienes permisos para eliminar empresas");
      return;
    }

    if (confirm("¿Estás seguro de que deseas eliminar esta empresa?")) {
      try {
        await CompanyService.deleteCompany(id);
        fetchCompanies({ page: pagination.page, limit: pagination.limit });
      } catch (err) {
        toast.error("Error al eliminar la empresa");
      }
    }
  };

  const filteredCompanies = searchTerm
    ? companies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : companies;

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Empresas</h1>
            <p className="mt-2 text-blue-100">
              Explora y conoce las empresas registradas en la plataforma
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-full sm:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar empresas..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isAdmin() && (
                <Link href="/companies/create" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    <span>Crear Empresa</span>
                  </button>
                </Link>
              )}
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

            {/* Loading State */}
            {loading ? (
              <div className="py-32 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
              </div>
            ) : (
              <>
                {/* Companies Cards */}
                {filteredCompanies.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCompanies.map((company) => (
                      <div
                        key={company.id}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex items-start gap-3 sm:gap-4">
                            {company.user?.profile_image ? (
                              <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden">
                                <Image
                                  src={company.user.profile_image}
                                  alt={company.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 bg-[#097EEC]/10 rounded-full flex items-center justify-center">
                                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#097EEC]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 truncate">
                                {company.name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                                NIT: {company.nit}
                              </p>

                              <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">
                                    {company.email}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                  <span>{company.cellphone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                  <span className="truncate">
                                    Fundada: {formatDate(company.born_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
                            <Link
                              href={`/companies/${company.id}`}
                              className="w-full sm:w-auto"
                            >
                              <button className="w-full sm:w-auto text-[#097EEC] hover:text-[#0A6BC7] transition-colors flex items-center justify-center sm:justify-start gap-1 text-xs sm:text-sm py-1">
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span>Ver detalles</span>
                              </button>
                            </Link>

                            {canManageCompany(company) && (
                              <div className="flex gap-2 sm:gap-3">
                                <Link
                                  href={`/companies/${company.id}/employees`}
                                >
                                  <button className="text-green-600 hover:text-green-700 transition-colors flex items-center gap-1 text-sm">
                                    <User className="h-4 w-4" />
                                    <span>Empleados</span>
                                  </button>
                                </Link>

                                <Link
                                  href={`/companies/${company.id}/edit`}
                                  className="flex-1 sm:flex-initial"
                                >
                                  <button className="w-full sm:w-auto text-amber-600 hover:text-amber-700 transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm py-1">
                                    <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span>Editar</span>
                                  </button>
                                </Link>

                                {isAdmin() && (
                                  <button
                                    onClick={() =>
                                      company.id && handleDelete(company.id)
                                    }
                                    className="flex-1 sm:flex-initial text-red-600 hover:text-red-700 transition-colors flex items-center justify-center gap-1 text-xs sm:text-sm py-1"
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span>Eliminar</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="bg-gray-50 inline-flex rounded-full p-6 mb-4">
                      <Building2 className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No hay empresas disponibles
                    </h3>
                    <p className="mt-2 text-gray-500">
                      No se encontraron empresas que coincidan con tu búsqueda.
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
                {!loading && !error && filteredCompanies.length > 0 && (
                  <div className="mt-6 text-sm text-gray-500 text-center">
                    Mostrando {filteredCompanies.length} de {pagination.total}{" "}
                    empresas
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Componente principal protegido con RoleGuard
const CompaniesPage = () => {
  return (
    <RoleGuard allowedRoles={["ADMIN", "BUSINESS", "PERSON"]}>
      <CompaniesPageContent />
    </RoleGuard>
  );
};

export default CompaniesPage;
