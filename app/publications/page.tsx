'use client';
import { useEffect, useState } from "react";
import PublicationService, { PaginationParams } from "@/services/PublicationsService";
import Navbar from "@/components/navbar";
import Link from "next/link";
import {
  Pagination,
} from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";
import { PlusCircle, Edit, Trash2, AlertCircle, Search, Calendar, Eye, Tag } from 'lucide-react';

interface Publication {
  id?: string;
  title: string;
  description?: string;
  created_at: Date;
  modified_at: Date;
  category: string;
  image_url?: string;
  visitors?: number;
  userId: string;
}

const PublicationsPageContent = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchPublications = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    try {
      setLoading(true);
      
      console.log('trayendo publis')
      
      const response = await PublicationService.getPublications(params);

      console.log('publis: ' + response)

      setPublications(response.data.data);
      setPagination(response.data.meta);
    } catch (err) {
      setError("Error al cargar las publicaciones");
      console.error("Error al obtener publicaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handlePageChange = (page: number) => {
    fetchPublications({ page, limit: pagination.limit });
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta publicación?")) {
      try {
        await PublicationService.deletePublication(id);
        // Recargar la página actual después de eliminar
        fetchPublications({ page: pagination.page, limit: pagination.limit });
      } catch (err) {
        console.error("Error al eliminar publicación:", err);
        setError("Error al eliminar la publicación");
      }
    }
  };

  const filteredPublications = searchTerm 
    ? publications.filter(pub => 
        pub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (pub.description && pub.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        pub.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : publications;

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Publicaciones</h1>
            <p className="mt-2 text-blue-100">Gestiona todas las publicaciones de la plataforma</p>
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
                  placeholder="Buscar publicaciones..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Link href="/publications/create">
                <button className="bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>Crear Publicación</span>
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
                {/* Publications List */}
                {filteredPublications.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPublications.map((publication) => (
                      <div key={publication.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        {/* Publication Image */}
                        <div className="h-40 bg-gray-200 relative">
                          {publication.image_url ? (
                            <img 
                              src={publication.image_url || "/placeholder.svg"} 
                              alt={publication.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                              <span>Sin imagen</span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-white/90 text-gray-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{publication.visitors || 0}</span>
                          </div>
                        </div>
                        
                        {/* Publication Content */}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Tag className="h-4 w-4 text-[#097EEC]" />
                            <span className="text-xs font-medium text-[#097EEC] bg-blue-50 px-2 py-0.5 rounded-full">
                              {publication.category}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">{publication.title}</h3>
                          
                          {publication.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{publication.description}</p>
                          )}
                          
                          <div className="flex items-center text-xs text-gray-500 mb-4">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Creado: {formatDate(publication.created_at)}</span>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex justify-between pt-3 border-t border-gray-100">
                            <button
                              onClick={() => alert(`Editar publicación con ID: ${publication.id}`)}
                              className="text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1 text-sm"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Editar</span>
                            </button>
                            
                            <button
                              onClick={() => publication.id && handleDelete(publication.id)}
                              className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="bg-gray-50 inline-flex rounded-full p-6 mb-4">
                      <AlertCircle className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No hay publicaciones disponibles</h3>
                    <p className="mt-2 text-gray-500">No se encontraron publicaciones que coincidan con tu búsqueda.</p>
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
                {!loading && !error && filteredPublications.length > 0 && (
                  <div className="mt-6 text-sm text-gray-500 text-center">
                    Mostrando {filteredPublications.length} de {pagination.total} publicaciones
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Componente principal protegido con RoleGuard
const PublicationsPage = () => {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'BUSINESS', 'PERSON']}>
      <PublicationsPageContent />
    </RoleGuard>
  );
};

export default PublicationsPage;
