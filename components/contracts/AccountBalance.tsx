"use client";

import { useBalance } from "../../hooks/useBalance";
import { balanceService } from "../../services/balanceService";
import { RefreshCw, Wallet, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface AccountBalanceProps {
  showRefreshButton?: boolean;
  className?: string;
}

export function AccountBalance({
  showRefreshButton = true,
  className = "",
}: AccountBalanceProps) {
  const { currentBalance, loading, error, refreshBalance } = useBalance();
  const [refreshing, setRefreshing] = useState(false);
  const [activeCard, setActiveCard] = useState<"deudas" | "creditos">("deudas");

  const toggleCard = () => {
    setActiveCard(activeCard === "deudas" ? "creditos" : "deudas");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBalance();
    setRefreshing(false);
  };

  if (loading && !currentBalance) {
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Balance de Cuenta
              </h3>
              <p className="text-sm text-gray-600">Gestión financiera</p>
            </div>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Balance de Cuenta
                </h3>
                <p className="text-sm text-gray-600">Gestión financiera</p>
              </div>
            </div>
            {showRefreshButton && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
            )}
          </div>
          <div className="text-red-600 text-sm mb-2">{error}</div>
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 inline ${refreshing ? "animate-spin" : ""}`}
              />
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  const debitBalance = currentBalance?.debitBalance ?? 0;
  const creditBalance = currentBalance?.creditBalance ?? 0;
  const canRequestNewService = currentBalance?.canRequestNewService ?? true;

  return (
    <div className={`${className} relative`}>
      {/* Card-style wallet container */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 aspect-[1.6/1] max-w-md mx-auto">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#097EEC]/5 via-transparent to-[#097EEC]/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#097EEC]/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#097EEC]/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>

        {/* Refresh button in top right */}
        {showRefreshButton && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-20"
          >
            <RefreshCw
              className={`h-4 w-4 text-gray-600 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        )}

        {/* Card content */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-between text-gray-800">
          {/* Header */}
          <div className="flex items-center gap-3 mt-4">
            <Wallet className="h-6 w-6 text-[#097EEC]" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Balance de Cuenta
              </h3>
              <p className="text-sm text-gray-600">Gestión financiera</p>
            </div>
          </div>

          {/* Balance display */}
          <div className="space-y-3">
            {/* Active balance display */}
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">
                {activeCard === "deudas"
                  ? "Deudas Pendientes"
                  : "Créditos Disponibles"}
              </div>
              <div className="text-3xl font-bold text-gray-800">
                {activeCard === "deudas"
                  ? balanceService.formatBalance(debitBalance)
                  : balanceService.formatBalance(creditBalance)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {activeCard === "deudas"
                  ? "Saldo en contra por servicios recibidos"
                  : "Saldo a favor por servicios prestados"}
              </div>
            </div>

            {/* Toggle buttons */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setActiveCard("deudas")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                  activeCard === "deudas"
                    ? "bg-[#097EEC]/20 text-[#097EEC] border border-[#097EEC]/30"
                    : "bg-gray-100/80 text-gray-600 border border-gray-200 hover:bg-gray-200/80"
                }`}
              >
                Deudas
              </button>
              <button
                onClick={() => setActiveCard("creditos")}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                  activeCard === "creditos"
                    ? "bg-[#097EEC]/20 text-[#097EEC] border border-[#097EEC]/30"
                    : "bg-gray-100/80 text-gray-600 border border-gray-200 hover:bg-gray-200/80"
                }`}
              >
                Créditos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning message below card if account is restricted */}
      {!canRequestNewService && (
        <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-red-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-red-800 mb-1">
                ⚠️ Cuenta temporalmente restringida
              </p>
              <p className="text-red-700 leading-relaxed">
                Para mantener la confianza en nuestra plataforma, necesitas
                saldar las deudas pendientes antes de solicitar nuevos
                servicios. ¡Gracias por tu comprensión!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
