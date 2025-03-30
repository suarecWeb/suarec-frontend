// hooks/auth/use-role-guard.ts
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'; // Asegúrate de tener esta dependencia instalada

interface TokenPayload {
  roles?: string[];
  // otros campos del token
}

export function useRoleGuard(allowedRoles: string[]) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = () => {
      try {
        const token = Cookies.get('token');
        
        if (!token) {
          router.push('/auth/login');
          return;
        }
        
        const decodedToken = jwtDecode<TokenPayload>(token);
        const userRoles = decodedToken.roles || [];
        
        // Verificar si el usuario tiene al menos uno de los roles permitidos
        const hasPermission = allowedRoles.some(role => userRoles.includes(role));
        
        if (!hasPermission) {
          router.push('/access-denied');
          return;
        }
        
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error al verificar permisos:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [allowedRoles, router]);

  return { isAuthorized, isLoading };
}