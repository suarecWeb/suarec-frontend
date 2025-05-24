/* eslint-disable */
"use client";

import { useEffect, useState } from "react";
import ApplicationService from "@/services/ApplicationService";
import { Application } from "@/interfaces/application.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  Calendar, 
  Eye, 
  User,
  FileText,
  Clock,
  Building2,
  Loader2,
  Mail,
  Phone,
  Briefcase,
  MessageSquare,
} from 'lucide-react';
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";

const ApplicationsPageContent = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [processingApplication, setProcessingApplication] = useState<string | null>(null);
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

  // Función para cargar aplicaciones
  const fetchApplications = async (params: PaginationParams = { page: 1, limit: pagination.limit }) => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      // Obtener aplicaciones de la empresa del usuario actual
      const response = await ApplicationService.getCompanyApplications(currentUserId.toString(), params);
      setApplications(response.data.data);
      setPagination(response.data.meta);
    } catch (err) {
      setError("Error al cargar las aplicaciones");
      console.error("Error al obtener aplicaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchApplications();
    }
  }, [currentUserId]);

  const handlePageChange = (page: number) => {
    fetchApplications({ page, limit: pagination.limit });
  };

  // Función para actualizar el estado de una aplicación
  const handleApplicationAction = async (applicationId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setProcessingApplication(applicationId);
    
    try {
      await ApplicationService.updateApplication(applicationId, { status });
      
      // Actualizar la aplicación en el estado local
      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { ...app, status, updated_at: new Date() }
          : app
      ));
      
      setError(null);
    } catch (err) {
      console.error("Error al actualizar aplicación:", err);
      setError("No se pudo actualizar la aplicación. Inténtalo de nuevo.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setProcessingApplication(null);
    }
  };

  // Filtrar aplicaciones según el término de búsqueda y estado
  const getFilteredApplications = () => {
    let filtered = applications;
    
    // Filtrar por estado según la pestaña activa
    if (activeTab !== "all") {
      filtered = filtered.filter(app => {
        switch (activeTab) {
          case "pending":
            return app.status === "PENDING";
          case "accepted":
            return app.status === "ACCEPTED";
          case "rejected":
            return app.status === "REJECTED";
          default:
            return true;
        }
      });
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.publication?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.message && app.message.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const filteredApplications = getFilteredApplications();

  // Formatear fecha
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'ACCEPTED':
        return 'Aceptada';
      case 'REJECTED':
        return 'Rechazada';
      default:
        return status;
    }
  };

  // Renderizar tarjeta de aplicación
  const renderApplicationCard = (application: Application) => {
    const isProcessing = processingApplication === application.id;
    
    return (
      <div 
        key={application.id} 
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-6">
          {/* Header con información del usuario */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#097EEC]/10 rounded-full p-2">
                <User className="h-5 w-5 text-[#097EEC]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{application.user?.name}</h3>
                <p className="text-sm text-gray-500">{application.user?.email}</p>
              </div>
            </div>
            
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
              {getStatusText(application.status)}
            </span>
          </div>

          {/* Información de la publicación */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Aplicó para:</span>
            </div>
            <p className="font-medium text-gray-800">{application.publication?.title}</p>
            {application.publication?.category && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                {application.publication.category}
              </span>
            )}
          </div>

          {/* Mensaje de la aplicación */}
          {application.message && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Mensaje:</span>
              </div>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                {application.message}
              </p>
            </div>
          )}

          {/* Información adicional del candidato */}
          <div className="mb-4 space-y-2">
            {application.user?.cellphone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{application.user.cellphone}</span>
              </div>
            )}
            
            {application.user?.profession && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4" />
                <span>{application.user.profession}</span>
              </div>
            )}

            {application.user?.cv_url && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-gray-500" />
                <a 
                  href={application.user.cv_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#097EEC] hover:underline"
                >
                  Ver CV
                </a>
              </div>
            )}
          </div>

          {/* Skills del candidato */}
          {application.user?.skills && application.user.skills.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Habilidades:</p>
              <div className="flex flex-wrap gap-1">
                {application.user.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fecha de aplicación */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Clock className="h-3 w-3" />
            <span>Aplicó el {formatDate(application.created_at)} a las {formatTime(application.created_at)}</span>
          </div>

          {/* Acciones */}
          {application.status === 'PENDING' && (
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => handleApplicationAction(application.id!, 'ACCEPTED')}
                disabled={isProcessing}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Aceptar</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => handleApplicationAction(application.id!, 'REJECTED')}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    <span>Rechazar</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Botón de contacto para aplicaciones aceptadas */}
          {application.status === 'ACCEPTED' && (
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => window.location.href = `mailto:${application.user?.email}`}
                className="w-full bg-[#097EEC] text-white py-2 px-4 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4" />
                <span>Contactar candidato</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Aplicaciones</h1>
            <p className="mt-2 text-blue-100">
              Gestiona las aplicaciones recibidas para tus publicaciones
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
                  placeholder="Buscar aplicaciones..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
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

            {/* Tabs for filtering applications */}
            <Tabs 
              defaultValue="pending" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList className="grid grid-cols-4 mb-6 w-full sm:w-auto">
                <TabsTrigger value="pending" className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white">
                  Pendientes
                </TabsTrigger>
                <TabsTrigger value="accepted" className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white">
                  Aceptadas
                </TabsTrigger>
                <TabsTrigger value="rejected" className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white">
                  Rechazadas
                </TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white">
                  Todas
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="py-32 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
                  </div>
                ) : (
                  <>
                    {filteredApplications.length > 0 ? (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                        {filteredApplications.map(application => renderApplicationCard(application))}
                      </div>
                    ) : (
                      <div className="py-16 text-center">
                        <div className="bg-gray-50 inline-flex rounded-full p-6 mb-4">
                          <Briefcase className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {activeTab === "pending" && "No hay aplicaciones pendientes"}
                          {activeTab === "accepted" && "No hay aplicaciones aceptadas"}
                          {activeTab === "rejected" && "No hay aplicaciones rechazadas"}
                          {activeTab === "all" && "No hay aplicaciones disponibles"}
                        </h3>
                        <p className="mt-2 text-gray-500">
                          {searchTerm 
                            ? "No se encontraron aplicaciones que coincidan con tu búsqueda."
                            : "Las aplicaciones aparecerán aquí cuando los usuarios apliquen a tus publicaciones."
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
                    {!loading && !error && filteredApplications.length > 0 && (
                      <div className="mt-6 text-sm text-gray-500 text-center">
                        Mostrando {filteredApplications.length} de {pagination.total} aplicaciones
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

// Componente principal protegido con RoleGuard - solo empresas pueden ver aplicaciones
const ApplicationsPage = () => {
  return (
    <RoleGuard allowedRoles={['BUSINESS', 'ADMIN']}>
      <ApplicationsPageContent />
    </RoleGuard>
  );
};

export default ApplicationsPage;