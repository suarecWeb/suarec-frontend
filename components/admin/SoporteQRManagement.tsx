"use client";

import { useState, useRef } from "react";
import {
  Search,
  Mail,
  Ticket,
  CheckCircle,
  XCircle,
  Inbox,
  SendHorizonal,
  FileText,
  AlertCircle,
} from "lucide-react";
import EventsService from "@/services/EventsService";
import { BoletaSoporte, BoletaEstado } from "@/interfaces/boleta.interface";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const ESTADO_CONFIG: Record<
  BoletaEstado,
  { label: string; color: string; icon: React.ReactNode }
> = {
  [BoletaEstado.ACTIVA]: {
    label: "Activa",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  [BoletaEstado.USADA]: {
    label: "Usada",
    color: "bg-gray-100 text-gray-500 border-gray-200",
    icon: <Ticket className="h-3 w-3" />,
  },
  [BoletaEstado.CANCELADA]: {
    label: "Cancelada",
    color: "bg-red-100 text-red-600 border-red-200",
    icon: <XCircle className="h-3 w-3" />,
  },
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(v);

const formatDate = (d: string) =>
  new Date(d).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const SoporteQRManagement = () => {
  const [email, setEmail] = useState("");
  const [boletas, setBoletas] = useState<BoletaSoporte[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sending, setSending] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await EventsService.adminGetBoletasSoporte(
        email.trim() || undefined,
      );
      setBoletas(data.boletas);
    } catch {
      toast.error("No se pudo cargar las boletas");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleReenviar = async (boleta: BoletaSoporte) => {
    setSending(boleta.boletaId);
    try {
      await EventsService.adminReenviarEmail(boleta.boletaId);
      toast.success(`Email reenviado a ${boleta.compradorEmail}`);
    } catch {
      toast.error("No se pudo reenviar el email");
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-[#097EEC]/10">
          <Ticket className="h-4 w-4 text-[#097EEC]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Soporte QR</h2>
          <p className="text-xs text-gray-400">
            Reenvía el email de confirmación con el QR cuando el usuario no lo
            recibió
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Buscar por email del comprador
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="correo@ejemplo.com"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] focus:bg-white transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] disabled:opacity-60 transition-colors"
          >
            {loading ? "Buscando…" : "Buscar"}
          </button>
          {email && (
            <button
              onClick={() => {
                setEmail("");
                setBoletas([]);
                setSearched(false);
                inputRef.current?.focus();
              }}
              className="px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-gray-400">
          Deja el campo vacío y presiona Buscar para ver las 50 boletas más
          recientes
        </p>
      </div>

      {/* Resultados */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-16 flex flex-col items-center gap-2 text-gray-400"
          >
            <div className="h-6 w-6 border-2 border-[#097EEC]/30 border-t-[#097EEC] rounded-full animate-spin" />
            <span className="text-sm">Buscando boletas…</span>
          </motion.div>
        ) : searched && boletas.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-16 flex flex-col items-center gap-2 text-gray-400"
          >
            <Inbox className="h-8 w-8 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">
              No se encontraron boletas
            </p>
            {email && (
              <p className="text-xs text-gray-400">
                No hay boletas para <span className="font-medium">{email}</span>
              </p>
            )}
          </motion.div>
        ) : boletas.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <p className="text-xs text-gray-400 px-0.5">
              {boletas.length} boleta{boletas.length !== 1 ? "s" : ""}{" "}
              encontrada{boletas.length !== 1 ? "s" : ""}
            </p>

            {boletas.map((boleta) => {
              const estadoCfg = ESTADO_CONFIG[boleta.estado];
              const isSending = sending === boleta.boletaId;

              return (
                <div
                  key={boleta.boletaId}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Info principal */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Evento + estado */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800 truncate">
                          {boleta.eventoNombre}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${estadoCfg.color}`}
                        >
                          {estadoCfg.icon}
                          {estadoCfg.label}
                        </span>
                      </div>

                      {/* Comprador */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          <span className="font-medium text-gray-700">
                            {boleta.compradorNombre}
                          </span>{" "}
                          · {boleta.compradorEmail}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 flex-wrap">
                        <span>
                          Boleta #{boleta.boletaId} ·{" "}
                          {formatCurrency(boleta.precioPagado)} ·{" "}
                          {formatDate(boleta.createdAt)}
                        </span>
                        {boleta.pdfUrl === null && (
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <AlertCircle className="h-3 w-3" />
                            PDF pendiente
                          </span>
                        )}
                        {boleta.pdfUrl && (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <FileText className="h-3 w-3" />
                            PDF listo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Acción */}
                    <button
                      onClick={() => handleReenviar(boleta)}
                      disabled={isSending}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#097EEC] bg-[#097EEC]/8 border border-[#097EEC]/20 rounded-lg hover:bg-[#097EEC]/15 disabled:opacity-60 transition-colors"
                    >
                      {isSending ? (
                        <div className="h-3 w-3 border border-[#097EEC]/40 border-t-[#097EEC] rounded-full animate-spin" />
                      ) : (
                        <SendHorizonal className="h-3 w-3" />
                      )}
                      {isSending ? "Enviando…" : "Reenviar email"}
                    </button>
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default SoporteQRManagement;
