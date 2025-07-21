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
  CreditCard,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BankInfoService } from "@/services/bank-info.service";
import { BankInfo } from "@/interfaces/bank-info";
import { Loader2 } from "lucide-react";

const UsersPageContent = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBankInfoModal, setShowBankInfoModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [bankInfoLoading, setBankInfoLoading] = useState(false);
  const [bankInfoError, setBankInfoError] = useState<string | null>(null);
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

  const handleViewBankInfo = async (user: User) => {
    if (!user.id) {
      console.error("Usuario sin ID válido");
      return;
    }

    console.log(
      "Obteniendo información bancaria para usuario:",
      user.id,
      user.name,
    );
    setSelectedUser(user);
    setShowBankInfoModal(true);
    setBankInfoLoading(true);
    setBankInfo(null);
    setBankInfoError(null);

    try {
      console.log(
        "Llamando a BankInfoService.getBankInfo con ID:",
        parseInt(user.id),
      );
      const response = await BankInfoService.getBankInfo(parseInt(user.id));
      console.log("Respuesta del servicio:", response);

      if (response.success) {
        if (response.data) {
          console.log(
            "Datos de información bancaria encontrados:",
            response.data,
          );
          setBankInfo(response.data);
        } else {
          console.log("No se encontró información bancaria");
          setBankInfo(null);
        }
      } else {
        console.log("Error en la respuesta:", response.message);
        setBankInfoError(
          response.message || "Error al obtener información bancaria",
        );
        setBankInfo(null);
      }
    } catch (err) {
      console.error("Error al obtener información bancaria:", err);
      setBankInfoError("Error inesperado al obtener información bancaria");
      setBankInfo(null);
    } finally {
      setBankInfoLoading(false);
    }
  };

  const handleVerificationToggle = async (
    id: string,
    currentStatus: boolean,
  ) => {
    try {
      const updateData = { isVerify: !currentStatus };

      await UserService.partialUpdateUser(id, updateData);

      // Actualizar el estado local inmediatamente
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, isVerify: !currentStatus } : user,
        ),
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
                                      user.id &&
                                      handleVerificationToggle(
                                        user.id,
                                        user.isVerify || false,
                                      )
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
                                  onClick={() => handleViewBankInfo(user)}
                                  className="text-blue-600 hover:text-blue-700 transition-colors"
                                  title="Ver información bancaria"
                                >
                                  <CreditCard className="h-5 w-5" />
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

        {/* Modal de información bancaria */}
        <Dialog open={showBankInfoModal} onOpenChange={setShowBankInfoModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                Información Bancaria - {selectedUser?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {bankInfoLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#097EEC]" />
                  <span className="ml-2 text-gray-600">
                    Cargando información bancaria...
                  </span>
                </div>
              ) : bankInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titular de la cuenta
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                        {bankInfo.accountHolderName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de documento
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                        {bankInfo.documentType}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de documento
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                        {bankInfo.documentNumber}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Banco
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                        {bankInfo.bankName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de cuenta
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                        {bankInfo.accountType}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de cuenta
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                        {bankInfo.accountNumber}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email de contacto
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                        {bankInfo.contactEmail}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono de contacto
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                        {bankInfo.contactPhone}
                      </p>
                    </div>
                  </div>
                </div>
              ) : bankInfoError ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Error al cargar información
                  </h3>
                  <p className="text-red-500">{bankInfoError}</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sin información bancaria
                  </h3>
                  <p className="text-gray-500">
                    Este usuario no ha registrado información bancaria.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
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
