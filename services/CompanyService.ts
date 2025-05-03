import api from "./axios_config";
import { Company, CreateCompanyDto } from "@/interfaces/company.interface";
import { PaginationParams } from "@/interfaces/pagination-params.interface";
import { PaginationResponse } from "@/interfaces/pagination-response.interface";

const baseURL = "/companies";

// Función para obtener empresas con paginación
const getCompanies = (params?: PaginationParams) => 
  { return api.get<PaginationResponse<Company>>(baseURL, { params }) };


const getCompanyById = (id: string) => api.get<Company>(`${baseURL}/${id}`);

const createCompany = (companyData: CreateCompanyDto) => api.post<Company>(baseURL, companyData);
const updateCompany = (id: string, companyData: Partial<Company>) => api.patch<Company>(`${baseURL}/${id}`, companyData);
const deleteCompany = (id: string) => api.delete(`${baseURL}/${id}`);

const CompanyService = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
};

export default CompanyService;