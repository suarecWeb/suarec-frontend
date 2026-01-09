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
      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
        <Loader2 className="h-4 w-4 animate-spin text-white" />
        <span className="text-sm font-medium text-white">Conectando...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-3 py-2 rounded-full border border-green-300/50">
        <Wifi className="h-4 w-4 text-white" />
        <span className="text-sm font-medium text-white">Conectado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-red-500/20 backdrop-blur-sm px-3 py-2 rounded-full border border-red-300/50">
      <WifiOff className="h-4 w-4 text-white" />
      <span className="text-sm font-medium text-white">Desconectado</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-2 px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-md transition-colors text-white border border-white/30"
        >
          Reintentar
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
