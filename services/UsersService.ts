import api from "./axios_config"
import { User } from "@/interfaces/user.interface"
import { PaginationParams } from "@/interfaces/pagination-params.interface"
import { PaginationResponse } from "@/interfaces/pagination-response.interface"

const baseURL = "/suarec/users"


// Función para obtener usuarios con paginación
const getUsers = (params?: PaginationParams) => api.get<PaginationResponse<User>>(baseURL, { params })
// Nueva función para obtener la empresa del usuario
const getUserCompany = (userId: number) => api.get(`${baseURL}/${userId}/company`)
const getUserById = (id: number) => api.get<User>(`${baseURL}/${id}`)
const createUser = (userData: User) => api.post<User>(baseURL, userData)
const updateUser = (id: string, userData: Partial<User>) => api.put<User>(`${baseURL}/${id}`, userData)
const deleteUser = (id: string) => api.delete(`${baseURL}/${id}`)

// Obtener todos los usuarios (solo admin)
const getAllUsers = () => 
  api.get<User[]>(baseURL);

// Obtener usuario por email
const getUserByEmail = (email: string) => 
  api.get<User>(`${baseURL}/email/${email}`);

// Buscar usuarios por nombre o email
const searchUsers = (query: string, limit: number = 10) => 
  api.get<User[]>(`${baseURL}/search`, { 
    params: { q: query, limit } 
  });

// Obtener usuarios por empleador
const getUsersByEmployer = (employerId: string) => 
  api.get<User[]>(`${baseURL}/by-employer/${employerId}`);

// Obtener todas las empresas (solo admin)
const getAllCompanies = () => 
  api.get<User[]>(`${baseURL}/companies`);

export const UserService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  getUserCompany,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  searchUsers,
  getUsersByEmployer,
  getAllCompanies,
}

