"use client";

import React from "react";
import { Wifi, WifiOff, Loader2, AlertCircle } from "lucide-react";

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  onRetry?: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isConnecting,
  onRetry,
}) => {
  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 text-amber-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Conectando...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Wifi className="h-4 w-4" />
        <span className="text-sm font-medium">Conectado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-red-600">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">Desconectado</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-2 px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
