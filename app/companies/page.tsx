'use client';
import { useEffect, useState } from "react";
import CompanyService, { PaginationParams } from "@/services/CompanyService";
import Navbar from "@/components/navbar";
import { Pagination } from "@/components/ui/pagination";

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

const CompaniesPage = () => {
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
      setCompanies(response.data.data);
      setPagination(response.data.meta);
    } catch (err) {
      setError("Error al cargar las empresas");
      console.error("Error al obtener empresas:", err);
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

  const handleDelete = async (id: string) => {
    try {
      await CompanyService.deleteCompany(id);
      alert("Empresa eliminada correctamente");
      // Recargar la página actual después de eliminar
      fetchCompanies({ page: pagination.page, limit: pagination.limit });
    } catch (err) {
      console.error("Error al eliminar empresa:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 bg-gray-900 text-white min-h-screen">
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">Empresas</h2>
        <button
          onClick={() => alert("Crear nueva empresa")}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Crear Empresa
        </button>

        {loading && <p className="text-center py-4">Cargando empresas...</p>}
        
        {error && (
          <div className="bg-red-800 border border-red-900 text-white px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <ul className="space-y-2">
          {companies.length > 0 ? (
            companies.map((company) => (
              <li key={company.id} className="p-4 bg-gray-800 rounded-lg shadow">
                <p className="text-blue-300">{company.name}</p>
                <p className="text-sm text-gray-400">NIT: {company.nit}</p>
                <p className="text-sm text-gray-400">Email: {company.email}</p>
                <p className="text-sm text-gray-400">Teléfono: {company.cellphone}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => alert(`Editar empresa con ID: ${company.id}`)}
                    className="px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(company.id+'')}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 bg-gray-800 rounded-lg shadow text-center">
              No hay empresas disponibles
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
        
        {!loading && !error && companies.length > 0 && (
          <div className="text-sm text-gray-400 mt-4 text-center">
            Mostrando {companies.length} de {pagination.total} empresas
          </div>
        )}
      </div>
    </>
  );
};

export default CompaniesPage;