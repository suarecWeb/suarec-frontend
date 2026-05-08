"use client";
import React, { createContext, useContext, ReactNode, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { sileo } from "sileo";

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  senderName: string;
  senderId?: number;
  senderAvatar?: string;
  timestamp: number;
  read: boolean;
}

interface NotificationContextType {
  showNotification: (
    message: string,
    type?: "success" | "error" | "info",
  ) => void;
  showMessageNotification: (
    message: string,
    senderName: string,
    senderId?: number,
    senderAvatar?: string,
  ) => void;
  showContractNotification: (
    message: string,
    type: "accepted" | "rejected" | "negotiating" | "created",
    amount?: string,
  ) => void;
  notifications: NotificationRecord[];
  clearNotifications: () => void;
  markAllRead: () => void;
  unreadCount: number;
}

const STORAGE_KEY = "suarec_notifications";

const loadFromStorage = (): NotificationRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (records: NotificationRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {}
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>(() =>
    loadFromStorage(),
  );

  const addRecord = (record: NotificationRecord) => {
    setNotifications((prev) => {
      const updated = [record, ...prev].slice(0, 50);
      saveToStorage(updated);
      return updated;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    saveToStorage([]);
  };

  const markAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveToStorage(updated);
      return updated;
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      default:
        toast(message);
        break;
    }
  };

  const showMessageNotification = (
    message: string,
    senderName: string,
    senderId?: number,
    senderAvatar?: string,
  ) => {
    const now = Date.now();
    const time = new Date(now).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const record: NotificationRecord = {
      id: `${now}-${Math.random().toString(36).slice(2)}`,
      title: `Nuevo mensaje de ${senderName}`,
      message,
      senderName,
      senderId,
      senderAvatar,
      timestamp: now,
      read: false,
    };

    addRecord(record);

    const avatar = senderAvatar ? (
      <img
        src={senderAvatar}
        alt={senderName}
        style={{
          width: 32,
          height: 32,
          minWidth: 32,
          minHeight: 32,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    ) : (
      <div
        style={{
          width: 32,
          height: 32,
          minWidth: 32,
          minHeight: 32,
          borderRadius: "50%",
          flexShrink: 0,
          background: "#097EEC",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {senderName.charAt(0).toUpperCase()}
      </div>
    );

    sileo.info({
      title: `${senderName} · ${time}`,
      description: message,
      position: "top-right",
      duration: 2500,
      icon: avatar,
      button: {
        title: "Ver",
        onClick: () => {
          window.location.href = senderId
            ? `/chat?sender=${senderId}`
            : "/chat";
        },
      },
    });
  };

  const showContractNotification = (
    message: string,
    type: "accepted" | "rejected" | "negotiating" | "created",
    amount?: string,
  ) => {
    const getIcon = () => {
      switch (type) {
        case "accepted":
          return "✅";
        case "rejected":
          return "❌";
        case "negotiating":
          return "💬";
        case "created":
          return "🎉";
        default:
          return "📋";
      }
    };

    const getColor = () => {
      switch (type) {
        case "accepted":
          return "#10B981";
        case "rejected":
          return "#EF4444";
        case "negotiating":
          return "#3B82F6";
        case "created":
          return "#8B5CF6";
        default:
          return "#097EEC";
      }
    };

    toast(
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
          style={{ backgroundColor: getColor() }}
        >
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm text-gray-900">{message}</p>
          {amount && <p className="text-xs text-gray-600">Monto: {amount}</p>}
        </div>
      </div>,
      {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#fff",
          color: "#333",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          padding: "12px",
        },
      },
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showMessageNotification,
        showContractNotification,
        notifications,
        clearNotifications,
        markAllRead,
        unreadCount,
      }}
    >
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            textAlign: "center",
            justifyContent: "center",
            maxWidth: "360px",
            padding: "12px 16px",
          },
          success: {
            style: {
              textAlign: "center",
              justifyContent: "center",
            },
          },
          error: {
            style: {
              textAlign: "center",
              justifyContent: "center",
            },
          },
        }}
      />
    </NotificationContext.Provider>
  );
};
