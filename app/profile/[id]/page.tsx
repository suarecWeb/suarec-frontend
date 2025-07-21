"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { useRouter, useParams } from "next/navigation";
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
  AlertCircle,
  MessageSquare,
  FileTextIcon as FileText2,
  Clock,
  Eye,
  CheckCircle,
  MessageCircle,
  Download,
  ExternalLink,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  ArrowLeft,
  Send,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { UserService } from "@/services/UsersService";
import { User } from "@/interfaces/user.interface";
import { TokenPayload } from "@/interfaces/auth.interface";
import StartChatButton from "@/components/start-chat-button";
import DownloadCVButton from "@/components/download-cv-button";
import PublicationService from "@/services/PublicationsService";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface PublicProfilePageProps {
  params: {
    id: string;
  };
}

const PublicProfilePage = () => {
  const params = useParams();
  const userId = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!userId) {
          setError("ID de usuario no válido");
          setLoading(false);
          return;
        }

        // Obtener información del usuario actual (si está logueado)
        const token = Cookies.get("token");
        if (token) {
          try {
            const decoded = jwtDecode<TokenPayload>(token);
            setCurrentUser(decoded);
          } catch (err) {
            console.log("Token inválido o expirado");
          }
        }

        // Obtener los datos del usuario que se está viendo
        const response = await UserService.getUserById(parseInt(userId));
        const userData = response.data;

        setUser(userData);
        setLoading(false);
      } catch (err: any) {
        console.error("Error al obtener perfil:", err);
        if (err.response?.status === 404) {
          setError("Usuario no encontrado");
        } else {
          setError("No se pudo cargar la información del perfil");
        }
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, router]);

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const calculateAge = (birthDate: Date | string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  const calculateExperience = (experiences: any[]) => {
    if (!experiences || experiences.length === 0) return 0;

    let totalMonths = 0;
    experiences.forEach((exp) => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.currentPosition ? new Date() : new Date(exp.endDate);
      const months =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());
      totalMonths += months;
    });

    return Math.floor(totalMonths / 12);
  };

  const getRoleNames = (roles: any[] | undefined): string[] => {
    if (!roles) return [];
    return roles.map((role) => {
      if (typeof role === "string") return role;
      if (typeof role === "object" && role.name) return role.name;
      return "Unknown";
    });
  };

  const handleContactUser = () => {
    if (user?.email) {
      window.location.href = `mailto:${user.email}`;
    }
  };

  const handleSendMessage = () => {
    if (currentUser) {
      router.push(`/chat?userId=${userId}`);
    } else {
      router.push("/auth/login");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen pb-12">
          <div className="bg-[#097EEC] text-white py-8">
            <div className="container mx-auto px-4">
              <Skeleton className="h-8 w-48 bg-white/20" />
              <Skeleton className="h-4 w-64 bg-white/20 mt-2" />
            </div>
          </div>

          <div className="container mx-auto px-4 -mt-6">
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
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen pb-12">
          <div className="bg-[#097EEC] text-white py-8">
            <div className="container mx-auto px-4">
              <h1 className="text-3xl font-bold">Perfil de usuario</h1>
              <p className="mt-2 text-blue-100">Información del candidato</p>
            </div>
          </div>

          <div className="container mx-auto px-4 -mt-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-md flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-700">{error}</p>
                <div className="mt-4">
                  <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8 mt-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => router.back()}
                variant="ghost"
                className="text-white px-2 py-1"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <p className="text-blue-100">
                Información profesional de {user.name}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[#097EEC] to-[#2171BC] p-6 text-white">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <UserAvatar
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
                  />
                </div>

                <div className="text-center md:text-left flex-1">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  {user.profession && (
                    <p className="text-blue-100 text-lg mt-1">
                      {user.profession}
                    </p>
                  )}

                  {/* <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
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

                  {/* Stats rápidas */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm">
                    {user.born_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{calculateAge(user.born_at)} años</span>
                      </div>
                    )}
                    {user.experiences && user.experiences.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        <span>
                          {calculateExperience(user.experiences)} años exp.
                        </span>
                      </div>
                    )}
                    {user.created_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Desde {formatDate(user.created_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-3 min-w-0">
                  {currentUser && (
                    <StartChatButton
                      recipientId={parseInt(userId)}
                      recipientName={user.name}
                      variant="outline"
                      recipientType={user.company ? "business" : "person"}
                      context={!user.company ? "profile" : undefined}
                    />
                  )}

                  {!user.company && (
                    <DownloadCVButton
                      user={user}
                      variant="outline"
                      className="bg-white text-black hover:text-[#097EEC] hover:bg-gray-100"
                      isPublicProfile={true}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column - Personal Info */}
                <div className="lg:w-1/3">
                  {/* Información personal */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Información de contacto
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-[#097EEC] mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-gray-800">{user.email}</p>
                        </div>
                      </div>

                      {user.cellphone && (
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-[#097EEC] mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Teléfono</p>
                            <p className="text-gray-800">{user.cellphone}</p>
                          </div>
                        </div>
                      )}

                      {user.born_at && (
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-[#097EEC] mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Edad</p>
                            <p className="text-gray-800">
                              {calculateAge(user.born_at)} años
                            </p>
                          </div>
                        </div>
                      )}

                      {user.genre && (
                        <div className="flex items-start gap-3">
                          <UserIcon className="h-5 w-5 text-[#097EEC] mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Género</p>
                            <p className="text-gray-800">
                              {user.genre === "M"
                                ? "Masculino"
                                : user.genre === "F"
                                  ? "Femenino"
                                  : user.genre === "O"
                                    ? "Otro"
                                    : "No especificado"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Profesión */}
                      {user.profession && (
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-[#097EEC] mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Profesión</p>
                            <p className="text-gray-800">{user.profession}</p>
                          </div>
                        </div>
                      )}

                      {/* Miembro desde */}
                      {user.created_at && (
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-[#097EEC] mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Miembro desde
                            </p>
                            <p className="text-gray-800">
                              {formatDate(user.created_at)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* REDES SOCIALES */}
                      <div className="flex items-start gap-3 mt-4">
                        <FileText2 className="h-5 w-5 text-[#097EEC] mt-0.5" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-sm text-gray-500 font-semibold">
                              Redes sociales
                            </p>
                          </div>
                          {user.socialLinks && user.socialLinks.length > 0 ? (
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
                              Sin redes sociales registradas.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* HABILIDADES */}
                      {user.skills && user.skills.length > 0 && (
                        <div className="flex items-start gap-3 mt-4">
                          <FileText className="h-5 w-5 text-[#097EEC] mt-0.5" />
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-sm text-gray-500 font-semibold">
                                Habilidades
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {user.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="bg-[#097EEC]/10 text-[#097EEC] px-2 py-1 rounded-full text-xs font-medium border border-[#097EEC]/20"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Professional Info */}
                <div className="lg:w-2/3">
                  {/* Sobre mí */}
                  {user.bio && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText2 className="h-5 w-5 text-[#097EEC]" />
                        Sobre {user.name}
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {user.bio}
                      </p>
                    </div>
                  )}

                  {/* Experiencia profesional */}
                  {user.experiences && user.experiences.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-[#097EEC]" />
                        Experiencia profesional
                      </h3>
                      <div className="space-y-6">
                        {user.experiences.map((exp, idx) => (
                          <div
                            key={idx}
                            className="relative pl-6 border-l-2 border-[#097EEC]/20 last:border-l-0"
                          >
                            <div className="absolute -left-2 top-0 w-4 h-4 bg-[#097EEC] rounded-full"></div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-800 text-lg">
                                {exp.title}
                              </h4>
                              <p className="text-[#097EEC] font-medium">
                                {exp.company}
                              </p>
                              {exp.location && (
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {exp.location}
                                </p>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDate(exp.startDate)} -{" "}
                                {exp.currentPosition
                                  ? "Presente"
                                  : exp.endDate
                                    ? formatDate(exp.endDate)
                                    : ""}
                              </p>
                              {exp.description && (
                                <p className="text-gray-600 mt-3 leading-relaxed">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Educación */}
                  {user.education && user.education.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-[#097EEC]" />
                        Educación
                      </h3>
                      <div className="space-y-4">
                        {user.education.map((edu, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-800">
                              {edu.degree}{" "}
                              {edu.fieldOfStudy && `en ${edu.fieldOfStudy}`}
                            </h4>
                            <p className="text-[#097EEC] font-medium">
                              {edu.institution}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(edu.startDate)} -{" "}
                              {edu.endDate
                                ? formatDate(edu.endDate)
                                : "Presente"}
                            </p>
                            {edu.description && (
                              <p className="text-gray-600 mt-2">
                                {edu.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Publicaciones del usuario */}
                  {user.publications && user.publications.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#097EEC]" />
                        Publicaciones de {user.name}
                      </h3>
                      <div className="space-y-4">
                        {user.publications.slice(0, 3).map((pub: any) => {
                          const isOwnPublication =
                            currentUser && currentUser.id === parseInt(userId);
                          const canEdit =
                            isOwnPublication ||
                            (currentUser &&
                              currentUser.roles?.some(
                                (role: any) => role.name === "ADMIN",
                              ));

                          return (
                            <div
                              key={pub.id}
                              className="bg-gray-50 rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-gray-800">
                                  {pub.title}
                                </h4>
                                <span className="text-xs font-medium text-[#097EEC] bg-blue-50 px-2 py-0.5 rounded-full">
                                  {pub.category}
                                </span>
                              </div>
                              {pub.description && (
                                <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                                  {pub.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(pub.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Link href={`/feed/${pub.id}`}>
                                    <button className="text-[#097EEC] hover:text-[#0A6BC7] text-xs flex items-center gap-1">
                                      Ver más{" "}
                                      <ExternalLink className="h-3 w-3" />
                                    </button>
                                  </Link>
                                  {canEdit && (
                                    <>
                                      <Link
                                        href={`/publications/${pub.id}/edit`}
                                      >
                                        <button className="text-amber-600 hover:text-amber-700 text-xs flex items-center gap-1">
                                          <Edit className="h-3 w-3" />
                                          Editar
                                        </button>
                                      </Link>
                                      <button
                                        onClick={async () => {
                                          if (
                                            confirm(
                                              "¿Estás seguro de que deseas eliminar esta publicación?",
                                            )
                                          ) {
                                            try {
                                              await PublicationService.deletePublication(
                                                pub.id,
                                              );
                                              // Recargar la página para actualizar la lista
                                              window.location.reload();
                                            } catch (error) {
                                              console.error(
                                                "Error al eliminar publicación:",
                                                error,
                                              );
                                              alert(
                                                "Error al eliminar la publicación",
                                              );
                                            }
                                          }
                                        }}
                                        className="text-red-600 hover:text-red-700 text-xs flex items-center gap-1"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        Eliminar
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {user.publications.length > 3 && (
                          <div className="text-center mt-4">
                            <p className="text-sm text-gray-500">
                              y {user.publications.length - 3} publicación(es)
                              más
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de empresa (si es BUSINESS) */}
              {user.company && (
                <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    Información de empresa
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-[#097EEC] mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Nombre de la empresa
                          </p>
                          <p className="text-gray-800 font-medium">
                            {user.company.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FileText2 className="h-5 w-5 text-[#097EEC] mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">NIT</p>
                          <p className="text-gray-800">{user.company.nit}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-[#097EEC] mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Email corporativo
                          </p>
                          <p className="text-gray-800">{user.company.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-[#097EEC] mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Teléfono corporativo
                          </p>
                          <p className="text-gray-800">
                            {user.company.cellphone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {user.company.born_at && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-[#097EEC]" />
                        <div>
                          <p className="text-sm text-gray-500">Fundada en</p>
                          <p className="text-gray-800">
                            {formatDate(user.company.born_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicProfilePage;
