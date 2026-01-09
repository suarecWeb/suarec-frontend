import axios from "axios";
import Cookies from "js-cookie";
import {
  Notification,
  NotificationResponse,
} from "@/interfaces/notification.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const USE_MOCK_DATA = true; // Cambiar a false cuando el backend esté listo

export class NotificationService {
  static async getNotifications(): Promise<NotificationResponse> {
    // Usar datos mock temporalmente hasta que el backend implemente el endpoint
    if (USE_MOCK_DATA) {
      return this.getMockNotifications();
    }

    try {
      const token = Cookies.get("token");
      const response = await axios.get(`${API_URL}/suarec/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.warn(
        "Backend notifications endpoint not available, using mock data",
      );
      return this.getMockNotifications();
    }
  }

  private static getMockNotifications(): NotificationResponse {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "success",
        title: "¡Bienvenido a SUAREC!",
        message: "Completa tu perfil para empezar a recibir oportunidades.",
        timestamp: new Date(Date.now() - 3600000),
        read: false,
      },
      {
        id: "2",
        type: "info",
        title: "Explora el dashboard",
        message: "Revisa tus estadísticas y progreso en la plataforma.",
        timestamp: new Date(Date.now() - 7200000),
        read: false,
      },
      {
        id: "3",
        type: "success",
        title: "Sistema de niveles activo",
        message: "Ahora puedes ver tu progreso y desbloquear badges.",
        timestamp: new Date(Date.now() - 86400000),
        read: true,
      },
    ];

    return {
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter((n) => !n.read).length,
    };
  }

  static async markAsRead(notificationId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return Promise.resolve();
    }

    try {
      const token = Cookies.get("token");
      await axios.patch(
        `${API_URL}/suarec/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.warn("Backend notifications endpoint not available");
    }
  }

  static async markAllAsRead(): Promise<void> {
    if (USE_MOCK_DATA) {
      return Promise.resolve();
    }

    try {
      const token = Cookies.get("token");
      await axios.patch(
        `${API_URL}/suarec/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.warn("Backend notifications endpoint not available");
    }
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      return Promise.resolve();
    }

    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_URL}/suarec/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.warn("Backend notifications endpoint not available");
    }
  }
}
