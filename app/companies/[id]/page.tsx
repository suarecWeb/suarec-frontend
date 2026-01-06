"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompanyService from "@/services/CompanyService";
import { Company } from "@/interfaces/company.interface";
import Navbar from "@/components/navbar";
import StartChatButton from "@/components/start-chat-button";
import ApplyCompanyButton from "@/components/apply-company-button";
import {
  MapPin,
  Edit,
  ArrowLeft,
  Users,
  MessageSquare,
  Briefcase,
  Building2,
  Mail,
  Phone,
  Calendar,
  Globe,
  User,
  Clock,
  Star,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function CompanyDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await CompanyService.getCompanyById(params.id);
        setCompany(response.data);
      } catch (err) {
        toast.error("Error al cargar la empresa");
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [params.id]);

  const isOwnerOrAdmin = () => {
    if (!company || !currentUserId) return false;
    return (
      company.user?.id === currentUserId.toString() ||
      userRoles.includes("ADMIN") ||
      userRoles.includes("BUSINESS")
    );
  };

  const canApply = () => {
    if (!currentUserId || !company) return false;
    return (
      userRoles.includes("PERSON") &&
      company.user?.id !== currentUserId.toString()
    );
  };

  const canChat = () => {
    if (!currentUserId || !company) return false;
    return company.user?.id !== currentUserId.toString();
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getCompanyAge = () => {
    if (!company?.born_at) return 0;
    const founded = new Date(company.born_at);
    const now = new Date();
    return now.getFullYear() - founded.getFullYear();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="bg-[#097EEC] text-white py-6 md:py-8">
            <div className="container mx-auto px-4">
              <div className="animate-pulse">
                <div className="h-6 md:h-8 bg-blue-200 rounded w-1/2 md:w-1/4 mb-4"></div>
                <div className="h-3 md:h-4 bg-blue-200 rounded w-3/4 md:w-1/2"></div>
              </div>
            </div>
          </div>
          <div className="container mx-auto px-4 -mt-4 md:-mt-6 pb-8 md:pb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8">
              <div className="animate-pulse space-y-4 md:space-y-6">
                <div className="h-8 md:h-12 bg-gray-200 rounded w-1/2 md:w-1/3"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3 md:space-y-4">
                    <div className="h-3 md:h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 md:h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <div className="h-3 md:h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 md:h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !company) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50">
          <div className="bg-[#097EEC] text-white py-6 md:py-8">
            <div className="container mx-auto px-4">
              <h1 className="text-2xl md:text-3xl font-eras-bold">
                Detalles de la Empresa
              </h1>
            </div>
          </div>
          <div className="container mx-auto px-4 -mt-4 md:-mt-6 pb-8 md:pb-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-eras-bold text-gray-900 mb-2">
                  Error al cargar
                </h3>
                <p className="text-gray-600 font-eras text-sm md:text-base">
                  {error || "No se pudo cargar la empresa"}
                </p>
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
      <div className="min-h-screen bg-gray-50">
        {/* Header azul extendido */}
        <div className="bg-[#097EEC] text-white py-6 md:py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              <Link
                href="/companies"
                className="inline-flex items-center text-blue-100 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                <span className="font-eras text-sm md:text-base">
                  Volver a compañías
                </span>
              </Link>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-eras-bold break-words">
              {company.name}
            </h1>
            <p className="mt-2 text-blue-100 font-eras text-sm md:text-base">
              Información detallada de la empresa
            </p>
          </div>
        </div>

        {/* Content con margen negativo para superposición */}
        <div className="container mx-auto px-4 -mt-4 md:-mt-6 pb-8 md:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              {/* Información principal */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 md:mb-6 gap-4">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                    {company.user?.profile_image ? (
                      <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-gray-200 shadow-lg">
                        <Image
                          src={company.user.profile_image}
                          alt={company.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-[#097EEC] rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-6 w-6 md:h-8 md:w-8 text-white" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl md:text-2xl font-eras-bold text-gray-900 break-words">
                        {company.name}
                      </h2>
                      <p className="text-gray-600 font-eras text-sm md:text-base break-all">
                        NIT: {company.nit}
                      </p>
                    </div>
                  </div>
                  {isOwnerOrAdmin() && (
                    <div className="flex-shrink-0 w-full sm:w-auto">
                      <Link href={`/companies/${company.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto border-[#097EEC] text-[#097EEC] hover:bg-[#097EEC] hover:text-white"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="group relative text-center p-6 md:p-8 bg-white/85 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
                    <div className="relative z-10">
                      <div className="text-2xl md:text-3xl font-eras-bold text-[#097EEC] mb-2 transition-transform duration-300">
                        {getCompanyAge()}
                      </div>
                      <div className="text-sm text-gray-600 font-eras">
                        Años de experiencia
                      </div>
                    </div>
                  </div>
                  <div className="group relative text-center p-6 md:p-8 bg-white/85 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
                    <div className="relative z-10">
                      <div className="text-2xl md:text-3xl font-eras-bold text-[#097EEC] mb-2 transition-transform duration-300">
                        {company.user ? "1" : "0"}
                      </div>
                      <div className="text-sm text-gray-600 font-eras">
                        Administrador
                      </div>
                    </div>
                  </div>
                  <div className="group relative text-center p-6 md:p-8 bg-white/85 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
                    <div className="relative z-10">
                      <div className="text-2xl md:text-3xl font-eras-bold text-[#097EEC] mb-2 transition-transform duration-300">
                        {new Date(company.created_at).getFullYear()}
                      </div>
                      <div className="text-sm text-gray-600 font-eras">
                        Año de registro
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información en hilo continuo */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Información de contacto */}
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-[#097EEC] rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-eras-bold text-gray-900">
                        Información de Contacto
                      </h3>
                    </div>
                    <div className="ml-11 space-y-3 relative">
                      <div className="absolute left-[-22px] top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      <div className="flex items-center gap-3 relative">
                        <div className="absolute left-[-26px] w-4 h-4 bg-white border-2 border-[#097EEC] rounded-full"></div>
                        <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 font-eras text-sm break-all">
                          {company.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 relative">
                        <div className="absolute left-[-26px] w-4 h-4 bg-white border-2 border-[#097EEC] rounded-full"></div>
                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 font-eras text-sm">
                          {company.cellphone}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 relative">
                        <div className="absolute left-[-26px] w-4 h-4 bg-white border-2 border-[#097EEC] rounded-full"></div>
                        <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 font-eras text-sm">
                          Fundada el {formatDate(company.born_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-[#097EEC] rounded-full flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-eras-bold text-gray-900">
                        Ubicación
                      </h3>
                    </div>
                    <div className="ml-11">
                      {company.latitude && company.longitude ? (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-gray-700 font-eras text-sm break-words">
                              {company.address}
                            </p>
                            <p className="text-gray-600 font-eras text-sm">
                              {company.city}, {company.country}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-gray-500">
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="font-eras text-sm">
                            No hay ubicación registrada
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrador */}
              {company.user && (
                <div className="group relative bg-white/85 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden p-6 md:p-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-eras-bold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-[#097EEC]" />
                      Administrador
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-12 h-12 bg-[#097EEC] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-eras-bold text-gray-900 text-base break-words mb-1">
                            {company.user.name}
                          </h4>
                          <p className="text-gray-600 font-eras text-sm break-all">
                            {company.user.email}
                          </p>
                        </div>
                      </div>
                      {canChat() && (
                        <div className="flex-shrink-0 w-full sm:w-auto">
                          <StartChatButton
                            recipientId={parseInt(company.user?.id || "2")}
                            recipientName={company.user.name || company.name}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Call to Action para usuarios no logueados */}
              {!currentUserId && (
                <div className="bg-gradient-to-r from-[#097EEC] to-[#2171BC] rounded-xl p-4 md:p-6 text-white">
                  <h3 className="text-lg md:text-xl font-eras-bold mb-2">
                    ¿Interesado en esta empresa?
                  </h3>
                  <p className="text-blue-100 font-eras mb-4 text-sm md:text-base">
                    Inicia sesión para poder postularte o contactar con la
                    empresa
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/auth/login" className="w-full sm:w-auto">
                      <Button className="w-full bg-white text-[#097EEC] hover:bg-gray-100 font-eras">
                        Iniciar Sesión
                      </Button>
                    </Link>
                    <Link href="/auth/select-type" className="w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="w-full border-white text-white hover:bg-white hover:text-[#097EEC] font-eras"
                      >
                        Registrarse
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Acciones */}
            <div className="lg:col-span-1">
              <div className="group relative bg-white/85 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden p-6 md:p-8 lg:sticky lg:top-24">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-eras-bold text-gray-900 mb-6">
                    Acciones
                  </h3>

                  <div className="flex flex-col space-y-3">
                    {isOwnerOrAdmin() && (
                      <>
                        <Link href={`/companies/${company.id}/employees`}>
                          <Button className="w-full bg-[#097EEC] hover:bg-[#097EEC]/90 font-eras text-sm md:text-base">
                            <Users className="h-4 w-4 mr-2" />
                            Gestionar Empleados
                          </Button>
                        </Link>

                        <Link href={`/companies/${company.id}/edit`}>
                          <Button
                            variant="outline"
                            className="w-full border-[#097EEC] text-[#097EEC] hover:bg-[#097EEC] hover:text-white font-eras text-sm md:text-base"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Empresa
                          </Button>
                        </Link>
                      </>
                    )}

                    {canApply() && (
                      <ApplyCompanyButton
                        companyId={company.id!}
                        companyName={company.name}
                        companyUserId={parseInt(company.id)}
                        className="w-full mb-4"
                      />
                    )}

                    {isOwnerOrAdmin() && (
                      <Link href={`/companies/${company.id}/employees`}>
                        <Button
                          variant="outline"
                          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-eras text-sm md:text-base"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Ver Empleados
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Información adicional */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-eras-bold text-gray-900 mb-3">
                      Información adicional
                    </h4>
                    <div className="space-y-2 text-xs md:text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span className="font-eras">Miembro desde</span>
                        <span className="font-eras-bold">
                          {formatDate(company.created_at)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-eras">Tipo</span>
                        <span className="font-eras-bold">Empresa</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
