import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // Permite el manejo de cookies HTTP-only
});

// Rutas públicas que no requieren token
const publicRoutes = [
  '/suarec/auth/login',
  '/suarec/auth/forgot',
  '/suarec/auth/register',
  '/suarec/auth/change',
  '/suarec/email-verification/send',
  '/suarec/email-verification/verify',
  '/suarec/email-verification/resend'
];

// Función para verificar si es una ruta pública
const isPublicRoute = (url: string | undefined) => {
  if (!url) return false;
  
  // Verificar rutas exactas
  const exactMatch = publicRoutes.some(route => url.includes(route));
  if (exactMatch) return true;
  
  // Verificar rutas de cambio de contraseña con ID
  if (url.includes('/suarec/auth/change/')) return true;
  
  return false;
};

// Interceptor para adjuntar el token en cada solicitud
api.interceptors.request.use(
  (config) => {
    // Verificar si es una ruta pública
    if (isPublicRoute(config.url)) {
      return config;
    }
    
    const token = Cookies.get("token"); // Obtener el token de las cookies
    if (token) {
      // Verificar si el token ha expirado antes de enviar la petición
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp && decoded.exp < currentTime) {
          // Token expirado, limpiar cookies y redirigir
          Cookies.remove("token");
          Cookies.remove("email");
          Cookies.remove("role");
          
          // Solo redirigir si estamos en el cliente
          if (typeof window !== "undefined") {
            window.location.href = "/auth/login?expired=true";
          }
          
          return Promise.reject(new Error("Token expirado"));
        }
        
        config.headers.Authorization = `Bearer ${token}`; // Adjuntar el token en los headers
      } catch (error) {
        // Token inválido, limpiar cookies
        Cookies.remove("token");
        Cookies.remove("email");
        Cookies.remove("role");
        
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login?expired=true";
        }
        
        return Promise.reject(new Error("Token inválido"));
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el error es 401 (Unauthorized), el token puede haber expirado
    if (error.response?.status === 401) {
      // Limpiar cookies
      Cookies.remove("token");
      Cookies.remove("email");
      Cookies.remove("role");
      
      // Solo redirigir si estamos en el cliente
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login?expired=true";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
