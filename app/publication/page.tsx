'use client'

import { useState, useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import Link from "next/link";
import { Publication } from "@/interfaces/publication.interface";
import Navbar from "@/components/navbar";
import PublicationService, { PaginationParams } from "@/services/PublicationsService";
import { Pagination } from "@/components/ui/pagination"; 

const PublicationPage = () => {
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
      setPublications(
        response.data.data.map((publication: any) => ({
          ...publication,
          user: publication.user || null,
          comments: publication.comments || [],
        }))
      );
      setPagination(response.data.meta);
    } catch (err) {
      setError("Error al cargar las publicaciones");
      console.error(err);
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

  const handleEdit = (id: string) => {
    // Implement edit logic
  };

  const handleDelete = async (id: string) => {
    try {
      await PublicationService.deletePublication(id);
      // Recargar la página actual después de eliminar
      fetchPublications({ page: pagination.page, limit: pagination.limit });
    } catch (err) {
      setError("Error al eliminar la publicación");
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center gap-5 p-24">
        <h1 className="text-2xl font-bold">Publicaciones</h1>
        <Link href="/publication/create" className={buttonVariants({ variant: "default" })}>Crear Publicación</Link>
        
        {loading && <p>Cargando publicaciones...</p>}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {!loading && !error && (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {publications.length > 0 ? (
                  publications.map(publication => (
                    <TableRow key={publication.id}>
                      <TableCell>{publication.id}</TableCell>
                      <TableCell>{publication.title}</TableCell>
                      <TableCell className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(publication.id)} 
                          className={buttonVariants({ variant: "default", size: "sm" })}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(publication.id)} 
                          className={buttonVariants({ variant: "destructive", size: "sm" })}
                        >
                          Eliminar
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No hay publicaciones disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
            
            <div className="text-sm text-muted-foreground">
              Mostrando {publications.length} de {pagination.total} publicaciones
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default PublicationPage;