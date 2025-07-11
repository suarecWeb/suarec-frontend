/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import CompanyService from "@/services/CompanyService";
import { User } from "@/interfaces/user.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  User as UserIcon,
  FileText,
  Building2,
  Star,
  Award,
  Briefcase,
  MapPin,
  MoreVertical,
  Download,
  X
} from "lucide-react";
import DownloadCVButton from "@/components/download-cv-button";

// Modal de confirmación
const RemoveEmployeeModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  employeeName, 
  isLoading 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employeeName: string;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl max-w-lg w-full mx-auto transform transition-all">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Remover empleado
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
          ¿Estás seguro de que deseas remover a <strong>{employeeName}</strong> de la empresa? 
          Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Removiendo...
              </>
            ) : (
              'Remover'
            )}
          </button>
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const MyEmployeesPageContent = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [removingEmployee, setRemovingEmployee] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Estados para la modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToRemove, setEmployeeToRemove] = useState<{ id: string; name: string } | null>(null);
  
  const router = useRouter();

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
        setUserRoles(decoded.roles.map(role => role.name));
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    }
  }, []);

  // Obtener información de la empresa del usuario
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (!currentUserId) return;

      try {
        // Obtener la empresa del usuario actual
        const response = await CompanyService.getCompanies({ page: 1, limit: 100 });
        const userCompany = response.data.data.find(company =>
          company.user && parseInt(company.user.id || '0') === currentUserId
        );

        if (userCompany) {
          setCompanyId(userCompany.id);
          setCompanyInfo(userCompany);
        } else {
          setError("No se encontró una empresa asociada a tu usuario");
        }
      } catch (err) {
        console.error("Error al obtener información de la empresa:", err);
        setError("Error al cargar la información de la empresa");
      }
    };

    if (currentUserId && userRoles.includes("BUSINESS")) {
      fetchCompanyInfo();
    }
  }, [currentUserId, userRoles]);

  // Función para cargar empleados
  const fetchEmployees = async (params: PaginationParams = { page: 1, limit: pagination.limit, status: "all" }) => {
    if (!companyId) return;

    try {
      setLoading(true);
      const response = await CompanyService.getEmployees(companyId, params);
      console.log('empleados: ' + JSON.stringify(response.data.data));
      setEmployees(response.data.data);
      setPagination(response.data.meta);
    } catch (err) {
      setError("Error al cargar los empleados");
      console.error("Error al obtener empleados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchEmployees();
    }
  }, [companyId]);

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const handlePageChange = (page: number) => {
    fetchEmployees({ page, limit: pagination.limit });
  };

  // Función para abrir la modal de confirmación
  const handleRemoveEmployeeClick = (employeeId: string, employeeName: string) => {
    setEmployeeToRemove({ id: employeeId, name: employeeName });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  // Función para confirmar la eliminación
  const handleConfirmRemove = async () => {
    if (!employeeToRemove || !companyId) return;

    setRemovingEmployee(employeeToRemove.id);

    try {
      await CompanyService.removeEmployee(companyId, employeeToRemove.id);
      setSuccess(`${employeeToRemove.name} ha sido removido de la empresa`);

      // Recargar empleados
      fetchEmployees({ page: pagination.page, limit: pagination.limit });

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al remover empleado:", err);
      setError("Error al remover el empleado");
      setTimeout(() => setError(null), 3000);
    } finally {
      setRemovingEmployee(null);
      setIsModalOpen(false);
      setEmployeeToRemove(null);
    }
  };

  // Función para cancelar la eliminación
  const handleCancelRemove = () => {
    setIsModalOpen(false);
    setEmployeeToRemove(null);
  };

  // Filtrar empleados según el término de búsqueda
  const filteredEmployees = searchTerm
    ? employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.profession && employee.profession.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    : employees;

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return adjustedDate.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRoleBadgeColor = (role: any) => {
    const roleName = typeof role === 'string' ? role : role.name;
    switch (roleName) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "BUSINESS":
        return "bg-blue-100 text-blue-800";
      case "PERSON":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12 pt-16">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Building2 className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Mis Empleados</h1>
                {companyInfo && (
                  <p className="mt-2 text-blue-100">
                    Empleados de {companyInfo.name}
                  </p>
                )}
              </div>
            </div>

            {/* Company Stats */}
            {companyInfo && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-white/80" />
                    <div>
                      <p className="text-2xl font-bold">
                        {employees.filter(emp => emp?.currentEmployment?.isActive).length}
                      </p>
                      <p className="text-blue-100 text-sm">Empleados Activos</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-white/80" />
                    <div>
                      <p className="text-2xl font-bold">{new Date(companyInfo.created_at).getFullYear()}</p>
                      <p className="text-blue-100 text-sm">Año de Fundación</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-white/80" />
                    <div>
                      <p className="text-lg font-bold">{companyInfo.nit}</p>
                      <p className="text-blue-100 text-sm">NIT Empresa</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar empleados..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Attendance Actions */}
              <div className="flex gap-3 flex-wrap">
                <a
                  href="/attendance"
                  className="inline-flex items-center gap-2 w-full sm:w-auto px-4 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#0A6BC7] transition-colors font-medium"
                >
                  <Calendar className="h-4 w-4" />
                  Control de Asistencia
                </a>
                <a
                  href="/attendance/register"
                  className="inline-flex items-center gap-2 w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Calendar className="h-4 w-4" />
                  Registrar Asistencia
                </a>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-green-800 font-medium">Éxito</h3>
                  <p className="text-green-700">{success}</p>
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
                {/* Employees Grid */}
                {filteredEmployees.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEmployees.map((employee) => (
                      <div key={employee.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative">
                        {/* Menú de opciones */}
                        <div className="absolute top-2 right-2 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === employee.id ? null : employee.id!);
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === employee.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/profile/${employee.id}`);
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                              >
                                <UserIcon className="h-4 w-4" />
                                Ver perfil
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `mailto:${employee.email}`;
                                  setOpenMenuId(null);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                              >
                                <Mail className="h-4 w-4" />
                                Contactar
                              </button>

                              {!employee.company && (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                  }}
                                  className="px-4 py-2 hover:bg-gray-50"
                                >
                                  <DownloadCVButton
                                    user={employee}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-700 hover:text-gray-900 p-0 h-auto text-sm w-full justify-start"
                                    isPublicProfile={true}
                                  />
                                </div>
                              )}

                              {/* Solo mostrar botón remover si el empleado está activo en la empresa */}
                              {employee?.currentEmployment?.isActive && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveEmployeeClick(employee.id!, employee.name);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remover
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          {/* Employee Header */}
                          <div className="flex items-start gap-4 mb-4 pr-10">
                            <div className="w-16 h-16 bg-[#097EEC]/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <UserIcon className="h-8 w-8 text-[#097EEC]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/profile/${employee.id}`);
                                }}
                                className="font-semibold text-gray-800 hover:text-[#097EEC] transition-colors text-left cursor-pointer block w-full text-base md:text-lg"
                              >
                                {employee.name}
                              </button>
                              {employee.profession && (
                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                  <Briefcase className="h-3 w-3" />
                                  {employee.profession}
                                </p>
                              )}

                              {/* Roles */}
                              {employee.roles && employee.roles.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {employee.roles.map((role, index) => (
                                    <span
                                      key={index}
                                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
                                    >
                                      <Shield className="h-3 w-3 mr-1" />
                                      {typeof role === 'string' ? role : role.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Employee Details */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="truncate">{employee.email}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{employee.cellphone}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>Miembro desde: {employee.created_at ? formatDate(employee.created_at) : "N/A"}</span>
                            </div>

                            {employee?.currentEmployment && (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    employee.currentEmployment.isActive
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {employee.currentEmployment.isActive ? "Activo" : "Inactivo"}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {employee.currentEmployment.isActive
                                    ? `Desde ${formatDate(employee.currentEmployment.startDate)}`
                                    : `Desde ${formatDate(employee.currentEmployment.startDate)} - ${
                                        employee.currentEmployment.endDate
                                          ? formatDate(employee.currentEmployment.endDate)
                                          : "presente"
                                      }`}
                                </span>
                              </div>
                            )}

                            {/* Skills */}
                            {employee.skills && employee.skills.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                  <Award className="h-4 w-4" />
                                  Habilidades:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {employee.skills.slice(0, 3).map((skill, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                  {employee.skills.length > 3 && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                                      +{employee.skills.length - 3} más
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* CV Link */}
                            {employee.cv_url && (
                              <div className="pt-2">
                                <a
                                  href={employee.cv_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-[#097EEC] hover:text-[#0A6BC7] transition-colors"
                                >
                                  <FileText className="h-4 w-4" />
                                  Ver CV
                                </a>
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
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No hay empleados</h3>
                    <p className="mt-2 text-gray-500">
                      {searchTerm
                        ? "No se encontraron empleados que coincidan con tu búsqueda."
                        : "Tu empresa aún no tiene empleados registrados. Los empleados se agregarán automáticamente cuando aceptes aplicaciones."
                      }
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
                {!loading && !error && filteredEmployees.length > 0 && (
                  <div className="mt-6 text-sm text-gray-500 text-center">
                    Mostrando {filteredEmployees.length} de {pagination.total} empleados
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <RemoveEmployeeModal
        isOpen={isModalOpen}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        employeeName={employeeToRemove?.name || ''}
        isLoading={removingEmployee === employeeToRemove?.id}
      />
    </>
  );
};

// Componente principal protegido con RoleGuard - solo empresas pueden ver empleados
const MyEmployeesPage = () => {
  return (
    <RoleGuard allowedRoles={['BUSINESS', 'ADMIN']}>
      <MyEmployeesPageContent />
    </RoleGuard>
  );
};

export default MyEmployeesPage;
