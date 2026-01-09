"use client";

import { useBalance } from "../hooks/useBalance";
import { balanceService } from "../services/balanceService";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { RefreshCw, Wallet, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface BalanceCardProps {
  showRefreshButton?: boolean;
  className?: string;
}

export function BalanceCard({
  showRefreshButton = true,
  className = "",
}: BalanceCardProps) {
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
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Balance de Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Balance de Cuenta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm mb-2">{error}</div>
          {showRefreshButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Reintentar
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const debitBalance = currentBalance?.debitBalance ?? 0;
  const creditBalance = currentBalance?.creditBalance ?? 0;
  const canRequestNewService = currentBalance?.canRequestNewService ?? true;

  // Debug: Log the current balance data
  console.log("🔍 BalanceCard Debug:", {
    currentBalance,
    debitBalance,
    creditBalance,
    canRequestNewService,
  });

  return (
    <Card
      className={`${className} relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300`}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-500/10 to-blue-500/10 rounded-full translate-y-12 -translate-x-12"></div>

      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center justify-between">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="hover:bg-blue-100 rounded-xl"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-6">
          {/* Interactive Wallet Cards */}
          <div className="relative h-40">
            {/* Deudas Pendientes Card */}
            <div
              className={`absolute backdrop-blur-sm rounded-2xl p-4 border shadow-sm cursor-pointer transition-all duration-500 transform ${
                activeCard === "deudas"
                  ? "z-20 scale-100 opacity-100 translate-y-0 left-0 right-0 bottom-0 bg-white/60 border-white/20"
                  : "z-10 scale-90 opacity-85 -translate-y-10 left-2 right-2 bottom-2 bg-gray-200/80 border-gray-300/40"
              }`}
              onClick={toggleCard}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Deudas Pendientes
                </span>
                <span
                  className={`text-xl font-bold ${debitBalance > 0 ? "text-red-600" : "text-green-600"}`}
                >
                  {balanceService.formatBalance(debitBalance)}
                </span>
              </div>
              <div
                className={`text-xs text-gray-500 px-2 py-1 rounded-md ${
                  activeCard === "deudas" ? "bg-gray-50" : "bg-gray-100"
                }`}
              >
                Saldo en contra por servicios recibidos
              </div>
            </div>

            {/* Créditos Disponibles Card */}
            <div
              className={`absolute backdrop-blur-sm rounded-2xl p-4 border shadow-sm cursor-pointer transition-all duration-500 transform ${
                activeCard === "creditos"
                  ? "z-20 scale-100 opacity-100 translate-y-0 left-0 right-0 bottom-0 bg-white/60 border-white/20"
                  : "z-10 scale-90 opacity-85 -translate-y-10 left-2 right-2 bottom-2 bg-gray-200/80 border-gray-300/40"
              }`}
              onClick={toggleCard}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Créditos Disponibles
                </span>
                <span
                  className={`text-xl font-bold ${creditBalance > 0 ? "text-green-600" : "text-gray-600"}`}
                >
                  {balanceService.formatBalance(creditBalance)}
                </span>
              </div>
              <div
                className={`text-xs text-gray-500 px-2 py-1 rounded-md ${
                  activeCard === "creditos" ? "bg-gray-50" : "bg-gray-100"
                }`}
              >
                Saldo a favor por servicios prestados
              </div>
            </div>
          </div>

          {/* Card Indicators */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setActiveCard("deudas")}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeCard === "deudas" ? "bg-red-500" : "bg-gray-300"
              }`}
            />
            <button
              onClick={() => setActiveCard("creditos")}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeCard === "creditos" ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          </div>

          {/* Account Status */}
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl p-4">
            <span className="text-sm font-semibold text-gray-700">
              Estado de la cuenta:
            </span>
            <Badge
              variant={canRequestNewService ? "default" : "destructive"}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium ${
                canRequestNewService
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  : "bg-gradient-to-r from-red-500 to-red-600"
              }`}
            >
              {canRequestNewService ? (
                <>
                  <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse"></div>
                  Activo
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  Bloqueado
                </>
              )}
            </Badge>
          </div>

          {!canRequestNewService && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-4 shadow-sm">
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
      </CardContent>
    </Card>
  );
}
