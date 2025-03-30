import api from "./axios_config";

const baseURL = "/users";

export interface User {
  id?: string;
  email: string;
  password?: string;
  name: string;
  created_at?: Date;
  roles?: string[] | undefined;
}

// Interfaz para los parámetros de paginación
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Interfaz para la respuesta paginada
interface PaginationResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Función para obtener usuarios con paginación
const getUsers = (params?: PaginationParams) => 
  api.get<PaginationResponse<User>>(baseURL, { params });

const getUserById = (id: string) => api.get<User>(`${baseURL}/${id}`);
const createUser = (userData: User) => api.post<User>(baseURL, userData);
const updateUser = (id: string, userData: Partial<User>) => api.patch<User>(`${baseURL}/${id}`, userData);
const deleteUser = (id: string) => api.delete(`${baseURL}/${id}`);

const UserService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default UserService;