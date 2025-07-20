"use client";
import { useEffect, useState } from "react";
import { UserService } from "@/services/UsersService";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { User } from "@/interfaces/user.interface";
import Navbar from "@/components/navbar";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";
import {
  PlusCircle,
  Edit,
  Trash2,
  AlertCircle,
  Search,
  UserIcon,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

const UsersPageContent = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchUsers = async (
    params: PaginationParams = { page: 1, limit: 10 },
  ) => {
    try {
      setLoading(true);
      const response = await UserService.getUsers(params);

      // Asegurarse de que roles esté correctamente mapeado
      setUsers(
        response.data.data.map((user: any) => ({
          ...user,
          roles: user.roles || [],
        })),
      );

      setPagination(response.data.meta);
    } catch (err) {
      setError("Error al cargar los usuarios");
      console.error("Error al obtener usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePageChange = (page: number) => {
    fetchUsers({ page, limit: pagination.limit });
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await UserService.deleteUser(id);
        // Recargar la página actual después de eliminar
        fetchUsers({ page: pagination.page, limit: pagination.limit });
      } catch (err) {
        console.error("Error al eliminar usuario:", err);
        setError("Error al eliminar el usuario");
      }
    }
  };

  const handleVerificationToggle = async (id: string, currentStatus: boolean) => {
    try {
      const updateData = { isVerify: !currentStatus };
      
      await UserService.partialUpdateUser(id, updateData);
      
      // Actualizar el estado local inmediatamente
      setUsers(prev => 
        prev.map(user => 
          user.id === id ? { ...user, isVerify: !currentStatus } : user
        )
      );
    } catch (err) {
      setError("Error al actualizar la verificación del usuario");
    }
  };

  const filteredUsers = searchTerm
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.roles &&
            user.roles.some((role) =>
              typeof role === "string"
                ? role.toLowerCase().includes(searchTerm.toLowerCase())
                : false,
            )),
      )
    : users;

  // Función para obtener el color de fondo según el rol
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
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
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Usuarios</h1>
            <p className="mt-2 text-blue-100">
              Gestiona todos los usuarios registrados en la plataforma
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
                  placeholder="Buscar usuarios..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Link href="/users/create">
                <button className="bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>Crear Usuario</span>
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

            {/* Loading State */}
            {loading ? (
              <div className="py-32 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
              </div>
            ) : (
              <>
                {/* Users List */}
                {filteredUsers.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Usuario
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Rol
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Verificado
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-[#097EEC]/10 rounded-full flex items-center justify-center">
                                  <UserIcon className="h-5 w-5 text-[#097EEC]" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {user.email}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.roles && user.roles.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {user.roles.map((role, index) => (
                                    <span
                                      key={index}
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(role.toString())}`}
                                    >
                                      <Shield className="h-3 w-3 mr-1" />
                                      {typeof role === "string"
                                        ? role
                                            .toLowerCase()
                                            .includes(searchTerm.toLowerCase())
                                        : role.name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  Sin rol
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={user.isVerify || false}
                                    onChange={() =>
                                      user.id && handleVerificationToggle(user.id, user.isVerify || false)
                                    }
                                  />
                                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#097EEC]"></div>
                                </label>
                                {user.isVerify ? (
                                  <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500 ml-2" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() =>
                                    alert(`Editar usuario con ID: ${user.id}`)
                                  }
                                  className="text-amber-600 hover:text-amber-700 transition-colors"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() =>
                                    user.id && handleDelete(user.id)
                                  }
                                  className="text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="bg-gray-50 inline-flex rounded-full p-6 mb-4">
                      <UserIcon className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      No hay usuarios disponibles
                    </h3>
                    <p className="mt-2 text-gray-500">
                      No se encontraron usuarios que coincidan con tu búsqueda.
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
                {!loading && !error && filteredUsers.length > 0 && (
                  <div className="mt-6 text-sm text-gray-500 text-center">
                    Mostrando {filteredUsers.length} de {pagination.total}{" "}
                    usuarios
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
const UsersPage = () => {
  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <UsersPageContent />
    </RoleGuard>
  );
};

export default UsersPage;
