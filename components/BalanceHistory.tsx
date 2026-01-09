"use client";

import { useBalance } from "../hooks/useBalance";
import { balanceService } from "../services/balanceService";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface BalanceHistoryProps {
  className?: string;
}

export function BalanceHistory({ className = "" }: BalanceHistoryProps) {
  const { balanceHistory, loading, error, refreshHistory } = useBalance(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async (page: number = 1) => {
    setRefreshing(true);
    await refreshHistory(page, 10);
    setRefreshing(false);
  };

  useEffect(() => {
    loadHistory(currentPage);
  }, [currentPage]);

  const handleRefresh = async () => {
    await loadHistory(currentPage);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading && !balanceHistory) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Historial de Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Historial de Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-sm mb-2">{error}</div>
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
        </CardContent>
      </Card>
    );
  }

  const transactions = balanceHistory?.data || [];
  const meta = balanceHistory?.meta;

  return (
    <Card
      className={`${className} relative overflow-hidden bg-gradient-to-t from-purple-900/20 via-purple-500/10 to-transparent backdrop-blur-xl backdrop-saturate-150 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300`}
    >
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-500/10 to-pink-500/10 rounded-full -translate-y-20 translate-x-20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full translate-y-16 -translate-x-16"></div>

      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <RefreshCw className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Historial de Transacciones
              </h3>
              <p className="text-sm text-gray-600">Movimientos financieros</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="hover:bg-purple-100 rounded-xl"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">
              No hay transacciones registradas
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Los movimientos aparecerán aquí cuando realices operaciones
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/40 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white/80"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
                      {balanceService.getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {balanceService.getTransactionTypeDescription(
                            transaction.type,
                          )}
                        </h4>
                        <Badge
                          variant={
                            transaction.amount > 0 ? "default" : "secondary"
                          }
                          className={`px-3 py-1 rounded-xl font-medium ${
                            transaction.amount > 0
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                              : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                          }`}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {balanceService.formatBalance(transaction.amount)}
                        </Badge>
                      </div>
                      {transaction.description && (
                        <p className="text-sm text-gray-700 mb-2 bg-gray-50 px-3 py-1 rounded-lg">
                          💬 {transaction.description}
                        </p>
                      )}
                      {transaction.contract?.publication?.title && (
                        <p className="text-sm text-blue-600 mb-2 bg-blue-50 px-3 py-1 rounded-lg">
                          📋 Contrato: {transaction.contract.publication.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md inline-block">
                        🕒{" "}
                        {new Date(transaction.createdAt).toLocaleString(
                          "es-CO",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-3">
                    {/* Deudas */}
                    <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                      <div className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Deudas
                      </div>
                      <div className="text-sm flex items-center gap-2">
                        <span className="text-gray-600 font-medium">
                          {balanceService.formatBalance(
                            transaction.debitBalanceBefore,
                          )}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span
                          className={`font-bold ${transaction.debitBalanceAfter > 0 ? "text-red-600" : "text-green-600"}`}
                        >
                          {balanceService.formatBalance(
                            transaction.debitBalanceAfter,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Créditos */}
                    <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                      <div className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Créditos
                      </div>
                      <div className="text-sm flex items-center gap-2">
                        <span className="text-gray-600 font-medium">
                          {balanceService.formatBalance(
                            transaction.creditBalanceBefore,
                          )}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span
                          className={`font-bold ${transaction.creditBalanceAfter > 0 ? "text-green-600" : "text-gray-600"}`}
                        >
                          {balanceService.formatBalance(
                            transaction.creditBalanceAfter,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Paginación */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200/60 bg-gradient-to-r from-gray-50/50 to-purple-50/30 rounded-2xl p-4">
                <div className="text-sm text-gray-700 font-medium">
                  📄 Página {meta.page} de {meta.totalPages} • {meta.total}{" "}
                  transacciones
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!meta.hasPrevPage || refreshing}
                    className="bg-white/80 hover:bg-white border-gray-200 rounded-xl"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!meta.hasNextPage || refreshing}
                    className="bg-white/80 hover:bg-white border-gray-200 rounded-xl"
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
