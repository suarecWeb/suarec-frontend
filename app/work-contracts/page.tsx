// app/work-contracts/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import WorkContractService, { WorkContract } from "@/services/WorkContractService";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";
import { RatingCategory } from "@/interfaces/rating.interface";
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Star,
  Loader2,
  Filter,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import RateUserModal from "@/components/rate-user-modal";

const WorkContractsPageContent = () => {
  const router = useRouter();
  const [contracts, setContracts] = useState<WorkContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedUserToRate, setSelectedUserToRate] = useState<any>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
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

  // Función para cargar contratos
  const fetchContracts = async (params: PaginationParams = { page: 1, limit: pagination.limit }) => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      let response;
      
      if (activeTab === "all" && userRoles.includes("ADMIN")) {
        response = await WorkContractService.getWorkContracts(params);
      } else {
        const role = activeTab === "as-client" ? "client" : activeTab === "as-provider" ? "provider" : undefined;
        response = await WorkContractService.getUserWorkContracts(currentUserId.toString(), params, role);
      }
      
      setContracts(response.data.data);
      setPagination(response.data.meta);
    } catch (err) {
      setError("Error al cargar los contratos");
      console.error("Error al obtener contratos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchContracts();
    }
  }, [currentUserId, activeTab]);

  const handlePageChange = (page: number) => {
    fetchContracts({ page, limit: pagination.limit });
  };

  // Función para actualizar estado del contrato
  const handleStatusUpdate = async (contractId: string, status: string) => {
    try {
      await WorkContractService.updateWorkContract(contractId, { status: status as any });
      fetchContracts({ page: pagination.page, limit: pagination.limit });
    } catch (err) {
      console.error("Error al actualizar contrato:", err);
      setError("Error al actualizar el contrato");
    }
  };

  // Función para abrir modal de calificación
  const handleOpenRatingModal = (contract: WorkContract) => {
    const userToRate = contract.client?.id === currentUserId ? contract.provider : contract.client;
    setSelectedUserToRate(userToRate);
    setSelectedContractId(contract.id);
    setShowRatingModal(true);
  };

  // Filtrar contratos
  const getFilteredContracts = () => {
    let filtered = contracts;
    
    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredContracts = getFilteredContracts();

  // Formatear fecha
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'DISPUTED':
        return 'bg-orange-100 text-orange-800';
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
        return 'Aceptado';
      case 'IN_PROGRESS':
        return 'En Progreso';
      case 'COMPLETED':
        return 'Completado';
      case 'CANCELLED':
        return 'Cancelado';
      case 'DISPUTED':
        return 'En Disputa';
      default:
        return status;
    }
  };

  // Obtener ícono del estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />;
      case 'IN_PROGRESS':
        return <Loader2 className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
      case 'DISPUTED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Renderizar tarjeta de contrato
  const renderContractCard = (contract: WorkContract) => {
    const isClient = contract.client?.id === currentUserId;
    const otherUser = isClient ? contract.provider : contract.client;
    const canRate = contract.status === 'COMPLETED' && !contract.ratings?.some(r => r.reviewer?.id === currentUserId);

    return (
      <div 
        key={contract.id} 
        className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-6">
          {/* Header con estado y fecha */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                {getStatusIcon(contract.status)}
                {getStatusText(contract.status)}
              </span>
              
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {contract.type === 'SERVICE' ? 'Servicio' : 'Empleo'}
              </span>
            </div>
            
            <div className="text-xs text-gray-500">
              {formatDate(contract.created_at)}
            </div>
          </div>

          {/* Título y descripción */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">{contract.title}</h3>
            {contract.description && (
              <p className="text-gray-600 text-sm">{contract.description}</p>
            )}
          </div>

          {/* Información del otro usuario */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {isClient ? 'Proveedor:' : 'Cliente:'}
              </span>
            </div>
            <p className="font-medium text-gray-800">{otherUser?.name}</p>
            <p className="text-sm text-gray-500">{otherUser?.email}</p>
          </div>

          {/* Detalles del contrato */}
          <div className="mb-4 space-y-2">
            {contract.agreed_price && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span>${contract.agreed_price.toLocaleString()} {contract.currency || 'COP'}</span>
              </div>
            )}
            
            {contract.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{contract.location}</span>
              </div>
            )}
            
            {contract.estimated_completion && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Estimado: {formatDate(contract.estimated_completion)}</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex gap-2">
              <Link href={`/work-contracts/${contract.id}`}>
                <button className="text-[#097EEC] hover:text-[#0A6BC7] transition-colors flex items-center gap-1 text-sm">
                  <Eye className="h-4 w-4" />
                  Ver detalles
                </button>
              </Link>
            </div>

            <div className="flex gap-2">
              {/* Botones de estado para el proveedor */}
              {!isClient && contract.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(contract.id!, 'ACCEPTED')}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(contract.id!, 'CANCELLED')}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                  >
                    Rechazar
                  </button>
                </>
              )}

              {/* Botón para iniciar trabajo */}
              {!isClient && contract.status === 'ACCEPTED' && (
                <button
                  onClick={() => handleStatusUpdate(contract.id!, 'IN_PROGRESS')}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  Iniciar
                </button>
              )}

              {/* Botón para completar trabajo */}
              {!isClient && contract.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleStatusUpdate(contract.id!, 'COMPLETED')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                >
                  Completar
                </button>
              )}

              {/* Botón para calificar */}
              {canRate && (
                <button
                  onClick={() => handleOpenRatingModal(contract)}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700 transition-colors flex items-center gap-1"
                >
                  <Star className="h-3 w-3" />
                  Calificar
                </button>
              )}
            </div>
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
            <h1 className="text-3xl font-bold">Contratos de Trabajo</h1>
            <p className="mt-2 text-blue-100">
              Gestiona todos tus contratos y servicios
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar contratos..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                >
                  <option value="all">Todos los estados</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="ACCEPTED">Aceptado</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              <Link href="/work-contracts/create">
                <button className="bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  <span>Nuevo Contrato</span>
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

            {/* Tabs */}
            <Tabs 
              defaultValue="all" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList className="grid grid-cols-3 mb-6 w-full sm:w-auto">
                {userRoles.includes("ADMIN") ? (
                  <TabsTrigger value="all" className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white">
                    Todos
                  </TabsTrigger>
                ) : (
                  <TabsTrigger value="all" className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white">
                    Mis Contratos
                  </TabsTrigger>
                )}
                <TabsTrigger value="as-client" className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white">
                  Como Cliente
                </TabsTrigger>
                <TabsTrigger value="as-provider" className="data-[state=active]:bg-[#097EEC] data-[state=active]:text-white">
                  Como Proveedor
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="py-32 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#097EEC]"></div>
                  </div>
                ) : (
                  <>
                    {filteredContracts.length > 0 ? (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                        {filteredContracts.map(contract => renderContractCard(contract))}
                      </div>
                    ) : (
                      <div className="py-16 text-center">
                        <div className="bg-gray-50 inline-flex rounded-full p-6 mb-4">
                          <Briefcase className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No hay contratos</h3>
                        <p className="mt-2 text-gray-500">
                          {searchTerm 
                            ? "No se encontraron contratos que coincidan con tu búsqueda."
                            : "Aún no tienes contratos. Crea tu primer contrato de trabajo."
                          }
                        </p>
                        
                        {!searchTerm && (
                          <Link href="/work-contracts/create">
                            <button className="mt-4 bg-[#097EEC] text-white px-6 py-3 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2 mx-auto">
                              <Plus className="h-5 w-5" />
                              <span>Crear Contrato</span>
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
                    {!loading && !error && filteredContracts.length > 0 && (
                      <div className="mt-6 text-sm text-gray-500 text-center">
                        Mostrando {filteredContracts.length} de {pagination.total} contratos
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedUserToRate && (
        <RateUserModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedUserToRate(null);
            setSelectedContractId(null);
          }}
          userId={currentUserId!}
          userToRate={selectedUserToRate}
          workContractId={selectedContractId || undefined}
          category={RatingCategory.SERVICE}
          onRatingSubmitted={() => {
            fetchContracts({ page: pagination.page, limit: pagination.limit });
          }}
        />
      )}
    </>
  );
};

// Componente principal protegido con RoleGuard
const WorkContractsPage = () => {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'BUSINESS', 'PERSON']}>
      <WorkContractsPageContent />
    </RoleGuard>
  );
};

export default WorkContractsPage;