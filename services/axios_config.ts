import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // Permite el manejo de cookies HTTP-only
});

// Interceptor para adjuntar el token en cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token"); // Obtener el token de las cookies
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Adjuntar el token en los headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
