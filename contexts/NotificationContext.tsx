'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';

interface NotificationContextType {
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  showMessageNotification: (message: string, senderName: string, senderId?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      default:
        toast(message);
        break;
    }
  };

  const showMessageNotification = (message: string, senderName: string, senderId?: number) => {
    console.log('🔔 showMessageNotification llamado con:', { message, senderName, senderId });
    
    toast(
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#097EEC]/10 rounded-full flex items-center justify-center">
          <svg className="h-4 w-4 text-[#097EEC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm text-gray-900">Nuevo mensaje de {senderName}</p>
          <p className="text-xs text-gray-600">Te envió un mensaje</p>
        </div>
        <button
          onClick={() => {
            // Navegar al chat específico con el senderId
            if (senderId) {
              window.location.href = `/chat?sender=${senderId}`;
            } else {
              window.location.href = '/chat';
            }
          }}
          className="px-2 py-1 text-xs bg-[#097EEC] text-white rounded hover:bg-[#0A6BC7] transition-colors"
        >
          Ver
        </button>
      </div>,
      {
        duration: 8000,
        position: 'top-right',
        style: {
          background: '#fff',
          color: '#333',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      }
    );
    
    console.log('✅ Toast mostrado exitosamente');
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showMessageNotification }}>
      {children}
      <Toaster />
    </NotificationContext.Provider>
  );
}; 