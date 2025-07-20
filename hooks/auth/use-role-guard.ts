"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

interface TokenPayload {
  id: number;
  email: string;
  roles: {
    id: number;
    name: string;
    description: null | string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export function useRoleGuard(allowedRoles: string[]) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = () => {
      try {
        const token = Cookies.get("token");

        if (!token) {
          toast.error("No estás autenticado");
          router.push("/auth/login");
          return;
        }

        const decodedToken = jwtDecode<TokenPayload>(token);

        // Obtener los nombres de los roles del usuario del token
        const userRoleNames =
          decodedToken.roles?.map((role) => role.name) || [];

        // Verificar si el usuario tiene al menos uno de los roles permitidos
        const hasPermission = allowedRoles.some((role) =>
          userRoleNames.includes(role),
        );

        if (!hasPermission) {
          router.push("/access-denied");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        toast.error("Error al verificar permisos");
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [allowedRoles, router]);

  return { isAuthorized, isLoading };
}
