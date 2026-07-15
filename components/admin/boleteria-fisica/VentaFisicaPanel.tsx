"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Evento } from "@/interfaces/event.interface";
import {
  BoleteriaFisicaTicket,
  type BoleteriaFisicaTicketRef,
} from "@/components/admin/BoleteriaFisicaTicket";
import EventsService from "@/services/EventsService";
import { MetodoPagoFisico } from "@/interfaces/boleteria-fisica.interface";
import {
  Printer,
  Usb,
  ArrowLeft,
  ShoppingCart,
  Banknote,
  ArrowRightLeft,
  PlusCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface VentaFisicaPanelProps {
  evento?: Evento;
  onBack?: () => void;
}

const contentVariants = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

const formatEventDate = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-CO", {
    timeZone: "America/Bogota",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatEventTime = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString("es-CO", {
    timeZone: "America/Bogota",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

export const VentaFisicaPanel = ({ evento, onBack }: VentaFisicaPanelProps) => {
  const [qrValue, setQrValue] = useState("SUAREC-EVT-001-TKT-0001");
  const [tipoBoleta, setTipoBoleta] = useState<"GENERAL" | "VIP">("GENERAL");
  const [fechaEvento, setFechaEvento] = useState(
    "Domingo, 19 de julio de 2026",
  );
  const [horaEvento, setHoraEvento] = useState("6:00 p.m.");
  const [ubicacion, setUbicacion] = useState("La Herradura, Cauca");
  const [precio, setPrecio] = useState("20000");
  const [cantidad, setCantidad] = useState(1);
  const [fechaCompra, setFechaCompra] = useState(
    new Date().toLocaleDateString("es-CO"),
  );

  // Método de pago
  const [metodoPago, setMetodoPago] = useState<MetodoPagoFisico>(
    MetodoPagoFisico.EFECTIVO,
  );
  const [billeteRecibido, setBilleteRecibido] = useState<string>("");

  // Estados de acciones
  const [vendiendo, setVendiendo] = useState(false);
  const [generandoLote, setGenerandoLote] = useState(false);
  const [cantidadLote, setCantidadLote] = useState<string>("1000");
  const [resultadoVenta, setResultadoVenta] = useState<{
    ventaId: number;
    cambio: number | null;
    cantidad: number;
    montoTotal: number;
  } | null>(null);
  const [qrValues, setQrValues] = useState<string[]>([]);
  const [disponibles, setDisponibles] = useState<number | null>(null);
  const ticketRef = useRef<BoleteriaFisicaTicketRef | null>(null);

  const precioNumerico = useMemo(
    () => Number(precio.replace(/\D/g, "")) || 0,
    [precio],
  );
  const montoTotal = useMemo(
    () => precioNumerico * cantidad,
    [precioNumerico, cantidad],
  );
  const cambio = useMemo(() => {
    if (metodoPago !== MetodoPagoFisico.EFECTIVO) return 0;
    const recibido = Number(billeteRecibido.replace(/\D/g, "")) || 0;
    return Math.max(0, recibido - montoTotal);
  }, [metodoPago, billeteRecibido, montoTotal]);

  useEffect(() => {
    if (!evento?.id) return;
    const eventoId = evento.id;

    setFechaEvento(formatEventDate(evento.fechaEvento));
    setHoraEvento(formatEventTime(evento.fechaEvento));
    setUbicacion(evento.ubicacion || "");
    setPrecio(String(evento.precioBase ?? "20000"));
    setQrValue(`SUAREC-EVT-${evento.id ?? "001"}-TKT-0001`);
    setQrValues([]);
    setResultadoVenta(null);
    setDisponibles(null);

    const cargarDisponibles = async () => {
      try {
        const res =
          await EventsService.contarBoletasFisicasDisponibles(eventoId);
        setDisponibles(res.data.disponibles);
      } catch {
        setDisponibles(null);
      }
    };

    cargarDisponibles();
  }, [evento]);

  const handleGenerarLote = async () => {
    if (!evento?.id) {
      toast.error("No hay un evento seleccionado");
      return;
    }

    const cantidad = Number(cantidadLote);
    if (!cantidad || cantidad < 1) {
      toast.error("Ingresa una cantidad válida para el lote");
      return;
    }

    setGenerandoLote(true);
    try {
      const res = await EventsService.generarLoteFisico(evento.id, {
        cantidad,
      });
      toast.success(
        `Lote generado: ${res.data.generadas} boletas (lote #${res.data.loteId})`,
      );
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Error al generar el lote de boletas físicas",
      );
    } finally {
      setGenerandoLote(false);
    }
  };

  const handleVender = async () => {
    if (!evento?.id) {
      toast.error("No hay un evento seleccionado");
      return;
    }

    if (cantidad < 1) {
      toast.error("La cantidad debe ser al menos 1");
      return;
    }

    if (metodoPago === MetodoPagoFisico.EFECTIVO) {
      const recibido = Number(billeteRecibido.replace(/\D/g, "")) || 0;
      if (recibido < montoTotal) {
        toast.error("El billete recibido no cubre el monto total");
        return;
      }
    }

    setVendiendo(true);
    setResultadoVenta(null);

    try {
      const res = await EventsService.venderBoletasFisicas(evento.id, {
        cantidad,
        metodoPago,
        billeteRecibido:
          metodoPago === MetodoPagoFisico.EFECTIVO
            ? Number(billeteRecibido.replace(/\D/g, "")) || undefined
            : undefined,
      });

      // eslint-disable-next-line no-console
      console.log("[VentaFisicaPanel] venta creada:", res.data);

      const ventaRes = await EventsService.obtenerVentaFisica(res.data.ventaId);

      // eslint-disable-next-line no-console
      console.log("[VentaFisicaPanel] venta con boletas:", ventaRes.data);

      setResultadoVenta({
        ventaId: ventaRes.data.ventaId,
        cambio: ventaRes.data.cambio,
        cantidad: ventaRes.data.cantidad,
        montoTotal: ventaRes.data.montoTotal,
      });
      setQrValues(ventaRes.data.boletas.map((b) => b.qrToken));

      toast.success(`Venta #${res.data.ventaId} confirmada`);
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error("[VentaFisicaPanel] error venta:", error);
      toast.error(
        error.response?.data?.message || "Error al confirmar la venta",
      );
    } finally {
      setVendiendo(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Panel de configuración de la venta */}
      <motion.div
        variants={contentVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit"
      >
        <div className="flex items-center gap-2 mb-5">
          <ShoppingCart className="h-5 w-5 text-[#097EEC]" />
          <h2 className="text-lg font-semibold text-gray-900">
            Datos de la venta
          </h2>
        </div>

        {evento && (
          <div className="mb-5 p-4 bg-blue-50 rounded-xl">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Evento seleccionado
            </p>
            <p className="text-sm font-semibold text-[#097EEC]">
              {evento.nombre}
            </p>
            {disponibles !== null && (
              <p className="mt-1.5 text-xs text-gray-600">
                <span className="font-medium">{disponibles}</span> boletas
                físicas disponibles
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de boleta
            </label>
            <select
              value={tipoBoleta}
              onChange={(e) =>
                setTipoBoleta(e.target.value as "GENERAL" | "VIP")
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm bg-white"
            >
              <option value="GENERAL">GENERAL</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del evento
              </label>
              <input
                type="text"
                value={fechaEvento}
                onChange={(e) => setFechaEvento(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
                placeholder="Domingo, 19 de julio de 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hora del evento
              </label>
              <input
                type="text"
                value={horaEvento}
                onChange={(e) => setHoraEvento(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
                placeholder="6:00 p.m."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
              placeholder="La Herradura, Cauca"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio (COP)
              </label>
              <input
                type="text"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
                placeholder="20000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de compra
            </label>
            <input
              type="text"
              value={fechaCompra}
              onChange={(e) => setFechaCompra(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
              placeholder="14/07/2026"
            />
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMetodoPago(MetodoPagoFisico.EFECTIVO)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  metodoPago === MetodoPagoFisico.EFECTIVO
                    ? "bg-[#097EEC] text-white border-[#097EEC]"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Banknote className="h-4 w-4" />
                Efectivo
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago(MetodoPagoFisico.TRANSFERENCIA)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  metodoPago === MetodoPagoFisico.TRANSFERENCIA
                    ? "bg-[#097EEC] text-white border-[#097EEC]"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <ArrowRightLeft className="h-4 w-4" />
                Transferencia
              </button>
            </div>
          </div>

          {metodoPago === MetodoPagoFisico.EFECTIVO && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billete recibido (COP)
              </label>
              <input
                type="text"
                value={billeteRecibido}
                onChange={(e) => setBilleteRecibido(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
                placeholder="Ej: 100000"
              />
              {cambio > 0 && (
                <p className="mt-1.5 text-sm text-green-600 font-medium">
                  Cambio: {formatCurrency(cambio)}
                </p>
              )}
            </div>
          )}

          {/* Total */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total a pagar
            </p>
            <p className="text-2xl font-bold text-[#097EEC]">
              {formatCurrency(montoTotal)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {cantidad} × {formatCurrency(precioNumerico)}
            </p>
          </div>
        </div>

        {/* Botón confirmar venta */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleVender}
          disabled={vendiendo}
          className="w-full mt-5 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium bg-[#097EEC] text-white hover:bg-[#0766c2] disabled:opacity-60 transition-colors shadow"
        >
          {vendiendo ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          {vendiendo ? "Confirmando..." : "Confirmar venta"}
        </motion.button>

        {/* Generar lote */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Generar / ampliar lote
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={50000}
              value={cantidadLote}
              onChange={(e) => setCantidadLote(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#097EEC] text-sm"
              placeholder="Cantidad"
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerarLote}
              disabled={generandoLote}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              {generandoLote ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              Generar
            </motion.button>
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            Crea boletas físicas disponibles para este evento.
          </p>
        </div>
      </motion.div>

      {/* Vista previa del ticket */}
      <motion.div
        variants={contentVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3, delay: 0.1, ease: "easeInOut" }}
        className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center"
      >
        <div className="w-full flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Vista previa del ticket
          </h2>

          {onBack ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </motion.button>
          ) : (
            <Link href="/admin/boleteria_fisica" passHref>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </motion.button>
            </Link>
          )}
        </div>

        {resultadoVenta && (
          <div className="w-full mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">
                  Venta #{resultadoVenta.ventaId} confirmada
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  {resultadoVenta.cantidad} boleta(s) vendida(s) por{" "}
                  {formatCurrency(resultadoVenta.montoTotal)}
                </p>
                {resultadoVenta.cambio !== null &&
                  resultadoVenta.cambio > 0 && (
                    <p className="text-xs text-green-700 mt-0.5">
                      Cambio: {formatCurrency(resultadoVenta.cambio)}
                    </p>
                  )}
                <p className="text-xs text-green-600 mt-2">
                  QR listos para imprimir. Escanea el código en la entrada para
                  validar el acceso.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de impresión */}
        <div className="w-full flex justify-end gap-3 mb-4">
          <button
            type="button"
            onClick={() => ticketRef.current?.handlePrint()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[#097EEC] text-white hover:bg-[#0766c2] transition-colors shadow"
          >
            <Printer className="h-4 w-4" />
            Imprimir {qrValues.length || cantidad} ticket
            {(qrValues.length || cantidad) > 1 ? "s" : ""}
          </button>

          <button
            type="button"
            onClick={() => ticketRef.current?.handleAgentPrint()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow"
          >
            <Usb className="h-4 w-4" />
            Imprimir vía agente local
          </button>
        </div>

        <BoleteriaFisicaTicket
          ref={ticketRef}
          qrValue={qrValue}
          qrValues={qrValues.length > 0 ? qrValues : undefined}
          tipoBoleta={tipoBoleta}
          precio={precio}
          fechaCompra={fechaCompra}
          cantidad={cantidad}
          esPreview
          evento={{
            nombre: evento?.nombre,
            fecha: fechaEvento,
            hora: horaEvento,
            lugar: ubicacion,
          }}
        />
      </motion.div>
    </div>
  );
};

export default VentaFisicaPanel;
