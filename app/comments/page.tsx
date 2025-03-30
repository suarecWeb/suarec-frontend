'use client'

import { useState, useEffect } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableRow, TableCell, TableHead, TableBody } from "@/components/ui/table";
import Link from "next/link";
import { Company } from "@/interfaces/company.interface";
import { CompanyApi, PaginationParams } from "@/API/company.api";
import Navbar from "@/components/navbar";
import { Pagination } from "@/components/ui/pagination";

const CompanyPage = () => {
  const companyApi: CompanyApi = new CompanyApi('https://localhost:3001');

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
      const response = await companyApi.findAllCompany(params);
      
      // Adaptación dependiendo de cómo devuelve los datos el backend
      if (response.data && response.meta) {
        // Si el backend devuelve un formato de respuesta paginada
        setCompanies(response.data);
        setPagination(response.meta);
      } else {
        // Si el backend aún no está paginando correctamente
        setCompanies(response);
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

  const handleEdit = (id: string) => {
    // Implementar lógica de edición
  };

  const handleDelete = async (id: string) => {
    try {
      await companyApi.deleteCompany(id);
      alert("Compañía eliminada correctamente");
      // Recargar la página actual después de eliminar
      fetchCompanies({ page: pagination.page, limit: pagination.limit });
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

export default CompanyPage;