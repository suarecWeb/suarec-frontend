"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

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
          console.log("No hay token, redirigiendo a login");
          router.push("/auth/login");
          return;
        }

        const decodedToken = jwtDecode<TokenPayload>(token);
        console.log("Token decodificado:", decodedToken);

        // Obtener los nombres de los roles del usuario del token
        const userRoleNames =
          decodedToken.roles?.map((role) => role.name) || [];
        console.log("Roles del usuario:", userRoleNames);
        console.log("Roles permitidos:", allowedRoles);

        // Verificar si el usuario tiene al menos uno de los roles permitidos
        const hasPermission = allowedRoles.some((role) =>
          userRoleNames.includes(role),
        );
        console.log("¿Tiene permiso?", hasPermission);

        if (!hasPermission) {
          console.log("Sin permiso, redirigiendo a access-denied");
          router.push("/access-denied");
          return;
        }

        console.log("Usuario autorizado");
        setIsAuthorized(true);
      } catch (error) {
        console.error("Error al verificar permisos:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [allowedRoles, router]);

  return { isAuthorized, isLoading };
}
