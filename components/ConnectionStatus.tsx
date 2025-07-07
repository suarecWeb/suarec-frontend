'use client';

import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected, isConnecting }) => {
  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 text-yellow-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Conectando...</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-white">
        <Wifi className="w-4 h-4" />
        <span className="text-sm">Conectado</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-red-600">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm">Desconectado</span>
    </div>
  );
};

export default ConnectionStatus; 