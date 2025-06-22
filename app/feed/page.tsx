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
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PublicationFeedCard from '@/components/publication-feed-card';
import Navbar from '@/components/navbar';
import PublicationService from '@/services/PublicationsService';
import { Publication } from '@/interfaces/publication.interface';
import { PaginationParams } from '@/interfaces/pagination-params.interface';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { TokenPayload } from '@/interfaces/auth.interface';
import Link from 'next/link';

export default function FeedPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
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

  // Función para cargar publicaciones
  const fetchPublications = async (params: PaginationParams = { page: 1, limit: pagination.limit }) => {
    try {
      setLoading(true);
      const response = await PublicationService.getPublications(params);
      setPublications(response.data.data);
      setPagination(response.data.meta);
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
          <h1 className="text-3xl font-eras-bold">Feed de Publicaciones</h1>
          <p className="mt-2 text-blue-100 font-eras">Descubre las mejores oportunidades laborales y servicios</p>
        </div>
      </div>

      {/* Content con margen negativo para que se superponga */}
      <div className="container mx-auto px-4 -mt-6 pb-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Filtros */}
          <div className="lg:col-span-1">
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
          <div className="lg:col-span-3">
            {/* Create Post Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 font-eras-semibold text-gray-900">
                    ¿Qué estás buscando hoy?
                </div>
              </div>
            </div>

            {/* Feed */}
            <div className="space-y-6">
              {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#097EEC] mx-auto mb-4"></div>
                  <p className="text-gray-600 font-eras">Cargando publicaciones...</p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-eras-bold text-gray-900 mb-2">Error al cargar</h3>
                  <p className="text-gray-600 font-eras">{error}</p>
                </div>
              ) : filteredPublications.length > 0 ? (
                filteredPublications.map((publication) => (
                  <div key={publication.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-[#097EEC] rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-eras-bold text-gray-900">
                              {publication.user?.name || 'Usuario'}
                            </h3>
                            {/* Badge según el rol */}
                            {publication.user?.roles && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-eras-medium bg-blue-100 text-blue-800">
                                {Array.isArray(publication.user.roles) && publication.user.roles.length > 0 ? (
                                  typeof publication.user.roles[0] === 'string' ? 
                                    (publication.user.roles[0] === 'PERSON' ? 'Ofrece servicios/productos' : 'Solicita personal/productos') :
                                    (publication.user.roles[0].name === 'PERSON' ? 'Ofrece servicios/productos' : 'Solicita personal/productos')
                                ) : 'Usuario'}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              <span>{publication.category}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(publication.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <h2 className="text-xl font-eras-bold text-gray-900 mb-2">
                        {publication.title}
                      </h2>
                      
                      {publication.description && (
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {publication.description}
                        </p>
                      )}
                      
                      {publication.image_url && (
                        <div className="mb-4">
                          <img 
                            src={publication.image_url} 
                            alt={publication.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-6">
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
                          <span>Compartir</span>
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 border-[#097EEC] text-[#097EEC] hover:bg-[#097EEC] hover:text-white"
                        >
                          <Send className="h-4 w-4" />
                          Mensaje
                        </Button>
                        
                        <Link href={`/publications/${publication.id}`}>
                          <Button
                            size="sm"
                            className="bg-[#097EEC] hover:bg-[#097EEC]/90"
                          >
                            Ver más
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
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
    </div>
  );
} 