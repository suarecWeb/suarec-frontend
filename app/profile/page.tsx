"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  FileText,
  Building2,
  Shield,
  Edit,
  AlertCircle,
  MessageSquare,
  FileTextIcon as FileText2,
  Clock,
  Eye,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { UserService } from "@/services/UsersService";
import { User } from "@/interfaces/user.interface";
import { TokenPayload } from "@/interfaces/auth.interface";
import ExperienceDialog from "@/components/ExperienceDialog";
import { toast } from "react-hot-toast";
import { ExperienceService } from "@/services/ExperienceService";
import { Experience } from "@/interfaces/user.interface";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserAvatarEditable } from "@/components/ui/UserAvatar";
import { UserGallery } from "@/components/ui/UserGallery";
import DownloadCVButton from "@/components/download-cv-button";
import BankInfoForm from "@/components/bank-info-form";
import BankInfoDisplay from "@/components/bank-info-display";
import { BankInfo } from "@/interfaces/bank-info";
import { BankInfoService } from "@/services/bank-info.service";

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [showBankInfoForm, setShowBankInfoForm] = useState(false);
  const [bankInfoLoading, setBankInfoLoading] = useState(false);
  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<
    Experience | undefined
  >();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get("token");

        if (!token) {
          router.push("/auth/login");
          return;
        }

        // Decodificar el token para obtener el ID del usuario
        const decoded = jwtDecode<TokenPayload>(token);

        // Obtener los datos del usuario desde el backend
        const response = await UserService.getUserById(decoded.id);
        const userData = response.data;

        // Establecer los datos del usuario
        setUser(userData);
        setLoading(false);
      } catch (err) {
        toast.error("No se pudo cargar la información del perfil");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  // Cargar información bancaria
  useEffect(() => {
    const fetchBankInfo = async () => {
      if (!user?.id) return;

      setBankInfoLoading(true);
      try {
        const result = await BankInfoService.getBankInfo(Number(user.id));
        if (result.success) {
          setBankInfo(result.data || null);
        }
      } catch (error) {
        console.error("Error al cargar información bancaria:", error);
      } finally {
        setBankInfoLoading(false);
      }
    };

    fetchBankInfo();
  }, [user]);

  const handleBankInfoSave = (data: BankInfo) => {
    setBankInfo(data);
    setShowBankInfoForm(false);
    // El toast de éxito ya se muestra en el formulario
  };

  const handleBankInfoDelete = () => {
    setBankInfo(null);
    setShowBankInfoForm(false);
    // El toast de éxito ya se muestra en el formulario
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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

  // Función para extraer los nombres de los roles
  const getRoleNames = (roles: any[] | undefined): string[] => {
    if (!roles) return [];

    return roles.map((role) => {
      if (typeof role === "string") return role;
      if (typeof role === "object" && role.name) return role.name;
      return "Unknown";
    });
  };

  const handleAddExperience = () => {
    setSelectedExperience(undefined);
    setExperienceDialogOpen(true);
  };

  const handleEditExperience = (experience: Experience) => {
    setSelectedExperience(experience);
    setExperienceDialogOpen(true);
  };

  const handleDeleteExperience = (id: string) => {
    setExperienceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteExperience = async () => {
    if (!experienceToDelete) return;
    setDeleteDialogOpen(false);
    setSuccess(null);
    setError(null);
    try {
      await ExperienceService.deleteExperience(experienceToDelete);
      toast.success("Experiencia eliminada correctamente");
      // Recargar los datos del usuario
      const token = Cookies.get("token");
      if (token) {
        const decoded = jwtDecode<TokenPayload>(token);
        const response = await UserService.getUserById(decoded.id);
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error al eliminar la experiencia:", error);
      toast.error("Ocurrió un error al eliminar la experiencia");
    } finally {
      setExperienceToDelete(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Mi perfil</h1>
            <p className="mt-2 text-blue-100">
              Gestiona tu información personal y revisa tu actividad
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
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

          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <Skeleton className="h-40 w-40 rounded-full mx-auto" />
                  <Skeleton className="h-8 w-3/4 mx-auto mt-4" />
                  <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
                  <div className="mt-6 space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <Skeleton className="h-10 w-full mb-6" />
                  <div className="space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            user && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-[#097EEC] to-[#2171BC] p-6 text-white">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                      <UserAvatarEditable
                        user={{
                          id: user.id
                            ? typeof user.id === "string"
                              ? parseInt(user.id)
                              : user.id
                            : 0,
                          name: user.name,
                          profile_image: user.profile_image,
                          email: user.email,
                        }}
                        size="xl"
                        onImageUploaded={async (imageUrl) => {
                          try {
                            // Actualizar el perfil del usuario con la nueva imagen
                            await UserService.updateUser(user.id as string, {
                              profile_image: imageUrl,
                            });
                            // Recargar los datos del usuario
                            const token = Cookies.get("token");
                            if (token) {
                              const decoded = jwtDecode<TokenPayload>(token);
                              const response = await UserService.getUserById(
                                decoded.id,
                              );
                              setUser(response.data);
                            }
                            setSuccess(
                              "Imagen de perfil actualizada correctamente",
                            );
                          } catch (error) {
                            console.error(
                              "Error updating profile image:",
                              error,
                            );
                            toast.error(
                              "Error al actualizar la imagen de perfil",
                            );
                          }
                        }}
                      />
                    </div>
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      {/* <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                        {getRoleNames(user.roles).map((roleName, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {roleName}
                          </span>
                        ))}
                      </div> */}
                    </div>
                    <div className="ml-auto hidden md:block">
                      <Link href="/profile/edit">
                        <button className="bg-white text-[#097EEC] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          <span>Editar perfil</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Profile Content */}
                <div className="p-6">
                  <div className="md:hidden mb-6">
                    <Link href="/profile/edit">
                      <button className="w-full bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2">
                        <Edit className="h-4 w-4" />
                        <span>Editar perfil</span>
                      </button>
                    </Link>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Column - Gallery and Personal Info */}
                    <div className="md:w-1/3">
                      {/* User Gallery - Now at the top */}
                      <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <UserGallery
                          userId={
                            user.id
                              ? typeof user.id === "string"
                                ? parseInt(user.id)
                                : user.id
                              : 0
                          }
                        />
                      </div>

                      {/* Personal Information - Now below gallery */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Información personal
                        </h3>

                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <Mail className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="text-gray-800">{user.email}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Teléfono</p>
                              <p className="text-gray-800">{user.cellphone}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">
                                Fecha de nacimiento
                              </p>
                              <p className="text-gray-800">
                                {formatDate(user.born_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <UserIcon className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Género</p>
                              <p className="text-gray-800">{user.genre}</p>
                            </div>
                          </div>

                          {/* Profesión */}
                          {user.profession && (
                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">
                                  Profesión
                                </p>
                                <p className="text-gray-800">
                                  {user.profession}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Habilidades */}
                          {user.skills && user.skills.length > 0 && (
                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">
                                  Habilidades
                                </p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {user.skills.map((skill, idx) => (
                                    <span
                                      key={idx}
                                      className="bg-[#097EEC]/10 text-[#097EEC] px-2 py-0.5 rounded-full text-xs font-medium"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SOBRE MÍ */}
                          <div className="flex items-start gap-3">
                            <FileText2 className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500 font-semibold">
                                Sobre mí
                              </p>
                              <p className="text-gray-800 whitespace-pre-line">
                                {user.bio || "No hay información disponible."}
                              </p>
                            </div>
                          </div>

                          {/* EDUCACIÓN */}
                          <div className="flex items-start gap-3 mt-4">
                            <FileText2 className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-gray-500 font-semibold">
                                  Educación
                                </p>
                              </div>
                              {user.education && user.education.length > 0 ? (
                                <div className="space-y-3">
                                  {user.education.map((edu, idx) => (
                                    <div
                                      key={idx}
                                      className="border-l-2 border-[#097EEC]/20 pl-3"
                                    >
                                      <h4 className="font-medium text-gray-800">
                                        {edu.degree}{" "}
                                        {edu.fieldOfStudy &&
                                          `- ${edu.fieldOfStudy}`}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {edu.institution}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {formatDate(edu.startDate)} -{" "}
                                        {edu.endDate
                                          ? formatDate(edu.endDate)
                                          : "Presente"}
                                      </p>
                                      {edu.description && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          {edu.description}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-800">
                                  No hay información educativa registrada.
                                </p>
                              )}
                            </div>
                          </div>

                          {/* REFERENCIAS */}
                          <div className="flex items-start gap-3 mt-4">
                            <FileText2 className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-gray-500 font-semibold">
                                  Referencias
                                </p>
                              </div>
                              {user.references && user.references.length > 0 ? (
                                <div className="space-y-3">
                                  {user.references.map((ref, idx) => (
                                    <div
                                      key={idx}
                                      className="border-l-2 border-[#097EEC]/20 pl-3"
                                    >
                                      <h4 className="font-medium text-gray-800">
                                        {ref.name}{" "}
                                        <span className="text-xs text-gray-500">
                                          ({ref.relationship})
                                        </span>
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        Contacto: {ref.contact}
                                      </p>
                                      {ref.comment && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          {ref.comment}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-800">
                                  No hay referencias registradas.
                                </p>
                              )}
                            </div>
                          </div>

                          {/* REDES SOCIALES */}
                          <div className="flex items-start gap-3 mt-4">
                            <FileText2 className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-gray-500 font-semibold">
                                  Redes
                                </p>
                              </div>
                              {user.socialLinks &&
                              user.socialLinks.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {user.socialLinks.map((link, idx) => (
                                    <a
                                      key={idx}
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-[#097EEC]/10 text-[#097EEC] rounded-full text-xs font-medium hover:bg-[#097EEC]/20 transition-colors"
                                    >
                                      {link.type}
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-800">
                                  No hay redes registradas.
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Experiencias */}
                          {user.experiences && user.experiences.length > 0 && (
                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                  <p className="text-sm text-gray-500">
                                    Experiencia
                                  </p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddExperience}
                                    className="text-[#097EEC] hover:text-[#0A6BC7]"
                                  >
                                    Agregar experiencia
                                  </Button>
                                </div>
                                <div className="space-y-4">
                                  {user.experiences.map((exp, idx) => (
                                    <div
                                      key={idx}
                                      className="border-l-2 border-[#097EEC]/20 pl-3 relative group"
                                    >
                                      <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleEditExperience(exp)
                                          }
                                          className="text-gray-500 hover:text-[#097EEC]"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteExperience(exp.id)
                                          }
                                          className="text-gray-500 hover:text-red-500"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <h4 className="font-medium text-gray-800">
                                        {exp.title}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {exp.company}
                                      </p>
                                      {exp.location && (
                                        <p className="text-sm text-gray-500">
                                          {exp.location}
                                        </p>
                                      )}
                                      <p className="text-sm text-gray-500">
                                        {formatDate(exp.startDate)} -{" "}
                                        {exp.currentPosition
                                          ? "Presente"
                                          : exp.endDate
                                            ? formatDate(exp.endDate)
                                            : ""}
                                      </p>
                                      {exp.description && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          {exp.description}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Si no hay experiencias, mostrar el botón para agregar */}
                          {(!user.experiences ||
                            user.experiences.length === 0) && (
                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">
                                  Experiencia
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleAddExperience}
                                  className="mt-2 text-[#097EEC] hover:text-[#0A6BC7]"
                                >
                                  Agregar experiencia
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-[#097EEC] mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">
                                Miembro desde
                              </p>
                              <p className="text-gray-800">
                                {user.created_at
                                  ? formatDate(user.created_at)
                                  : "N/A"}
                              </p>
                            </div>
                          </div>

                          <DownloadCVButton
                            user={user}
                            variant="outline"
                            className="border-[#097EEC] text-[#097EEC] hover:bg-[#097EEC]/10 mb-4"
                          />
                        </div>
                      </div>

                      {/* Company Info (if BUSINESS role) */}
                      {user.company && (
                        <div className="bg-gray-50 rounded-lg p-6 mt-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Información de empresa
                          </h3>

                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <Building2 className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Nombre</p>
                                <p className="text-gray-800">
                                  {user.company.name}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <FileText2 className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">NIT</p>
                                <p className="text-gray-800">
                                  {user.company.nit}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Mail className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-gray-800">
                                  {user.company.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Phone className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">
                                  Teléfono
                                </p>
                                <p className="text-gray-800">
                                  {user.company.cellphone}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Calendar className="h-5 w-5 text-[#097EEC] mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500">
                                  Fecha de Fundación
                                </p>
                                <p className="text-gray-800">
                                  {formatDate(user.company.born_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Activity */}
                    <div className="md:w-2/3">
                      <Tabs defaultValue="publications">
                        <TabsList className="w-full mb-6">
                          <TabsTrigger value="publications" className="flex-1">
                            Publicaciones
                          </TabsTrigger>
                          <TabsTrigger value="comments" className="flex-1">
                            Comentarios
                          </TabsTrigger>
                          <TabsTrigger value="bankinfo" className="flex-1">
                            Información Bancaria
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="publications">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Mis publicaciones
                          </h3>

                          {user.publications && user.publications.length > 0 ? (
                            <div className="space-y-4">
                              {user.publications.map((pub: any) => (
                                <div
                                  key={pub.id}
                                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex justify-between">
                                    <h4 className="text-lg font-medium text-gray-800">
                                      {pub.title}
                                    </h4>
                                    <span className="text-xs font-medium text-[#097EEC] bg-blue-50 px-2 py-0.5 rounded-full">
                                      {pub.category}
                                    </span>
                                  </div>

                                  {pub.description && (
                                    <p className="text-gray-600 mt-2">
                                      {pub.description}
                                    </p>
                                  )}

                                  <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{formatDate(pub.created_at)}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <Eye className="h-4 w-4" />
                                      <span>{pub.visitors || 0} visitas</span>
                                    </div>

                                    <Link href={`/publications/${pub.id}/edit`}>
                                      <button className="text-[#097EEC] hover:text-[#0A6BC7] transition-colors flex items-center gap-1">
                                        <Edit className="h-4 w-4" />
                                        <span>Editar</span>
                                      </button>
                                    </Link>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                              <h4 className="text-lg font-medium text-gray-800">
                                No hay publicaciones
                              </h4>
                              <p className="text-gray-500 mt-2">
                                Aún no has creado ninguna publicación. Puedes
                                crear una desde el feed.
                              </p>
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="comments">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            Mis comentarios
                          </h3>

                          {user.comments && user.comments.length > 0 ? (
                            <div className="space-y-4">
                              {user.comments.map((comment: any) => (
                                <div
                                  key={comment.id}
                                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="bg-[#097EEC]/10 rounded-full p-2 flex-shrink-0">
                                      <MessageSquare className="h-5 w-5 text-[#097EEC]" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-gray-600">
                                        {comment.content}
                                      </p>

                                      {comment.publication && (
                                        <Link
                                          href={`/publications/${comment.publication.id}`}
                                        >
                                          <p className="text-sm text-[#097EEC] hover:underline mt-2">
                                            En: {comment.publication.title}
                                          </p>
                                        </Link>
                                      )}

                                      <div className="flex items-center mt-2 text-xs text-gray-500">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        <span>
                                          {formatDate(comment.created_at)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                              <h4 className="text-lg font-medium text-gray-800">
                                No hay comentarios
                              </h4>
                              <p className="text-gray-500 mt-2">
                                Aún no has realizado ningún comentario
                              </p>
                              <Link href="/publications">
                                <button className="mt-4 bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors">
                                  Ver Publicaciones
                                </button>
                              </Link>
                            </div>
                          )}
                        </TabsContent>

                        {/* Tab de Información Bancaria */}
                        <TabsContent value="bankinfo">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Información Bancaria
                          </h3>{" "}
                          {bankInfoLoading ? (
                            <div className="space-y-4">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          ) : showBankInfoForm ? (
                            <BankInfoForm
                              userId={Number(user?.id)}
                              initialData={bankInfo}
                              onSave={handleBankInfoSave}
                              onDelete={handleBankInfoDelete}
                              onCancel={() => setShowBankInfoForm(false)}
                            />
                          ) : bankInfo ? (
                            <BankInfoDisplay
                              bankInfo={bankInfo}
                              onEdit={() => setShowBankInfoForm(true)}
                              isOwner={true}
                            />
                          ) : (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                              <h4 className="text-lg font-medium text-gray-800">
                                No hay información bancaria
                              </h4>
                              <p className="text-gray-500 mt-2">
                                Agrega tu información bancaria para que los
                                administradores puedan procesar pagos y
                                depósitos
                              </p>
                              <Button
                                onClick={() => setShowBankInfoForm(true)}
                                className="mt-4 bg-[#097EEC] text-white hover:bg-[#0A6BC7] transition-colors"
                              >
                                Agregar Información Bancaria
                              </Button>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar experiencia */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>¿Eliminar experiencia?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 mb-4">
            ¿Estás seguro de que deseas eliminar esta experiencia? Esta acción
            no se puede deshacer.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#097EEC] hover:bg-[#0A6BC7] text-white"
              onClick={confirmDeleteExperience}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de experiencia */}
      <ExperienceDialog
        open={experienceDialogOpen}
        onOpenChange={setExperienceDialogOpen}
        userId={Number(user?.id)}
        experience={selectedExperience}
        onSuccess={() => {
          toast.success("Experiencia agregada correctamente");
          setError(null);
          // Recargar los datos del usuario
          const token = Cookies.get("token");
          if (token) {
            const decoded = jwtDecode<TokenPayload>(token);
            UserService.getUserById(decoded.id).then((response) => {
              setUser(response.data);
            });
          }
        }}
      />
    </>
  );
};

export default ProfilePage;
