'use client'
import CompanyService from "@/services/CompanyService";
import { useState, useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { Pagination } from "@/components/ui/pagination";
import RoleGuard from "@/components/role-guard";

interface Company {
  id?: string;
  nit: string;
  name: string;
  born_at: Date;
  created_at: Date;
  email: string;
  cellphone: string;
  userId: string;
}

// Interfaz para los parámetros de paginación
export interface PaginationParams {
  page?: number;
  limit?: number;
}

const CompanyPageContent = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
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

   const fetchCompanies = async (params: PaginationParams = { page: 1, limit: 10 }) => {
     try {
       setLoading(true);
       const response = await CompanyService.getCompanies(params);
      
      // Si el backend devuelve un formato de respuesta paginada
       if (response.data && response.data.meta) {
         setCompanies(response.data.data);
         setPagination(response.data.meta);
       } else {
        // Si el backend no está paginando aún, tratamos los datos como una lista completa
         setCompanies(response.data.data);
         console.warn("El backend no devuelve datos paginados correctamente");
      }
     } catch (err) {
       setError("Error al cargar las compañías");
       console.error("Error al obtener compañías:", err);
     } finally {
       setLoading(false);
     }
   };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handlePageChange = (page: number) => {
    fetchCompanies({ page, limit: pagination.limit });
  };

  const handleEdit = (id: string | undefined) => {
    // Implementar lógica de edición
  };

  const handleDelete = async (id: string | undefined) => {
    try {
      if (id) {
        await CompanyService.deleteCompany(id);
        alert("Compañía eliminada correctamente");
        // Recargar la página actual después de eliminar
        fetchCompanies({ page: pagination.page, limit: pagination.limit });
      }
    } catch (err) {
      console.error("Error al eliminar compañía:", err);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center gap-5 p-24">
        <h1 className="text-2xl font-bold">Compañías</h1>
        <Link href="/company/create" className={buttonVariants({ variant: "default" })}>Crear Compañía</Link>
        
        {loading && <p>Cargando compañías...</p>}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.length > 0 ? (
              companies.map(company => (
                <TableRow key={company.id}>
                  <TableCell>{company.id}</TableCell>
                  <TableCell>{company.name}</TableCell>
                  <TableCell className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(company.id)} 
                      className={buttonVariants({ variant: "default", size: "sm" })}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(company.id)} 
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
                  No hay compañías disponibles
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {pagination.totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
        
        {!loading && !error && companies.length > 0 && (
          <div className="text-sm text-gray-500 mt-4">
            Mostrando {companies.length} de {pagination.total} compañías
          </div>
        )}
      </main>
    </>
  );
};

// Componente principal protegido con RoleGuard
const CompanyPage = () => {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'BUSINESS']}>
      <CompanyPageContent />
    </RoleGuard>
  );
};

export default CompanyPage;