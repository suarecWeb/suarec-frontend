"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import CompanyService from "@/services/CompanyService";
import { UserService } from "@/services/UsersService";
import { Company } from "@/interfaces/company.interface";
import { User } from "@/interfaces/user.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import {
  Users,
  Plus,
  Trash2,
  Search,
  Building2,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserPlus,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
} from "lucide-react";
import Link from "next/link";

const EmployeesPageContent = () => {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
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
        setUserRoles(decoded.roles.map(role => role.name));
      } catch (error) {
        console.error("Error al decodificar token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchCompanyData();
    }
  }, [params.id]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const companyId = Array.isArray(params.id) ? params.id[0] : params.id;
      
      // Obtener datos de la empresa
      const companyResponse = await CompanyService.getCompanyById(companyId);
      setCompany(companyResponse.data);

      // Obtener empleados de la empresa
      await fetchEmployees();
    } catch (err) {
      console.error("Error al cargar datos de la empresa:", err);
      setError("Error al cargar la información de la empresa");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async (paginationParams: PaginationParams = { page: 1, limit: 10 }) => {
    try {
      setLoadingEmployees(true);
      const companyId = Array.isArray(params.id) ? params.id[0] : params.id;
      
      const response = await CompanyService.getEmployees(companyId, paginationParams);
      setEmployees(response.data.data);
      setPagination(response.data.meta);
    } catch (err) {
      console.error("Error al cargar empleados:", err);
      setError("Error al cargar los empleados");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      // Obtener usuarios que no son empleados de esta empresa
      const response = await UserService.getUsers({ page: 1, limit: 50 });
      const allUsers = response.data.data;
      
      // Filtrar usuarios que no son empleados de esta empresa y tienen rol PERSON
      const available = allUsers.filter(user => 
        !employees.some(emp => emp.id === user.id) &&
        user.roles?.some(role => 
          typeof role === 'string' ? role === 'PERSON' : role.name === 'PERSON'
        )
      );
      
      setAvailableUsers(available);
    } catch (err) {
      console.error("Error al cargar usuarios disponibles:", err);
      setError("Error al cargar usuarios disponibles");
    }
  };

  const addEmployee = async (userId: string) => {
    try {
      const companyId = Array.isArray(params.id) ? params.id[0] : params.id;
      
      await CompanyService.addEmployee(companyId, userId);
      setSuccess("Empleado agregado correctamente");
      
      // Recargar empleados
      fetchEmployees({ page: pagination.page, limit: pagination.limit });
      
      // Actualizar lista de usuarios disponibles
      setAvailableUsers(prev => prev.filter(user => user.id !== userId));
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al agregar empleado:", err);
      setError("Error al agregar el empleado");
      setTimeout(() => setError(null), 3000);
    }
  };

  const removeEmployee = async (userId: string) => {
    if (!confirm("¿Estás seguro de que deseas remover a este empleado?")) return;

    try {
      const companyId = Array.isArray(params.id) ? params.id[0] : params.id;
      
      await CompanyService.removeEmployee(companyId, userId);
      setSuccess("Empleado removido correctamente");
      
      // Recargar empleados
      fetchEmployees({ page: pagination.page, limit: pagination.limit });
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error al remover empleado:", err);
      setError("Error al remover el empleado");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handlePageChange = (page: number) => {
    fetchEmployees({ page, limit: pagination.limit });
  };

  const isOwnerOrAdmin = () => {
    if (!company || !currentUserId) return false;
    return company.userId === currentUserId.toString() || userRoles.includes("ADMIN");
  };

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

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!company) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>No se pudo cargar la información de la empresa</p>
                  </div>
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
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Link
                href={`/companies/${company.id}`}
                className="inline-flex items-center text-blue-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Volver a empresa
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Empleados - {company.name}</h1>
            <p className="mt-2 text-blue-100">Gestiona los empleados de la empresa</p>
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
                  placeholder={showAddEmployee ? "Buscar usuarios..." : "Buscar empleados..."}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isOwnerOrAdmin() && (
                <div className="flex gap-2">
                  {showAddEmployee ? (
                    <button
                      onClick={() => {
                        setShowAddEmployee(false);
                        setSearchTerm("");
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span>Volver</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowAddEmployee(true);
                        setSearchTerm("");
                        fetchAvailableUsers();
                      }}
                      className="bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2"
                    >
                      <UserPlus className="h-5 w-5" />
                      <span>Agregar Empleado</span>
                    </button>
                  )}
                </div>
              )}
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

            {/* Content based on mode */}
            {showAddEmployee ? (
              /* Add Employee Section */
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <UserPlus className="h-6 w-6 text-[#097EEC]" />
                  Agregar Nuevo Empleado
                </h2>
                
                {filteredAvailableUsers.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAvailableUsers.map((user) => (
                      <div key={user.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-[#097EEC]/10 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-[#097EEC]" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{user.name}</h4>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{user.cellphone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Miembro desde: {user.created_at ? formatDate(user.created_at) : "N/A"}</span>
                          </div>
                          {/* {user.roles && (
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map((role, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  {typeof role === 'string' ? role : role.name}
                                </span>
                              ))}
                            </div>
                          )} */}
                        </div>

                        <button
                          onClick={() => user.id && addEmployee(user.id)}
                          className="w-full bg-[#097EEC] text-white px-3 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Agregar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No hay usuarios disponibles</h3>
                    <p className="text-gray-500">No se encontraron usuarios disponibles para agregar como empleados.</p>
                  </div>
                )}
              </div>
            ) : (
              /* Employees List Section */
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6 text-[#097EEC]" />
                  Lista de Empleados ({pagination.total})
                </h2>

                {loadingEmployees ? (
                  <div className="py-32 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
                  </div>
                ) : filteredEmployees.length > 0 ? (
                  <>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Empleado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                              Contacto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                              Fecha de ingreso
                            </th>
                            {isOwnerOrAdmin() && (
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredEmployees.map((employee) => (
                            <tr key={employee.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-[#097EEC]/10 rounded-full flex items-center justify-center">
                                    <Users className="h-5 w-5 text-[#097EEC]" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                                    <div className="text-sm text-gray-500 md:hidden">{employee.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                                <div className="text-sm text-gray-900 flex items-center gap-1">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  {employee.email}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  {employee.cellphone}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {employee.roles && employee.roles.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {employee.roles.map((role, index) => (
                                      <span
                                        key={index}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
                                      >
                                        <Shield className="h-3 w-3 mr-1" />
                                        {typeof role === 'string' ? role : role.name}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">Sin rol</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                                {employee.created_at ? formatDate(employee.created_at) : "N/A"}
                              </td>
                              {isOwnerOrAdmin() && (
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => employee.id && removeEmployee(employee.id)}
                                    className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Remover</span>
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

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
                ) : (
                  <div className="text-center py-16">
                    <div className="bg-gray-50 inline-flex rounded-full p-6 mb-4">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No hay empleados</h3>
                    <p className="mt-2 text-gray-500">
                      {isOwnerOrAdmin() 
                        ? "Esta empresa aún no tiene empleados registrados. Agrega empleados para comenzar."
                        : "Esta empresa no tiene empleados registrados públicamente."
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const EmployeesPage = () => {
  return (
    <RoleGuard allowedRoles={["ADMIN", "BUSINESS", "PERSON"]}>
      <EmployeesPageContent />
    </RoleGuard>
  );
};

export default EmployeesPage;