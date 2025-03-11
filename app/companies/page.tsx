'use client';
import { useEffect, useState } from "react";
import CompanyService from "@/services/CompanyService";
import Navbar from "@/components/navbar";

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

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = () => {
    CompanyService.getCompanies()
      .then((res) => setCompanies(res.data))
      .catch((err) => console.error("Error al obtener empresas:", err));
  };

  const handleDelete = (id: string) => {
    CompanyService.deleteCompany(id)
      .then(() => {
        alert("Empresa eliminada correctamente");
        fetchCompanies(); // Recargar la lista de empresas
      })
      .catch((err) => console.error("Error al eliminar empresa:", err));
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
        <ul className="space-y-2">
          {companies.map((company) => (
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
          ))}
        </ul>
      </div>
    </>
  );
};

export default CompaniesPage;