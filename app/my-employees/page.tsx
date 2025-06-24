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
  MapPin
} from "lucide-react";

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
  const fetchEmployees = async (params: PaginationParams = { page: 1, limit: pagination.limit }) => {
    if (!companyId) return;

    try {
      setLoading(true);
      const response = await CompanyService.getEmployees(companyId, params);
      console.log('empleados: ' + response.data.data)
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

  const handlePageChange = (page: number) => {
    fetchEmployees({ page, limit: pagination.limit });
  };

  // Función para remover empleado
  const handleRemoveEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`¿Estás seguro de que deseas remover a ${employeeName} de la empresa?`)) {
      return;
    }

    if (!companyId) return;

    setRemovingEmployee(employeeId);
    
    try {
      await CompanyService.removeEmployee(companyId, employeeId);
      setSuccess(`${employeeName} ha sido removido de la empresa`);
      
      // Recargar empleados
      fetchEmployees({ page: pagination.page, limit: pagination.limit });
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al remover empleado:", err);
      setError("Error al remover el empleado");
      setTimeout(() => setError(null), 3000);
    } finally {
      setRemovingEmployee(null);
    }
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
    return date.toLocaleDateString("es-ES", {
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
      <div className="bg-gray-50 min-h-screen pb-12 pt-20">
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
                      <p className="text-2xl font-bold">{pagination.total}</p>
                      <p className="text-blue-100 text-sm">Total Empleados</p>
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
              <div className="flex gap-3">
                <a
                  href="/attendance"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#097EEC] text-white rounded-lg hover:bg-[#0A6BC7] transition-colors font-medium"
                >
                  <Calendar className="h-4 w-4" />
                  Control de Asistencia
                </a>
                <a
                  href="/attendance/register"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
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
                      <div key={employee.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                          {/* Employee Header */}
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 bg-[#097EEC]/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <UserIcon className="h-8 w-8 text-[#097EEC]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-800 truncate">{employee.name}</h3>
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

                          {/* Actions */}
                          <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <button
                                onClick={() => window.location.href = `mailto:${employee.email}`}
                                className="text-[#097EEC] hover:text-[#0A6BC7] transition-colors flex items-center gap-1 text-sm"
                              >
                                <Mail className="h-4 w-4" />
                                Contactar
                              </button>
                              
                              <button
                                onClick={() => handleRemoveEmployee(employee.id!, employee.name)}
                                disabled={removingEmployee === employee.id}
                                className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 text-sm disabled:opacity-50"
                              >
                                {removingEmployee === employee.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                Remover
                              </button>
                            </div>
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