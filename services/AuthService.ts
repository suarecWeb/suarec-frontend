import api from "./axios_config";
import { SignInData } from "@/interfaces/auth.interface";

const login = (signInData: SignInData) => {
  return api.post("/suarec/auth/login", signInData);
};

const forgotPassword = (email: string) => {
  return api.post("/suarec/auth/forgot", { email });
};

const changePassword = (id: string, password: string) => {
  return api.post(`/suarec/auth/change/${id}`, { password });
};

const logout = () => {
  return api.post("/suarec/auth/logout"); // Endpoint para cerrar sesión y eliminar la cookie
};

const getUser = () => {
  return api.get("/suarec/auth/user"); // Endpoint para obtener datos del usuario autenticado
};

const AuthService = {
  login,
  forgotPassword,
  changePassword,
  logout,
  getUser,
};

export default AuthService;
