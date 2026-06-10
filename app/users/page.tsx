"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useResizablePanel } from "@/hooks/useResizablePanel";
import { UserService } from "@/services/UsersService";
import AuthService from "@/services/AuthService";
import { useAuth } from "@/hooks/useAuth";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { User, UserPlan } from "@/interfaces/user.interface";
import Navbar from "@/components/navbar";
import AdminSidePanel from "@/components/AdminSidePanel";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";
import { IdPhoto, IdPhotosService } from "@/services/IdPhotosService";
import { RutDocument, RutService } from "@/services/RutService";
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
  LayoutDashboard,
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
import { IconId } from "@tabler/icons-react";

interface RequiredField {
  name: string;
  label: string;
  icon: any;
  isCompleted: boolean;
  value?: any;
}

const UsersPageContent = () => {
  const { user: currentUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { width: panelWidth, onMouseDown: onPanelDrag } = useResizablePanel();
  const [users, setUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
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
  const [rutFiles, setRutFiles] = useState<RutDocument[]>([]);
  const processedUserIdRef = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState<"home" | "accounts">("home");

  const isUserBusiness = (user: User): boolean => {
    if (!user.roles || !Array.isArray(user.roles)) return false;
    return user.roles.some((r: any) => {
      const name = typeof r === "string" ? r : r.name;
      return name?.toUpperCase() === "BUSINESS";
    });
  };

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
          idPhotos: user.idPhotos ?? [],
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

  // Efecto para manejar la búsqueda con debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm && searchTerm.trim() !== "") {
        try {
          setSearching(true);
          // Usar el endpoint de búsqueda dedicado
          const response = await UserService.searchUsers(searchTerm, 100);
          setSearchResults(
            response.data.map((user: any) => ({
              ...user,
              roles: user.roles || [],
              idPhotos: user.idPhotos ?? [],
            })),
          );
        } catch (err) {
          console.error("Error al buscar usuarios:", err);
          toast.error("Error al buscar usuarios");
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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

  const handleInviteSuperAdmin = async (user: User) => {
    const isAdmin = user.roles?.some((r: any) => {
      const name = typeof r === "string" ? r : r.name;
      return name?.toUpperCase() === "ADMIN";
    });

    if (!isAdmin) {
      toast.error(
        `${user.name} no tiene rol Admin. Cámbialo a Admin antes de invitarlo como Super Admin.`,
      );
      return;
    }

    if (!confirm(`¿Enviar invitación de super admin a ${user.email}?`)) return;
    try {
      await AuthService.inviteSuperAdmin(user.email!);
      toast.success(`Invitación enviada a ${user.email}`);
    } catch {
      toast.error("Error al enviar la invitación");
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

  const getPrimaryRole = (user: User): string => {
    if (!user.roles || user.roles.length === 0) return "PERSON";
    const names = user.roles.map((r: any) =>
      typeof r === "string" ? r : r.name,
    );
    if (names.includes("ADMIN")) return "ADMIN";
    if (names.includes("ORGANIZADOR")) return "ORGANIZADOR";
    if (names.includes("BUSINESS")) return "BUSINESS";
    return "PERSON";
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await UserService.partialUpdateUser(userId, { roles: [newRole] });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, roles: [newRole] } : u)),
      );
      setSearchResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, roles: [newRole] } : u)),
      );
      toast.success(
        `Rol actualizado a ${newRole.charAt(0) + newRole.slice(1).toLowerCase()}`,
      );
    } catch {
      toast.error("Error al actualizar el rol del usuario");
    }
  };

  // Función para cambiar el plan del usuario
  const handlePlanChange = async (userId: string, newPlan: UserPlan) => {
    try {
      const updateData = { plan: newPlan };
      await UserService.partialUpdateUser(userId, updateData);

      // Actualizar el estado local inmediatamente
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, plan: newPlan } : user,
        ),
      );

      toast.success(
        `Plan actualizado a ${newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}`,
      );
    } catch (err) {
      toast.error("Error al actualizar el plan del usuario");
      console.error("Error updating user plan:", err);
    }
  };

  // Función para obtener el color del badge del plan
  const getPlanBadgeColor = (plan?: UserPlan) => {
    if (!plan || plan === UserPlan.FREE) {
      return "bg-gray-100 text-gray-800";
    }
    switch (plan) {
      case UserPlan.PREMIUM:
        return "bg-blue-100 text-blue-800";
      case UserPlan.CREATOR:
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Función para obtener el nombre del plan para mostrar
  const getPlanDisplayName = (plan?: UserPlan) => {
    if (!plan) return "Free";
    switch (plan) {
      case UserPlan.FREE:
        return "Free";
      case UserPlan.PREMIUM:
        return "Premium";
      case UserPlan.CREATOR:
        return "Creator";
      default:
        return "Free";
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
      isUserBusiness(user)
        ? {
            name: "rut",
            label: "Documento RUT",
            icon: FileText,
            isCompleted: !!(
              user.rutDocuments &&
              Array.isArray(user.rutDocuments) &&
              user.rutDocuments.length > 0 &&
              user.rutDocuments.some((d) => d.status === "approved")
            ),
            value: rutFiles.length > 0 ? rutFiles : user.rutDocuments || [],
          }
        : {
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
  const handleViewRequiredFields = async (user: User) => {
    setSelectedUser(user);
    setShowRequiredFieldsModal(true);
    setRutFiles([]);

    try {
      const photos = await IdPhotosService.getUserIdPhotosById(Number(user.id));
      const photosCompat = photos.map((p) => ({
        ...p,
        id: String(p.id),
      })) as User["idPhotos"];
      const updatedUser: User = { ...user, idPhotos: photosCompat };
      setSelectedUser(updatedUser);
      const patch = (u: User): User =>
        u.id === user.id ? { ...u, idPhotos: photosCompat } : u;
      setUsers((prev) => prev.map(patch));
      setSearchResults((prev) => prev.map(patch));
    } catch (err) {
      console.warn("Could not load id photos for user", user.id, err);
    }

    if (isUserBusiness(user)) {
      try {
        const docs = await RutService.getUserRutById(user.id!);
        setRutFiles(docs);
      } catch (err) {
        console.warn("Could not load RUT docs for user", user.id, err);
      }
    }
  };

  // Abrir modal automáticamente si viene desde el panel de pendientes
  useEffect(() => {
    const userIdParam = searchParams.get("userId");
    const openModalParam = searchParams.get("openModal");

    // Reset si no hay query params de modal
    if (openModalParam !== "requiredFields" || !userIdParam) {
      processedUserIdRef.current = null;
      return;
    }

    // Si ya procesamos este userId, no repetir
    if (processedUserIdRef.current === userIdParam) return;

    // Esperar a que los usuarios terminen de cargar
    if (loading) return;

    processedUserIdRef.current = userIdParam;
    const targetId = Number(userIdParam);
    const allUsers = searchTerm ? searchResults : users;
    const targetUser = allUsers.find((u) => u.id === String(targetId));

    if (targetUser) {
      handleViewRequiredFields(targetUser);
      router.replace("/users", { scroll: false });
      return;
    }

    // Si el usuario no está en la página actual, buscarlo directamente
    UserService.getUserById(targetId)
      .then((res) => {
        const user = res.data;
        if (user) {
          handleViewRequiredFields(user);
        }
      })
      .catch((err) => {
        console.warn("No se pudo cargar el usuario por ID:", err);
      })
      .finally(() => {
        router.replace("/users", { scroll: false });
      });
  }, [searchParams, users, searchResults, loading, searchTerm, router]);

  // Mostrar resultados de búsqueda si hay término de búsqueda, sino mostrar usuarios paginados
  const displayUsers = searchTerm ? searchResults : users;

  // Función para obtener el color de fondo según el rol
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "ORGANIZADOR":
        return "bg-orange-100 text-orange-800";
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

        const patchIdPhoto = (user: User): User =>
          user.id === selectedUser.id
            ? {
                ...user,
                idPhotos: user.idPhotos?.map((photo: any) =>
                  photo.id === photoId
                    ? { ...photo, status, description }
                    : photo,
                ),
              }
            : user;

        setUsers((prev) => prev.map(patchIdPhoto));
        setSearchResults((prev) => prev.map(patchIdPhoto));
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
      <div className="bg-gray-50 min-h-screen pb-12 pt-16 lg:pt-20">
        {/* Header superior azul */}
        <div className="bg-[#097EEC] text-white py-8 shadow-sm">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Panel de usuarios</h1>
            <p className="mt-2 text-blue-100">
              Gestiona todos los usuarios registrados en la plataforma
            </p>
          </div>
        </div>

        {/* Layout con sidebar + contenido */}
        <div className="container mx-auto px-4 -mt-4 flex">
          {/* Columna izquierda redimensionable */}
          <div
            className="hidden md:flex flex-col gap-[24px] flex-shrink-0"
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

          {/* Contenido principal */}
          <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto ml-3">
            {/* Lista de usuarios */}

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  className="pl-9 pr-4 py-2 w-full text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Link href="/users/create">
                <button className="inline-flex items-center gap-2 bg-[#097EEC] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#0562C7] active:scale-[0.98] transition-all font-medium shadow-sm shadow-blue-100">
                  <PlusCircle className="h-4 w-4" />
                  Crear Usuario
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
                {/* Search indicator */}
                {searchTerm && (
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {searching ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#097EEC]"></div>
                          Buscando...
                        </span>
                      ) : (
                        <span>
                          {searchResults.length} resultado(s) para &quot;
                          {searchTerm}&quot;
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="text-sm text-[#097EEC] hover:text-[#0A6BC7]"
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                )}

                {/* Users List */}
                {displayUsers.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                          <th
                            scope="col"
                            className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                          >
                            Usuario
                          </th>
                          <th
                            scope="col"
                            className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                          >
                            Email
                          </th>
                          <th
                            scope="col"
                            className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell"
                          >
                            # ID
                          </th>
                          <th
                            scope="col"
                            className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                          >
                            Rol
                          </th>
                          <th
                            scope="col"
                            className="px-5 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                          >
                            Verificado
                          </th>
                          <th
                            scope="col"
                            className="px-5 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                          >
                            Plan
                          </th>
                          <th
                            scope="col"
                            className="px-5 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                          >
                            Campos
                          </th>
                          <th
                            scope="col"
                            className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
                          >
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-50">
                        {displayUsers.map((user) => {
                          const { completed, total } =
                            getCompletedFieldsCount(user);
                          const progressPercentage = (completed / total) * 100;

                          return (
                            <tr
                              key={user.id}
                              className="hover:bg-blue-50/20 transition-colors border-b border-gray-50 last:border-0 group"
                            >
                              {/* Usuario */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#097EEC] to-[#0562C7] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                                  </div>
                                  <span className="text-sm font-medium text-gray-800">
                                    {user.name}
                                  </span>
                                </div>
                              </td>
                              {/* Email */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <Mail className="h-3 w-3 text-gray-300 flex-shrink-0" />
                                  <span className="text-sm text-gray-500">
                                    {user.email}
                                  </span>
                                </div>
                              </td>
                              {/* Cédula */}
                              <td className="px-5 py-3.5 whitespace-nowrap hidden md:table-cell">
                                <div className="flex items-center gap-1.5">
                                  <IconId className="h-3 w-3 text-gray-300 flex-shrink-0" />
                                  <span className="text-sm text-gray-500">
                                    {user.cedula || "—"}
                                  </span>
                                </div>
                              </td>
                              {/* Rol */}
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <select
                                  value={getPrimaryRole(user)}
                                  onChange={(e) =>
                                    user.id &&
                                    handleRoleChange(user.id, e.target.value)
                                  }
                                  className="px-2.5 py-1 text-sm font-medium rounded-full cursor-pointer focus:ring-2 focus:ring-[#097EEC]/30 outline-none bg-white/70 backdrop-blur-sm border border-white/40 shadow-sm text-gray-700"
                                >
                                  <option value="PERSON">Person</option>
                                  <option value="BUSINESS">Business</option>
                                  <option value="ORGANIZADOR">
                                    Organizador
                                  </option>
                                  <option value="ADMIN">Admin</option>
                                </select>
                              </td>
                              {/* Verificado */}
                              <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center gap-1.5">
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
                                    <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#097EEC]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#097EEC]"></div>
                                  </label>
                                  {user.isVerify ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-400" />
                                  )}
                                </div>
                              </td>
                              {/* Plan */}
                              <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                <select
                                  value={user.plan || UserPlan.FREE}
                                  onChange={(e) =>
                                    user.id &&
                                    handlePlanChange(
                                      user.id,
                                      e.target.value as UserPlan,
                                    )
                                  }
                                  className={`px-2.5 py-1 text-xs font-medium rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-[#097EEC]/30 outline-none ${getPlanBadgeColor(user.plan)}`}
                                >
                                  <option value={UserPlan.FREE}>Free</option>
                                  <option value={UserPlan.PREMIUM}>
                                    Premium
                                  </option>
                                  <option value={UserPlan.CREATOR}>
                                    Creador
                                  </option>
                                </select>
                              </td>
                              {/* Campos */}
                              <td className="px-5 py-3.5 whitespace-nowrap text-center">
                                <div className="flex flex-col items-center gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 bg-gray-100 rounded-full h-1.5">
                                      <div
                                        className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(completed, total)}`}
                                        style={{
                                          width: `${progressPercentage}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 tabular-nums">
                                      {completed}/{total}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      handleViewRequiredFields(user)
                                    }
                                    className="text-[11px] text-[#097EEC] hover:text-[#0562C7] font-medium flex items-center gap-1 hover:underline transition-colors"
                                  >
                                    <Eye className="h-3 w-3" />
                                    Ver
                                  </button>
                                </div>
                              </td>
                              {/* Acciones */}
                              <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                <div className="flex justify-end items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() =>
                                      alert(`Editar usuario con ID: ${user.id}`)
                                    }
                                    className="p-1.5 rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                                    title="Editar"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleViewBankInfo(user)}
                                    className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                                    title="Ver información bancaria"
                                  >
                                    <CreditCard className="h-4 w-4" />
                                  </button>
                                  {currentUser?.isSuperAdmin && user.email && (
                                    <button
                                      onClick={() =>
                                        handleInviteSuperAdmin(user)
                                      }
                                      className="p-1.5 rounded-md text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition-colors"
                                      title="Invitar como super admin"
                                    >
                                      <Shield className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      user.id && handleDelete(user.id)
                                    }
                                    className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4" />
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
                  <div className="py-20 text-center">
                    <div className="bg-gray-50 border border-gray-100 inline-flex rounded-full p-5 mb-4">
                      <UserIcon className="h-9 w-9 text-gray-300" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-700">
                      No hay usuarios disponibles
                    </h3>
                    <p className="mt-1.5 text-sm text-gray-400">
                      No se encontraron usuarios que coincidan con tu búsqueda.
                    </p>
                  </div>
                )}

                {/* Pagination - Solo mostrar si no hay búsqueda activa */}
                {!searchTerm && pagination.totalPages > 1 && (
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
                  !searchTerm &&
                  displayUsers.length > 0 && (
                    <div className="mt-5 text-xs text-gray-400 text-center">
                      Mostrando{" "}
                      <span className="font-medium text-gray-600">
                        {displayUsers.length}
                      </span>{" "}
                      de{" "}
                      <span className="font-medium text-gray-600">
                        {pagination.total}
                      </span>{" "}
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

                            {field.name === "rut" && (
                              <div className="bg-white p-3 rounded border">
                                {field.value && field.value.length > 0 ? (
                                  <div className="space-y-3">
                                    <p className="text-sm font-medium text-gray-900">
                                      Documento RUT ({field.value.length}{" "}
                                      archivo{field.value.length > 1 ? "s" : ""}
                                      )
                                    </p>
                                    {field.value.map((doc: RutDocument) => (
                                      <div
                                        key={doc.id}
                                        className="bg-gray-50 border rounded-lg p-3 space-y-3"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3 min-w-0">
                                            <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                                            <div className="min-w-0">
                                              <p className="text-sm font-medium text-gray-900 truncate">
                                                {doc.file_path.split("/").pop()}
                                              </p>
                                              <span
                                                className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                                                  doc.status === "approved"
                                                    ? "bg-green-100 text-green-800"
                                                    : doc.status === "rejected"
                                                      ? "bg-red-100 text-red-800"
                                                      : "bg-yellow-100 text-yellow-800"
                                                }`}
                                              >
                                                {doc.status === "approved"
                                                  ? "Aprobado"
                                                  : doc.status === "rejected"
                                                    ? "Rechazado"
                                                    : "Pendiente"}
                                              </span>
                                            </div>
                                          </div>
                                          <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors flex-shrink-0"
                                          >
                                            <Eye className="h-3 w-3" />
                                            Ver PDF
                                          </a>
                                        </div>

                                        {doc.description &&
                                          doc.status === "rejected" && (
                                            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                              <p className="font-medium text-blue-800">
                                                Comentarios:
                                              </p>
                                              <p className="text-blue-700">
                                                {doc.description}
                                              </p>
                                            </div>
                                          )}

                                        <div className="flex gap-2">
                                          <button
                                            onClick={async () => {
                                              try {
                                                await RutService.reviewRut(
                                                  doc.id,
                                                  "approved",
                                                );
                                                toast.success("RUT aprobado");
                                                if (selectedUser) {
                                                  const docs =
                                                    await RutService.getUserRutById(
                                                      selectedUser.id!,
                                                    );
                                                  setRutFiles(docs);
                                                }
                                              } catch (e) {
                                                toast.error(
                                                  "Error al aprobar RUT",
                                                );
                                              }
                                            }}
                                            disabled={doc.status === "approved"}
                                            className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                              doc.status === "approved"
                                                ? "bg-green-100 text-green-800 cursor-not-allowed"
                                                : "bg-green-600 text-white hover:bg-green-700"
                                            }`}
                                          >
                                            <CheckCircle className="h-3 w-3 inline mr-1" />
                                            {doc.status === "approved"
                                              ? "Aprobado"
                                              : "Aprobar"}
                                          </button>
                                          <button
                                            onClick={async () => {
                                              const reason =
                                                prompt("Razón del rechazo:");
                                              if (reason === null) return;
                                              try {
                                                await RutService.reviewRut(
                                                  doc.id,
                                                  "rejected",
                                                  reason,
                                                );
                                                toast.success("RUT rechazado");
                                                if (selectedUser) {
                                                  const docs =
                                                    await RutService.getUserRutById(
                                                      selectedUser.id!,
                                                    );
                                                  setRutFiles(docs);
                                                }
                                              } catch (e) {
                                                toast.error(
                                                  "Error al rechazar RUT",
                                                );
                                              }
                                            }}
                                            disabled={doc.status === "rejected"}
                                            className={`flex-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                              doc.status === "rejected"
                                                ? "bg-red-100 text-red-800 cursor-not-allowed"
                                                : "bg-red-600 text-white hover:bg-red-700"
                                            }`}
                                          >
                                            <XCircle className="h-3 w-3 inline mr-1" />
                                            {doc.status === "rejected"
                                              ? "Rechazado"
                                              : "Rechazar"}
                                          </button>
                                        </div>

                                        {doc.reviewedBy &&
                                          doc.status !== "pending" && (
                                            <p className="text-xs text-gray-500">
                                              Revisado por:{" "}
                                              {doc.reviewedBy.name}
                                            </p>
                                          )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-600">
                                    No se ha subido el documento RUT
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
