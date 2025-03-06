import api from "./axios_config";

const baseURL = "/companies";

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

const getCompanies = () => api.get<Company[]>(baseURL);

const getCompanyById = (id: string) => api.get<Company>(`${baseURL}/${id}`);

const createCompany = (companyData: Company) => api.post<Company>(baseURL, companyData);

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
