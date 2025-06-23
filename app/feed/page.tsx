'use client'

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Building2,
  Plus,
  TrendingUp,
  Calendar,
  Eye,
  Tag,
  AlertCircle,
  User,
  Heart,
  MessageSquare,
  Share2,
  Send,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from "@/components/ui/skeleton";
import PublicationFeedCard from '@/components/publication-feed-card';
import Navbar from '@/components/navbar';
import CreatePublicationModal from '@/components/create-publication-modal';
import PublicationService from '@/services/PublicationsService';
import { Publication } from '@/interfaces/publication.interface';
import { PaginationParams } from '@/interfaces/pagination-params.interface';
import { PaginationResponse } from '@/interfaces/pagination-response.interface';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { TokenPayload } from '@/interfaces/auth.interface';
import Link from 'next/link';
import { ContractService } from "@/services/ContractService";
import { Contract } from "@/interfaces/contract.interface";

export default function FeedPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [publicationBids, setPublicationBids] = useState<{[key: string]: { contracts: Contract[], totalBids: number }}>({});

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

  // Función para cargar ofertas de publicaciones
  const loadPublicationBids = async (publicationIds: string[]) => {
    try {
      const bidsPromises = publicationIds.map(async (id) => {
        try {
          const bidsData = await ContractService.getPublicationBids(id);
          return { id, data: bidsData };
        } catch (error) {
          console.error(`Error loading bids for publication ${id}:`, error);
          return { id, data: { contracts: [], totalBids: 0 } };
        }
      });

      const bidsResults = await Promise.all(bidsPromises);
      const bidsMap: {[key: string]: { contracts: Contract[], totalBids: number }} = {};
      
      bidsResults.forEach(({ id, data }) => {
        bidsMap[id] = data;
      });

      setPublicationBids(bidsMap);
    } catch (error) {
      console.error('Error loading publication bids:', error);
    }
  };

  // Función para cargar publicaciones
  const fetchPublications = async (params: PaginationParams = { page: 1, limit: pagination.limit }) => {
    try {
      setLoading(true);
      const response = await PublicationService.getPublications(params);
      setPublications(response.data.data);
      setPagination(response.data.meta);
      
      // Cargar ofertas para las publicaciones
      const publicationIds = response.data.data.map((pub: Publication) => pub.id!);
      await loadPublicationBids(publicationIds);
    } catch (err) {
      setError("Error al cargar las publicaciones");
      console.error("Error al obtener publicaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchPublications();
  }, []);

  // Función para manejar cuando se crea una nueva publicación
  const handlePublicationCreated = () => {
    // Recargar las publicaciones para mostrar la nueva
    fetchPublications();
  };

  // Filtrar publicaciones
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (pub.description && pub.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         pub.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || pub.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas
  const categories = ['all', ...Array.from(new Set(publications.map(pub => pub.category)))];

  // Formatear fecha
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    if (diffInHours < 48) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header azul extendido como en perfil */}
      <div className="bg-[#097EEC] text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-eras-bold">Feed de Publicaciones</h1>
          <p className="mt-2 text-blue-100 font-eras text-sm md:text-base">Descubre las mejores oportunidades laborales y servicios</p>
        </div>
      </div>

      {/* Content con margen negativo para que se superponga */}
      <div className="container mx-auto px-4 -mt-6 pb-12">
        <div className="grid lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Sidebar - Filtros (oculto en móvil) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-eras-bold text-gray-900 mb-4">Filtros</h3>
              
              {/* Búsqueda */}
              <div className="mb-6">
                <label className="block text-sm font-eras-medium text-gray-700 mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Título, descripción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 font-eras"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div className="mb-6">
                <label className="block text-sm font-eras-medium text-gray-700 mb-2">Categoría</label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-[#097EEC] focus:ring-[#097EEC]"
                      />
                      <span className="text-sm font-eras">
                        {category === 'all' ? 'Todas' : category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Estadísticas rápidas */}
              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-eras-bold text-gray-900 mb-3">Estadísticas</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-eras">Total publicaciones</span>
                    <span className="font-eras-bold">{filteredPublications.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-eras">Categorías</span>
                    <span className="font-eras-bold">{categories.length - 1}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Feed */}
          <div className="lg:col-span-3 col-span-full">
            {/* Filtros móviles */}
            <div className="lg:hidden bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
              <div className="flex flex-col gap-4">
                {/* Búsqueda móvil */}
                <div>
                  <label className="block text-sm font-eras-medium text-gray-700 mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Título, descripción..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 font-eras"
                    />
                  </div>
                </div>
                
                {/* Categoría móvil */}
                <div>
                  <label className="block text-sm font-eras-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none text-sm"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'Todas las categorías' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Create Post Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 font-eras-semibold text-gray-900 text-sm sm:text-base">
                    ¿Qué estás buscando hoy?
                </div>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#097EEC] hover:bg-[#097EEC]/90 text-white font-eras-medium w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Publicación
                </Button>
              </div>
            </div>

            {/* Feed */}
            <div className="space-y-4 lg:space-y-6">
              {loading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ))
              ) : error ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-eras-bold text-gray-900 mb-2">Error al cargar</h3>
                  <p className="text-gray-600 font-eras">{error}</p>
                </div>
              ) : filteredPublications.length > 0 ? (
                filteredPublications.map((publication) => (
                  <div key={publication.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 hover:shadow-md transition-shadow duration-300">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 lg:gap-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#097EEC] rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <h3 className="font-eras-bold text-gray-900 text-sm lg:text-base truncate">
                              {publication.user?.name || 'Usuario'}
                            </h3>
                            {/* Badge según el rol */}
                            {publication.user?.roles && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-eras-medium bg-blue-100 text-blue-800 flex-shrink-0">
                                {Array.isArray(publication.user.roles) && publication.user.roles.length > 0 ? (
                                  typeof publication.user.roles[0] === 'string' ? 
                                    (publication.user.roles[0] === 'PERSON' ? 'Ofrece servicios/productos' : 'Solicita personal/productos') :
                                    (publication.user.roles[0].name === 'PERSON' ? 'Ofrece servicios/productos' : 'Solicita personal/productos')
                                ) : 'Usuario'}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              <span>{publication.category}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(publication.created_at)}</span>
                            </div>
                            {publication.price && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span className="font-medium text-green-600">${publication.price} {publication.priceUnit}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <h2 className="text-lg lg:text-xl font-eras-bold text-gray-900 mb-2">
                        {publication.title}
                      </h2>
                      
                      {publication.description && (
                        <p className="text-gray-700 leading-relaxed mb-4 text-sm lg:text-base">
                          {publication.description}
                        </p>
                      )}
                      
                      {publication.image_url && (
                        <div className="mb-4">
                          <img 
                            src={publication.image_url} 
                            alt={publication.title}
                            className="w-full h-32 lg:h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Información de ofertas activas */}
                      {publicationBids[publication.id!] && publicationBids[publication.id!].totalBids > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 text-blue-700">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium text-sm">
                              {publicationBids[publication.id!].totalBids} oferta{publicationBids[publication.id!].totalBids > 1 ? 's' : ''} activa{publicationBids[publication.id!].totalBids > 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-xs text-blue-600 mt-1">
                            Esta publicación tiene ofertas en negociación
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 lg:gap-6">
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>0</span>
                        </button>
                        
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#097EEC] transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          <span>{publication.comments?.length || 0}</span>
                        </button>
                        
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#097EEC] transition-colors">
                          <Share2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Compartir</span>
                        </button>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 border-[#097EEC] text-[#097EEC] hover:bg-[#097EEC] hover:text-white w-full sm:w-auto"
                        >
                          <Send className="h-4 w-4" />
                          <span className="hidden sm:inline">Mensaje</span>
                        </Button>
                        
                        <Link href={`/publications/${publication.id}`} className="w-full sm:w-auto">
                          <Button
                            size="sm"
                            className="bg-[#097EEC] hover:bg-[#097EEC]/90 w-full sm:w-auto"
                          >
                            Ver más
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-eras-bold text-gray-900 mb-2">No se encontraron publicaciones</h3>
                  <p className="text-gray-600 font-eras">
                    Intenta ajustar los filtros o busca con otros términos
                  </p>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {filteredPublications.length > 0 && pagination.hasNextPage && (
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  className="border-[#097EEC] text-[#097EEC] hover:bg-[#097EEC] hover:text-white font-eras"
                  onClick={() => fetchPublications({ page: pagination.page + 1, limit: pagination.limit })}
                >
                  Cargar más publicaciones
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de crear publicación */}
      <CreatePublicationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPublicationCreated={handlePublicationCreated}
      />
    </div>
  );
} 