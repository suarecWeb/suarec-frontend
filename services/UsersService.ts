import api from "./axios_config"
import { User } from "@/interfaces/user.interface"
import { PaginationParams } from "@/interfaces/pagination-params.interface"
import { PaginationResponse } from "@/interfaces/pagination-response.interface"

const baseURL = "/users"


// Función para obtener usuarios con paginación
const getUsers = (params?: PaginationParams) => api.get<PaginationResponse<User>>(baseURL, { params })
// Nueva función para obtener la empresa del usuario
const getUserCompany = (userId: number) => api.get(`${baseURL}/${userId}/company`)
const getUserById = (id: number) => api.get<User>(`${baseURL}/${id}`)
const createUser = (userData: User) => api.post<User>(baseURL, userData)
const updateUser = (id: string, userData: Partial<User>) => api.put<User>(`${baseURL}/${id}`, userData)
const deleteUser = (id: string) => api.delete(`${baseURL}/${id}`)

export const UserService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  getUserCompany,
  deleteUser,
}

