import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { TokenPayload } from '@/interfaces/auth.interface';

interface AuthState {
  isAuthenticated: boolean;
  user: TokenPayload | null;
  userRoles: string[];
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    userRoles: [],
    isLoading: true,
  });

  const updateAuthState = () => {
    const token = Cookies.get('token');
    
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        const roles = decoded.roles?.map(role => role.name) || [];
        
        setAuthState({
          isAuthenticated: true,
          user: decoded,
          userRoles: roles,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error al decodificar token:', error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          userRoles: [],
          isLoading: false,
        });
      }
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        userRoles: [],
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    updateAuthState();

    // Escuchar cambios en el estado de autenticación
    const handleAuthChange = () => {
      updateAuthState();
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  return authState;
}; 