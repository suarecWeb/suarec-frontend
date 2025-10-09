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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Balance de Cuenta
          </div>
          {showRefreshButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Saldo de Deuda */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Deudas Pendientes:
              </span>
              <span
                className={`text-lg font-bold ${debitBalance > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {balanceService.formatBalance(debitBalance)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Saldo en contra por servicios recibidos
            </div>
          </div>

          {/* Saldo de Crédito */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Créditos Disponibles:
              </span>
              <span
                className={`text-lg font-bold ${creditBalance > 0 ? "text-green-600" : "text-gray-600"}`}
              >
                {balanceService.formatBalance(creditBalance)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Saldo a favor por servicios prestados
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Estado:</span>
            <Badge
              variant={canRequestNewService ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {canRequestNewService ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">
                    No puedes solicitar nuevos servicios
                  </p>
                  <p className="text-red-600 mt-1">
                    Tienes deudas pendientes por servicios recibidos. Debes
                    pagar completamente tus deudas antes de solicitar nuevos
                    servicios.
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
