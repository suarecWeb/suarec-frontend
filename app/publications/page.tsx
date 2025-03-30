'use client';
import { useEffect, useState } from "react";
import PublicationService, { PaginationParams } from "@/services/PublicationsService";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";

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

  useEffect(() => {
    fetchPublications();
  }, []);

  const handlePageChange = (page: number) => {
    fetchPublications({ page, limit: pagination.limit });
  };

  const handleDelete = async (id: string) => {
    try {
      await PublicationService.deletePublication(id);
      alert("Publicación eliminada correctamente");
      // Recargar la página actual después de eliminar
      fetchPublications({ page: pagination.page, limit: pagination.limit });
    } catch (err) {
      console.error("Error al eliminar publicación:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 bg-gray-900 text-white min-h-screen">
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">Publicaciones</h2>
        <Link href={'/publications/create'}>
          <button
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Crear Publicación
          </button>
        </Link>

        {loading && <p className="text-center py-4">Cargando publicaciones...</p>}
        
        {error && (
          <div className="bg-red-800 border border-red-900 text-white px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <ul className="space-y-2">
          {publications.length > 0 ? (
            publications.map((publication) => (
              <li key={publication.id} className="p-4 bg-gray-800 rounded-lg shadow">
                <p className="text-blue-300">{publication.title}</p>
                <p className="text-sm text-gray-400">{publication.description}</p>
                <p className="text-sm text-gray-400">Categoría: {publication.category}</p>
                <p className="text-sm text-gray-400">Visitas: {publication.visitors || 0}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => alert(`Editar publicación con ID: ${publication.id}`)}
                    className="px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(publication.id+'')}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 bg-gray-800 rounded-lg shadow text-center">
              No hay publicaciones disponibles
            </li>
          )}
        </ul>
        
        {pagination.totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
        
        {!loading && !error && publications.length > 0 && (
          <div className="text-sm text-gray-400 mt-4 text-center">
            Mostrando {publications.length} de {pagination.total} publicaciones
          </div>
        )}
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