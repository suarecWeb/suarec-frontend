import api from "./axios_config"

const baseURL = "/users"

// Interfaces para las relaciones
export interface Company {
  id: string
  name: string
  nit: string
  email: string
  cellphone: string
  born_at: Date
  created_at: Date
}

export interface Publication {
  id: string
  title: string
  description?: string
  category: string
  image_url?: string
  created_at: Date
  modified_at?: Date
  visitors?: number
}

export interface Comment {
  id: string
  content: string
  created_at: Date
  publication?: {
    id: string
    title: string
  }
}

export interface User {
  id?: string
  email: string
  password?: string
  name: string
  cellphone: string
  genre: string
  born_at: Date
  cv_url?: string
  created_at?: Date
  roles?: string[] | { id: string; name: string }[] | undefined

  // Relaciones
  company?: Company
  publications?: Publication[]
  comments?: Comment[]
}

// Interfaz para los parámetros de paginación
export interface PaginationParams {
  page?: number
  limit?: number
}

// Interfaz para la respuesta paginada
interface PaginationResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Función para obtener usuarios con paginación
const getUsers = (params?: PaginationParams) => api.get<PaginationResponse<User>>(baseURL, { params })

const getUserById = (id: string) => api.get<User>(`${baseURL}/${id}`)
const createUser = (userData: User) => api.post<User>(baseURL, userData)
const updateUser = (id: string, userData: Partial<User>) => api.patch<User>(`${baseURL}/${id}`, userData)
const deleteUser = (id: string) => api.delete(`${baseURL}/${id}`)

export const UserService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
}

