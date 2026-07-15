"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Printer,
  Inbox,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CalendarDays,
  Ticket,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import EventsService from "@/services/EventsService";
import {
  MetodoPagoFisico,
  VentaFisicaGlobal,
} from "@/interfaces/ventaFisica.interface";
import { formatDisplayDate } from "@/lib/TimeZone";

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const METODO_PAGO_CONFIG: Record<
  MetodoPagoFisico,
  { label: string; color: string }
> = {
  [MetodoPagoFisico.EFECTIVO]: {
    label: "Efectivo",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  [MetodoPagoFisico.TRANSFERENCIA]: {
    label: "Transferencia",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

const VentasFisicasManagement = () => {
  const [ventas, setVentas] = useState<VentaFisicaGlobal[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);

  const cargarVentas = useCallback(async (paginaActual: number) => {
    setLoading(true);
    try {
      const res = await EventsService.getVentasFisicasGlobal(paginaActual);
      setVentas(res.data.ventas);
      setTotalPaginas(res.data.totalPaginas);
      setTotal(res.data.total);
    } catch {
      toast.error("No se pudo cargar el historial de ventas físicas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarVentas(page);
  }, [page, cargarVentas]);

  // Mismo generador de botones de paginación (con puntos suspensivos) que
  // usa VentasManagement.tsx (digital) — aqui `page`/`totalPaginas` vienen
  // del servidor en vez de calcularse sobre un arreglo ya cargado.
  const getPageButtons = () => {
    const pageItems: { type: "page" | "ellipsis"; value: number | string }[] =
      [];
    for (let p = 1; p <= totalPaginas; p++) {
      if (
        totalPaginas <= 5 ||
        p === 1 ||
        p === totalPaginas ||
        Math.abs(p - page) <= 1
      ) {
        if (
          pageItems.length > 0 &&
          pageItems[pageItems.length - 1].type === "page" &&
          p > (pageItems[pageItems.length - 1].value as number) + 1
        ) {
          pageItems.push({ type: "ellipsis", value: "..." });
        }
        pageItems.push({ type: "page", value: p });
      }
    }
    return pageItems.map((item, i) =>
      item.type === "ellipsis" ? (
        <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400">
          {item.value}
        </span>
      ) : (
        <button
          key={item.value}
          onClick={() => setPage(item.value as number)}
          className={`min-w-[2rem] h-8 px-2 rounded-lg text-xs font-medium transition-colors ${
            page === (item.value as number)
              ? "bg-[#097EEC] text-white"
              : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {item.value}
        </button>
      ),
    );
  };

  return (
    <div>
      {/* Barra superior: total + botón actualizar (mismo patrón que digital) */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500">
          {total} venta{total === 1 ? "" : "s"} en total
        </p>
        <button
          onClick={() => cargarVentas(page)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors"
          title="Recargar ventas"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#097EEC] border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-gray-400">Cargando ventas físicas...</p>
        </div>
      ) : ventas.length === 0 ? (
        <div className="py-20 text-center">
          <div className="bg-gray-50 border border-gray-100 inline-flex rounded-full p-5 mb-4">
            <Inbox className="h-9 w-9 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-700">
            No hay ventas físicas
          </h3>
          <p className="mt-1.5 text-sm text-gray-400">
            Aún no se ha registrado ninguna venta presencial.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-[#097EEC] text-xs font-medium">
            <Printer className="h-4 w-4" />
            Integración con impresora térmica POS-80C en desarrollo
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Evento
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Cant.
                  </th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Método de pago
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Cambio
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Comisión
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {ventas.map((venta, i) => {
                  const mc = METODO_PAGO_CONFIG[venta.metodoPago];
                  return (
                    <motion.tr
                      key={venta.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                          <span className="text-sm text-gray-700 truncate max-w-[180px]">
                            {venta.eventoNombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                          <Ticket className="h-3.5 w-3.5 text-gray-300" />
                          {venta.cantidad}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${mc.color}`}
                        >
                          {mc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <span className="text-sm font-semibold text-gray-700">
                          {formatCOP(venta.montoTotal)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right text-sm text-gray-500">
                        {venta.cambio !== null ? formatCOP(venta.cambio) : "—"}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right text-sm text-gray-500">
                        {formatCOP(venta.comision)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-xs text-gray-500">
                          {formatDisplayDate(venta.createdAt)}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación — mismo layout que VentasManagement.tsx */}
          <div className="flex flex-col items-center gap-3 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>
                Página <span className="font-medium text-gray-700">{page}</span>{" "}
                de{" "}
                <span className="font-medium text-gray-700">
                  {totalPaginas}
                </span>{" "}
                · <span className="font-medium text-gray-700">{total}</span>{" "}
                resultados
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageButtons()}

              <button
                onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
                disabled={page >= totalPaginas}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VentasFisicasManagement;
