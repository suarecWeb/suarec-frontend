// components/notification-badge.tsx
import { useEffect, useState } from "react";
import ApplicationService from "@/services/ApplicationService";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { TokenPayload } from "@/interfaces/auth.interface";

interface NotificationBadgeProps {
  children: React.ReactNode;
  userRoles: string[];
}

const NotificationBadge = ({ children, userRoles }: NotificationBadgeProps) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error("Error al decodificar token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchPendingApplications = async () => {
      if (!currentUserId || !userRoles.includes("BUSINESS")) return;

      try {
        // Obtener aplicaciones pendientes de la empresa
        const response = await ApplicationService.getCompanyApplications(
          currentUserId.toString(),
          { page: 1, limit: 100 }, // Obtener todas para contar
        );

        const pendingApplications = response.data.data.filter(
          (app) => app.status === "PENDING",
        );

        setPendingCount(pendingApplications.length);
      } catch (error) {
        console.error("Error al obtener aplicaciones pendientes:", error);
        setPendingCount(0);
      }
    };

    fetchPendingApplications();

    // Actualizar cada 5 minutos
    const interval = setInterval(fetchPendingApplications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentUserId, userRoles]);

  return (
    <div className="relative">
      {children}
      {pendingCount > 0 && userRoles.includes("BUSINESS") && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {pendingCount > 99 ? "99+" : pendingCount}
        </span>
      )}
    </div>
  );
};

export default NotificationBadge;
