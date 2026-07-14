"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Evento } from "@/interfaces/event.interface";
import { BoleteriaFisicaTicket } from "@/components/admin/BoleteriaFisicaTicket";
import { Printer, ArrowLeft, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

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

  useEffect(() => {
    if (!evento) return;

    setFechaEvento(formatEventDate(evento.fechaEvento));
    setHoraEvento(formatEventTime(evento.fechaEvento));
    setUbicacion(evento.ubicacion || "");
    setPrecio(String(evento.precioBase ?? "20000"));
    setQrValue(`SUAREC-EVT-${evento.id ?? "001"}-TKT-0001`);
  }, [evento]);

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
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-gray-700">
          <p className="font-medium text-[#097EEC] mb-1">Nota</p>
          <p>
            Estos datos son solo para la vista previa. En el flujo real se
            generarán automáticamente desde el backend.
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

        <BoleteriaFisicaTicket
          qrValue={qrValue}
          tipoBoleta={tipoBoleta}
          precio={precio}
          fechaCompra={fechaCompra}
          cantidad={cantidad}
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
