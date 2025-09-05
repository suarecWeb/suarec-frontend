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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Historial de Balance
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
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay transacciones de balance</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {balanceService.getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">
                          {balanceService.getTransactionTypeDescription(
                            transaction.type,
                          )}
                        </h4>
                        <Badge
                          variant={
                            transaction.amount > 0 ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {balanceService.formatBalance(transaction.amount)}
                        </Badge>
                      </div>
                      {transaction.description && (
                        <p className="text-sm text-gray-600 mb-1">
                          {transaction.description}
                        </p>
                      )}
                      {transaction.contract?.publication?.title && (
                        <p className="text-xs text-gray-500">
                          Contrato: {transaction.contract.publication.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.createdAt).toLocaleString(
                          "es-CO",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="space-y-2">
                      {/* Deudas */}
                      <div>
                        <div className="text-xs text-gray-500">Deudas:</div>
                        <div className="text-sm">
                          <span className="text-gray-600">
                            {balanceService.formatBalance(
                              transaction.debitBalanceBefore,
                            )}
                          </span>
                          <span className="mx-1">→</span>
                          <span
                            className={`font-medium ${transaction.debitBalanceAfter > 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {balanceService.formatBalance(
                              transaction.debitBalanceAfter,
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Créditos */}
                      <div>
                        <div className="text-xs text-gray-500">Créditos:</div>
                        <div className="text-sm">
                          <span className="text-gray-600">
                            {balanceService.formatBalance(
                              transaction.creditBalanceBefore,
                            )}
                          </span>
                          <span className="mx-1">→</span>
                          <span
                            className={`font-medium ${transaction.creditBalanceAfter > 0 ? "text-green-600" : "text-gray-600"}`}
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
              </div>
            ))}

            {/* Paginación */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Página {meta.page} de {meta.totalPages} ({meta.total}{" "}
                  transacciones)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!meta.hasPrevPage || refreshing}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!meta.hasNextPage || refreshing}
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
