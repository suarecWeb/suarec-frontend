"use client"
import { useEffect, useState } from "react"
import CompanyService from "@/services/CompanyService"
import { PaginationParams } from "@/interfaces/pagination-params.interface"
import Navbar from "@/components/navbar"
import { Pagination } from "@/components/ui/pagination"
import RoleGuard from "@/components/role-guard"
import { PlusCircle, Edit, Trash2, AlertCircle, Search, Building2, Mail, Phone, Calendar } from "lucide-react"
import Link from "next/link"

interface Company {
  id?: string
  nit: string
  name: string
  born_at: Date
  created_at: Date
  email: string
  cellphone: string
  userId: string
}

const CompaniesPageContent = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  const fetchCompanies = async (params: PaginationParams = { page: 1, limit: 10 }) => {
    try {
      setLoading(true)
      const response = await CompanyService.getCompanies(params)
      setCompanies(response.data.data)
      setPagination(response.data.meta)
    } catch (err) {
      setError("Error al cargar las empresas")
      console.error("Error al obtener empresas:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handlePageChange = (page: number) => {
    fetchCompanies({ page, limit: pagination.limit })
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta empresa?")) {
      try {
        await CompanyService.deleteCompany(id)
        // Recargar la página actual después de eliminar
        fetchCompanies({ page: pagination.page, limit: pagination.limit })
      } catch (err) {
        console.error("Error al eliminar empresa:", err)
        setError("Error al eliminar la empresa")
      }
    }
  }

  const filteredCompanies = searchTerm
    ? companies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : companies

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-[#097EEC] text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Empresas</h1>
            <p className="mt-2 text-blue-100">Gestiona todas las empresas registradas en la plataforma</p>
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
                  placeholder="Buscar empresas..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#097EEC] focus:border-[#097EEC] transition-colors outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Link href="/companies/create">
                <button className="bg-[#097EEC] text-white px-4 py-2 rounded-lg hover:bg-[#0A6BC7] transition-colors flex items-center gap-2">
                  <PlusCircle className="h-5 w-5" />
                  <span>Crear Empresa</span>
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
                {/* Companies List */}
                {filteredCompanies.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Empresa
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                          >
                            NIT
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                          >
                            Contacto
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                          >
                            Fecha de creación
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCompanies.map((company) => (
                          <tr key={company.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-[#097EEC]/10 rounded-full flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-[#097EEC]" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                              <div className="text-sm text-gray-500">{company.nit}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                              <div className="text-sm text-gray-500 flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-gray-400" />
                                  <span>{company.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <span>{company.cellphone}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span>{formatDate(company.created_at)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() => alert(`Editar empresa con ID: ${company.id}`)}
                                  className="text-amber-600 hover:text-amber-700 transition-colors"
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => company.id && handleDelete(company.id)}
                                  className="text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="bg-gray-50 inline-flex rounded-full p-6 mb-4">
                      <Building2 className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No hay empresas disponibles</h3>
                    <p className="mt-2 text-gray-500">No se encontraron empresas que coincidan con tu búsqueda.</p>
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
                {!loading && !error && filteredCompanies.length > 0 && (
                  <div className="mt-6 text-sm text-gray-500 text-center">
                    Mostrando {filteredCompanies.length} de {pagination.total} empresas
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Componente principal protegido con RoleGuard
const CompaniesPage = () => {
  return (
    <RoleGuard allowedRoles={["ADMIN", "BUSINESS"]}>
      <CompaniesPageContent />
    </RoleGuard>
  )
}

export default CompaniesPage

