"use client";

import { useState, useEffect } from "react";
import { Mail, X, Bell, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Notification } from "@/interfaces/notification.interface";
import { NotificationService } from "@/services/NotificationService";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export const FloatingMailbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    setIsAuthenticated(!!token);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await NotificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      // Silenciosamente usar datos mock sin mostrar error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      // Recargar notificaciones cada 5 minutos
      const interval = setInterval(loadNotifications, 300000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const markAsRead = async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const notif = notifications.find((n) => n.id === id);
      if (notif && !notif.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      await NotificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
      setIsOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Hace un momento";
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Botón flotante del buzón */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-6 bottom-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isOpen ? "bg-gray-700 rotate-12" : "bg-[#097EEC] hover:bg-[#0866c6]"
        }`}
        aria-label="Abrir buzón de notificaciones"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <Mail className="h-6 w-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Panel del buzón */}
      <div
        className={`fixed right-6 bottom-24 z-40 w-96 bg-white rounded-2xl shadow-2xl transition-all duration-300 transform ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-[#097EEC] p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-white" />
              <h3 className="text-white font-bold text-lg">Notificaciones</h3>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-white/90 hover:text-white underline transition-colors"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 transition-colors duration-200 hover:bg-gray-50 cursor-pointer ${
                    !notif.read ? "bg-[#097EEC]/5" : ""
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`text-sm font-semibold ${
                            !notif.read ? "text-gray-900" : "text-gray-600"
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {getTimeAgo(notif.timestamp)}
                      </p>
                      {!notif.read && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-[#097EEC] bg-[#097EEC]/10 rounded-full">
                            Nueva
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 bg-gray-50 rounded-b-2xl border-t border-gray-100">
            <button className="w-full text-center text-sm text-[#097EEC] hover:text-[#0866c6] font-semibold transition-colors">
              Ver todas las notificaciones
            </button>
          </div>
        )}
      </div>

      {/* Overlay para cerrar al hacer clic fuera */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
