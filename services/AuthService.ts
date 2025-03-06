import axios from "axios";

const baseURL = "http://localhost:3000/auth"; // Ajusta la URL de la API según corresponda

interface SignInData {
  email: string;
  password: string;
}

interface PasswordChange {
  password: string;
}

const api = axios.create({
  baseURL,
  withCredentials: true, // Permite el manejo de cookies HTTP-only
});

const login = (signInData: SignInData) => {
  return api.post("/login", signInData);
};

const forgotPassword = (email: string) => {
  return api.post("/forgot", { email });
};

const changePassword = (id: string, password: string) => {
  return api.post(`/change/${id}`, { password });
};

const logout = () => {
  return api.post("/logout"); // Endpoint para cerrar sesión y eliminar la cookie
};

const getUser = () => {
  return api.get("/user"); // Endpoint para obtener datos del usuario autenticado
};

const AuthService = {
  login,
  forgotPassword,
  changePassword,
  logout,
  getUser,
};

export default AuthService;
