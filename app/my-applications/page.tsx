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
  Building2,
  FileText,
  Clock,
  Briefcase,
  MessageSquare,
  Trash2,
  ExternalLink,
  Users,
} from 'lucide-react';
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import ContractModal from "@/components/contract-modal";

const MyApplicationsPageContent = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [negotiatingAppId, setNegotiatingAppId] = useState<string | null>(null);
  const [counterOfferPrice, setCounterOfferPrice] = useState<string>("");
  const [contractModalForNegotiation, setContractModalForNegotiation] = useState<Application | null>(null);

  // Obtener información del usuario al cargar
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    }
  }, []);

  // Función para cargar aplicaciones del usuario
  const fetchApplications = async (params: PaginationParams = { page: 1, limit: pagination.limit }) => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      const response = await ApplicationService.getUserApplications(currentUserId.toString(), params);
      setApplications(response.data.data);
      setPagination(response.data.meta);
    } catch (err) {
      setError("Error al cargar tus aplicaciones");
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

  // Función para eliminar una aplicación (solo si está pendiente)
  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm("¿Estás seguro de que deseas retirar esta aplicación?")) {
      return;
    }

    try {
      await ApplicationService.deleteApplication(applicationId);
      
      // Actualizar la lista de aplicaciones
      setApplications(applications.filter(app => app.id !== applicationId));
      setError(null);
    } catch (err) {
      console.error("Error al eliminar aplicación:", err);
      setError("No se pudo retirar la aplicación. Inténtalo de nuevo.");
      setTimeout(() => setError(null), 5000);
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
          case "interview":
            return app.status === "INTERVIEW";
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
        app.publication?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.publication?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      case 'INTERVIEW':
        return 'bg-blue-100 text-blue-800';
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
      case 'INTERVIEW':
        return 'En entrevista';
      case 'ACCEPTED':
        return 'Aceptada';
      case 'REJECTED':
        return 'Rechazada';
      default:
        return status;
    }
  };

  // Obtener ícono del estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'INTERVIEW':
        return <Users className="h-4 w-4" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Renderizar tarjeta de aplicación
  const renderApplicationCard = (application: Application) => {
    const isServiceRequest = application.publication?.publicationType === 'SERVICE_REQUEST';
    return (
      <div 
        key={application.id} 
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-6">
          {/* Header con estado y fecha */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                {getStatusIcon(application.status)}
                {getStatusText(application.status)}
              </span>
              
              {application.status === 'PENDING' && (
                <button
                  onClick={() => handleDeleteApplication(application.id!)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  title="Retirar aplicación"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              {formatDate(application.created_at)}
            </div>
          </div>

          {/* Información de la publicación */}
          <div className="mb-4">
            <Link 
              href={`/publications/${application.publication?.id}`}
              className="group"
            >
              <h3 className="font-semibold text-gray-800 group-hover:text-[#097EEC] transition-colors flex items-center gap-2">
                {application.publication?.title}
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
            </Link>
            
            {application.publication?.category && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                {application.publication.category}
              </span>
            )}
          </div>

          {/* Mensaje de la aplicación */}
          {application.message && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Tu mensaje:</span>
              </div>
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                {application.message}
              </p>
            </div>
          )}

          {/* Información adicional según el estado */}
          {application.status === 'INTERVIEW' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">¡Invitado a entrevista!</span>
              </div>
              <p className="text-blue-700 text-sm">
                ¡Felicitaciones! Has pasado a la etapa de entrevista. La empresa se pondrá en contacto contigo pronto para coordinar los detalles.
              </p>
            </div>
          )}

          {application.status === 'ACCEPTED' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">¡Aplicación aceptada!</span>
              </div>
              <p className="text-green-700 text-sm">
                La empresa ha aceptado tu aplicación. Deberían contactarte pronto para coordinar los siguientes pasos.
              </p>
            </div>
          )}

          {application.status === 'REJECTED' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Aplicación no seleccionada</span>
              </div>
              <p className="text-red-700 text-sm">
                En esta ocasión no fuiste seleccionado para esta oportunidad. ¡No te desanimes y sigue aplicando!
              </p>
            </div>
          )}

          {application.status === 'PENDING' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">En revisión</span>
              </div>
              <p className="text-yellow-700 text-sm">
                Tu aplicación está siendo revisada por la empresa. Te notificaremos cuando haya una respuesta.
              </p>
            </div>
          )}

          {application.status === 'NEGOTIATING' && isServiceRequest && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-800">¡Negociación en curso!</span>
              </div>
              <p className="text-orange-700 text-sm mb-2">
                Última tarifa propuesta: ${application.counterOfferPrice?.toLocaleString() || application.suggestedPrice?.toLocaleString()}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                  onClick={() => setContractModalForNegotiation(application)}
                >
                  Aceptar tarifa y formalizar contrato
                </button>
                <button
                  className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                  onClick={() => setNegotiatingAppId(application.id!)}
                >
                  Proponer nueva tarifa
                </button>
              </div>
              {negotiatingAppId === application.id && (
                <div className="mt-3 flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Tu nueva tarifa"
                    className="px-2 py-1 border border-gray-300 rounded"
                    value={counterOfferPrice}
                    onChange={e => setCounterOfferPrice(e.target.value)}
                    min="1"
                  />
                  <button
                    className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                    onClick={async () => {
                      await ApplicationService.updateApplication(application.id!, { status: 'NEGOTIATING', counterOfferPrice: Number(counterOfferPrice) });
                      setNegotiatingAppId(null);
                      setCounterOfferPrice("");
                      fetchApplications();
                    }}
                    disabled={!counterOfferPrice}
                  >
                    Enviar contraoferta
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                    onClick={() => { setNegotiatingAppId(null); setCounterOfferPrice(""); }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Fecha y hora de aplicación */}
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t border-gray-100">
            <Clock className="h-3 w-3" />
            <span>Aplicaste el {formatDate(application.created_at)} a las {formatTime(application.created_at)}</span>
          </div>
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
            <h1 className="text-3xl font-bold">Mis aplicaciones</h1>
            <p className="mt-2 text-blue-100">
              Revisa el estado de todas tus aplicaciones laborales
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

              <Link href="/publications">
                <button className="bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Ver oportunidades</span>
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

            {/* Tabs for filtering applications */}
            <Tabs 
              defaultValue="all" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList className="grid grid-cols-5 mb-6 w-full sm:w-auto">
                <TabsTrigger value="all" className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white">
                  Todas
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white">
                  Pendientes
                </TabsTrigger>
                <TabsTrigger value="interview" className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white">
                  En entrevista
                </TabsTrigger>
                <TabsTrigger value="accepted" className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white">
                  Aceptadas
                </TabsTrigger>
                <TabsTrigger value="rejected" className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white">
                  Rechazadas
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
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredApplications.map(application => renderApplicationCard(application))}
                      </div>
                    ) : (
                      <div className="py-16 text-center">
                        <div className="bg-gray-50 inline-flex rounded-full p-6 mb-4">
                          <Briefcase className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {activeTab === "pending" && "No tienes aplicaciones pendientes"}
                          {activeTab === "interview" && "No tienes aplicaciones en entrevista"}
                          {activeTab === "accepted" && "No tienes aplicaciones aceptadas"}
                          {activeTab === "rejected" && "No tienes aplicaciones rechazadas"}
                          {activeTab === "all" && "No has hecho aplicaciones aún"}
                        </h3>
                        <p className="mt-2 text-gray-500">
                          {searchTerm 
                            ? "No se encontraron aplicaciones que coincidan con tu búsqueda."
                            : "Explora las oportunidades disponibles y comienza a aplicar."
                          }
                        </p>
                        
                        {!searchTerm && (
                          <Link href="/publications">
                            <button className="mt-4 bg-[#097EEC] text-white px-6 py-3 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2 mx-auto">
                              <Briefcase className="h-5 w-5" />
                              <span>Ver oportunidades</span>
                            </button>
                          </Link>
                        )}
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
      {contractModalForNegotiation && contractModalForNegotiation.publication && (
        <ContractModal
          publication={contractModalForNegotiation.publication}
          isOpen={!!contractModalForNegotiation}
          onClose={() => setContractModalForNegotiation(null)}
          application={contractModalForNegotiation}
          lockPrice={true}
        />
      )}
    </>
  );
};

// Componente principal protegido con RoleGuard - solo personas pueden ver sus aplicaciones
const MyApplicationsPage = () => {
  return (
    <RoleGuard allowedRoles={['PERSON', 'ADMIN']}>
      <MyApplicationsPageContent />
    </RoleGuard>
  );
};

export default MyApplicationsPage;