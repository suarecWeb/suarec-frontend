import { useState, useEffect, useCallback } from "react";
import {
  balanceService,
  CurrentBalance,
  BalanceHistoryResponse,
  BalanceStats,
} from "../services/balanceService";

export interface UseBalanceReturn {
  currentBalance: CurrentBalance | null;
  balanceHistory: BalanceHistoryResponse | null;
  balanceStats: BalanceStats | null;
  loading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  refreshHistory: (page?: number, limit?: number) => Promise<void>;
  refreshStats: () => Promise<void>;
  canRequestNewService: boolean;
}

export const useBalance = (autoFetch: boolean = true) => {
  const [currentBalance, setCurrentBalance] = useState<CurrentBalance | null>(
    null,
  );
  const [balanceHistory, setBalanceHistory] =
    useState<BalanceHistoryResponse | null>(null);
  const [balanceStats, setBalanceStats] = useState<BalanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const balance = await balanceService.getCurrentBalance();
      setCurrentBalance(balance);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al obtener el balance");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshHistory = useCallback(
    async (page: number = 1, limit: number = 10) => {
      try {
        setLoading(true);
        setError(null);
        const history = await balanceService.getBalanceHistory(page, limit);
        setBalanceHistory(history);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Error al obtener el historial",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await balanceService.getBalanceStats();
      setBalanceStats(stats);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al obtener las estadísticas",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      refreshBalance();
    }
  }, [autoFetch, refreshBalance]);

  const canRequestNewService = currentBalance?.canRequestNewService ?? true;

  return {
    currentBalance,
    balanceHistory,
    balanceStats,
    loading,
    error,
    refreshBalance,
    refreshHistory,
    refreshStats,
    canRequestNewService,
  };
};
