"use client";
import { useEffect, useState } from "react";
import { UserService } from "@/services/UsersService";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { User } from "@/interfaces/user.interface";
import Navbar from "@/components/navbar";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";
import { IdPhoto, IdPhotosService } from "@/services/IdPhotosService";
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
  Eye,
  FileText,
  GraduationCap,
  Camera,
  User as UserIconSolid,
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
import toast from "react-hot-toast";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

interface RequiredField {
  name: string;
  label: string;
  icon: any;
  isCompleted: boolean;
  value?: any;
}

const UsersPageContent = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBankInfoModal, setShowBankInfoModal] = useState(false);
  const [showRequiredFieldsModal, setShowRequiredFieldsModal] = useState(false);
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
  const [rejectingPhotoId, setRejectingPhotoId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

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
      toast.error("Error al cargar los usuarios");
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
        toast.error("Error al eliminar el usuario");
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
      toast.error("Error al actualizar la verificación del usuario");
    }
  };

  // Función para evaluar los campos obligatorios
  const evaluateRequiredFields = (user: User): RequiredField[] => {
    return [
      {
        name: "bio",
        label: "Biografía",
        icon: FileText,
        isCompleted: !!(user.bio && user.bio.trim().length > 0),
        value: user.bio || "No completado",
      },
      {
        name: "profile_image",
        label: "Imagen de perfil",
        icon: UserIconSolid,
        isCompleted: !!(
          user.profile_image && user.profile_image.trim().length > 0
        ),
        value: user.profile_image || "No completado",
      },
      {
        name: "education",
        label: "Educación",
        icon: GraduationCap,
        isCompleted: !!(
          user.education &&
          Array.isArray(user.education) &&
          user.education.length > 0
        ),
        value: user.education || [],
      },
      {
        name: "idPhotos",
        label: "Fotos de identificación",
        icon: Camera,
        isCompleted: !!(
          user.idPhotos &&
          Array.isArray(user.idPhotos) &&
          user.idPhotos.length === 2 &&
          user.idPhotos.every((photo) => photo.status === "approved")
        ),
        value: user.idPhotos || [],
      },
    ];
  };

  // Función para contar campos completados
  const getCompletedFieldsCount = (
    user: User,
  ): { completed: number; total: number } => {
    const fields = evaluateRequiredFields(user);
    const completed = fields.filter((field) => field.isCompleted).length;
    return { completed, total: fields.length };
  };

  // Función para obtener el color del progreso
  const getProgressColor = (completed: number, total: number): string => {
    const percentage = (completed / total) * 100;
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    if (percentage >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  // Función para mostrar los detalles de los campos obligatorios
  const handleViewRequiredFields = (user: User) => {
    setSelectedUser(user);
    setShowRequiredFieldsModal(true);
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

  // Función para revisar foto de ID (agregar dentro del componente)
  const handleReviewIdPhoto = async (
    photoId: number,
    status: "approved" | "rejected",
    description?: string,
  ) => {
    try {
      await IdPhotosService.reviewIdPhoto(photoId, { status, description });

      // Actualizar el estado local del usuario seleccionado
      if (selectedUser) {
        const updatedUser = {
          ...selectedUser,
          idPhotos: selectedUser.idPhotos?.map((photo: any) =>
            photo.id === photoId
              ? { ...photo, status, description: description }
              : photo,
          ),
        };
        setSelectedUser(updatedUser);

        // También actualizar la lista principal de usuarios
        setUsers((prev) =>
          prev.map((user) =>
            user.id === selectedUser.id
              ? {
                  ...user,
                  idPhotos: user.idPhotos?.map((photo: any) =>
                    photo.id === photoId
                      ? { ...photo, status, description: description }
                      : photo,
                  ),
                }
              : user,
          ),
        );
      }

      // Limpiar estados de rechazo
      setRejectingPhotoId(null);
      setRejectionReason("");

      toast.success(
        `Foto ${status === "approved" ? "aprobada" : "rechazada"} exitosamente`,
      );
    } catch (err) {
      toast.error(
        `Error al ${status === "approved" ? "aprobar" : "rechazar"} la foto`,
      );
      console.error("Error reviewing photo:", err);
    }
  };

  // Función para manejar el rechazo
  const handleRejectPhoto = (photoId: number) => {
    setRejectingPhotoId(photoId);
    setRejectionReason("");
  };

  // Función para confirmar el rechazo
  const confirmRejectPhoto = () => {
    if (rejectingPhotoId) {
      handleReviewIdPhoto(rejectingPhotoId, "rejected", rejectionReason);
    }
  };

  // Función para cancelar el rechazo
  const cancelRejectPhoto = () => {
    setRejectingPhotoId(null);
    setRejectionReason("");
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
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 overflow-x-scroll">
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
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Campos Obligatorios
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
                        {filteredUsers.map((user) => {
                          const { completed, total } =
                            getCompletedFieldsCount(user);
                          const progressPercentage = (completed / total) * 100;

                          return (
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
                                              .includes(
                                                searchTerm.toLowerCase(),
                                              )
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
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex flex-col items-center space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-700">
                                      {completed}/{total}
                                    </span>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(completed, total)}`}
                                        style={{
                                          width: `${progressPercentage}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleViewRequiredFields(user)
                                    }
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                                  >
                                    <Eye className="h-3 w-3" />
                                    Ver detalles
                                  </button>
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
                          );
                        })}
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

        {/* Modal de campos obligatorios */}
        <Dialog
          open={showRequiredFieldsModal}
          onOpenChange={setShowRequiredFieldsModal}
        >
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Campos Obligatorios - {selectedUser?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {selectedUser && (
                <div className="space-y-6">
                  {/* Resumen del progreso */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Progreso de Verificación
                      </h3>
                      <span className="text-sm text-gray-600">
                        {getCompletedFieldsCount(selectedUser).completed}/
                        {getCompletedFieldsCount(selectedUser).total}{" "}
                        completados
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                          getCompletedFieldsCount(selectedUser).completed,
                          getCompletedFieldsCount(selectedUser).total,
                        )}`}
                        style={{
                          width: `${(getCompletedFieldsCount(selectedUser).completed / getCompletedFieldsCount(selectedUser).total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Detalles de cada campo */}
                  <div className="space-y-4">
                    {evaluateRequiredFields(selectedUser).map(
                      (field, index) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-4 ${
                            field.isCompleted
                              ? "border-green-200 bg-green-50"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <field.icon
                                className={`h-6 w-6 ${
                                  field.isCompleted
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {field.label}
                                </h4>
                                <p
                                  className={`text-sm ${
                                    field.isCompleted
                                      ? "text-green-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  {field.isCompleted
                                    ? "Completado"
                                    : "Pendiente"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {field.isCompleted ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              ) : (
                                <XCircle className="h-6 w-6 text-red-600" />
                              )}
                            </div>
                          </div>

                          {/* Mostrar contenido del campo */}
                          <div className="mt-3 pl-9">
                            {field.name === "bio" && (
                              <div className="bg-white p-3 rounded border">
                                <p className="text-sm text-gray-600">
                                  {field.isCompleted
                                    ? field.value
                                    : "Sin biografía registrada"}
                                </p>
                              </div>
                            )}

                            {field.name === "profile_image" && (
                              <div className="bg-white p-3 rounded border">
                                {field.isCompleted ? (
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <Zoom>
                                      <img
                                        src={field.value}
                                        alt="Imagen de perfil"
                                        className="h-16 w-16 rounded-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.style.display =
                                            "none";
                                        }}
                                      />
                                    </Zoom>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        Imagen de perfil
                                      </p>
                                      <p className="text-xs text-gray-500 break-all">
                                        {field.value}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-600">
                                    Sin imagen de perfil
                                  </p>
                                )}
                              </div>
                            )}

                            {field.name === "education" && (
                              <div className="bg-white p-3 rounded border">
                                {field.isCompleted ? (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-900">
                                      Educación ({field.value.length} registros)
                                    </p>
                                    {field.value
                                      .slice(0, 3)
                                      .map((edu: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="bg-gray-50 p-2 rounded text-xs"
                                        >
                                          <p className="font-medium">
                                            {edu.institution ||
                                              edu.title ||
                                              "Sin título"}
                                          </p>
                                          <p className="text-gray-600">
                                            {edu.degree ||
                                              edu.description ||
                                              "Sin descripción"}
                                          </p>
                                          {edu.year && (
                                            <p className="text-gray-500">
                                              {edu.year}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    {field.value.length > 3 && (
                                      <p className="text-xs text-gray-500">
                                        +{field.value.length - 3} registros
                                        más...
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-600">
                                    Sin información educativa
                                  </p>
                                )}
                              </div>
                            )}

                            {field.name === "idPhotos" && (
                              <div className="bg-white p-3 rounded border">
                                <div className="space-y-4">
                                  <p className="text-sm font-medium text-gray-900">
                                    Fotos de identificación (
                                    {field.value.length} fotos)
                                  </p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {field.value.map(
                                      (photo: IdPhoto, idx: number) => (
                                        <div
                                          key={photo.id || idx}
                                          className="border rounded-lg p-3 bg-gray-50"
                                        >
                                          <div className="relative mb-3">
                                            <Zoom>
                                              <img
                                                src={photo.image_url}
                                                alt={`ID ${idx + 1}`}
                                                className="h-32 w-full object-cover rounded border"
                                                onError={(e) => {
                                                  e.currentTarget.src =
                                                    "/placeholder-id.png";
                                                }}
                                              />
                                            </Zoom>
                                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                              {idx + 1}
                                            </div>
                                            {/* Indicador de estado */}
                                            <div className="absolute top-2 left-2">
                                              {photo.status === "approved" && (
                                                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                  <CheckCircle className="h-3 w-3" />
                                                  Aprobada
                                                </div>
                                              )}
                                              {photo.status === "rejected" && (
                                                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                  <XCircle className="h-3 w-3" />
                                                  Rechazada
                                                </div>
                                              )}
                                              {photo.status === "pending" && (
                                                <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                  <AlertCircle className="h-3 w-3" />
                                                  Pendiente
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Descripción de revisión */}
                                          {photo.description &&
                                            photo.status === "rejected" && (
                                              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                                <p className="font-medium text-blue-800">
                                                  Comentarios:
                                                </p>
                                                <p className="text-blue-700">
                                                  {photo.description}
                                                </p>
                                              </div>
                                            )}

                                          {/* Botones de acción o formulario de rechazo */}
                                          {rejectingPhotoId === photo.id ? (
                                            // Formulario de rechazo
                                            <div className="space-y-3 p-3 bg-red-50 border border-red-200 rounded">
                                              <div>
                                                <label className="block text-xs font-medium text-red-800 mb-1">
                                                  Razón del rechazo:
                                                </label>
                                                <textarea
                                                  value={rejectionReason}
                                                  onChange={(e) =>
                                                    setRejectionReason(
                                                      e.target.value,
                                                    )
                                                  }
                                                  placeholder="Escribe la razón..."
                                                  className="w-full p-2 border border-red-300 rounded text-xs resize-none h-12 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                                />
                                              </div>
                                              <div className="flex gap-2">
                                                <button
                                                  onClick={confirmRejectPhoto}
                                                  className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                                                >
                                                  Rechazar
                                                </button>
                                                <button
                                                  onClick={cancelRejectPhoto}
                                                  className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-400 transition-colors"
                                                >
                                                  Cancelar
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            // Botones normales
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() =>
                                                  handleReviewIdPhoto(
                                                    photo.id,
                                                    "approved",
                                                  )
                                                }
                                                disabled={
                                                  photo.status === "approved"
                                                }
                                                className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                  photo.status === "approved"
                                                    ? "bg-green-100 text-green-800 cursor-not-allowed"
                                                    : "bg-green-600 text-white hover:bg-green-700"
                                                }`}
                                              >
                                                <CheckCircle className="h-3 w-3 inline mr-1" />
                                                {photo.status === "approved"
                                                  ? "Aprobada"
                                                  : "Aprobar"}
                                              </button>

                                              <button
                                                onClick={() =>
                                                  handleRejectPhoto(photo.id)
                                                }
                                                disabled={
                                                  photo.status === "rejected"
                                                }
                                                className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                  photo.status === "rejected"
                                                    ? "bg-red-100 text-red-800 cursor-not-allowed"
                                                    : "bg-red-600 text-white hover:bg-red-700"
                                                }`}
                                              >
                                                <XCircle className="h-3 w-3 inline mr-1" />
                                                {photo.status === "rejected"
                                                  ? "Rechazada"
                                                  : "Rechazar"}
                                              </button>
                                            </div>
                                          )}

                                          {/* Información adicional */}
                                          <div className="mt-2 text-xs text-gray-500">
                                            {photo.reviewedBy &&
                                              photo.status !== "pending" && (
                                                <p className="text-xs text-gray-500">
                                                  Revisado por:{" "}
                                                  {photo.reviewedBy?.name}
                                                </p>
                                              )}
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                  {field.value.length > 6 && (
                                    <p className="text-xs text-gray-500">
                                      Mostrando las primeras 6 fotos de{" "}
                                      {field.value.length} total
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
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
