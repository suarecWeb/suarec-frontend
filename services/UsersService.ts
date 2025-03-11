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

const getUsers = () => api.get<User[]>(baseURL);

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
