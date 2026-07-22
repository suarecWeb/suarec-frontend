"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── DatePicker global SUAREC ──────────────────────────────────────────────────
// Calendario propio (sin input nativo del navegador) con selección por día.
// Trabaja siempre con strings "YYYY-MM-DD" — nunca objetos Date serializados a
// UTC, para que la fecha elegida no se corra un día por zona horaria.

interface DatePickerProps {
  value: string; // "YYYY-MM-DD" o "" (sin fecha)
  onChange: (value: string) => void; // eslint-disable-line no-unused-vars
  allowClear?: boolean;
  className?: string;
  placeholder?: string;
}

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DIAS_SEMANA = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

// "YYYY-MM-DD" de hoy en hora Colombia (en-CA formatea exactamente YYYY-MM-DD)
export const hoyColombia = (): string =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

const aYmd = (anio: number, mes: number, dia: number): string =>
  `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

const formatCorta = (ymd: string): string => {
  const d = new Date(`${ymd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const DatePicker = ({
  value,
  onChange,
  allowClear = false,
  className = "",
  placeholder = "Seleccionar fecha",
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  const hoy = hoyColombia();

  // Mes visible en el calendario: arranca en la fecha elegida, o en el mes actual
  const [vista, setVista] = useState<{ anio: number; mes: number }>(() => {
    const base = value || hoy;
    return {
      anio: Number(base.slice(0, 4)),
      mes: Number(base.slice(5, 7)) - 1,
    };
  });

  // Al abrir, re-centrar la vista en la fecha seleccionada (o en hoy)
  useEffect(() => {
    if (!open) return;
    const base = value || hoy;
    setVista({
      anio: Number(base.slice(0, 4)),
      mes: Number(base.slice(5, 7)) - 1,
    });
  }, [open, value, hoy]);

  // Cerrar con clic afuera o Escape
  useEffect(() => {
    if (!open) return;
    const onClickAfuera = (e: MouseEvent) => {
      if (!contenedorRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickAfuera);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickAfuera);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const cambiarMes = (delta: number) => {
    setVista((v) => {
      const mes = v.mes + delta;
      if (mes < 0) return { anio: v.anio - 1, mes: 11 };
      if (mes > 11) return { anio: v.anio + 1, mes: 0 };
      return { anio: v.anio, mes };
    });
  };

  // Celdas del mes visible: huecos iniciales (semana empieza en lunes) + días
  const celdas = useMemo(() => {
    const primerDia = new Date(vista.anio, vista.mes, 1);
    const totalDias = new Date(vista.anio, vista.mes + 1, 0).getDate();
    // getDay(): 0=domingo... trasladado a lunes=0
    const huecos = (primerDia.getDay() + 6) % 7;
    return [
      ...Array.from({ length: huecos }, () => null),
      ...Array.from({ length: totalDias }, (_, i) => i + 1),
    ];
  }, [vista]);

  const seleccionar = (dia: number) => {
    onChange(aYmd(vista.anio, vista.mes, dia));
    setOpen(false);
  };

  return (
    <div ref={contenedorRef} className={`relative ${className}`}>
      {/* Trigger */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex items-center gap-2 py-2 text-sm border rounded-xl transition-all ${
            value
              ? "pl-3 pr-2 border-[#097EEC] bg-blue-50/50 text-gray-700"
              : "px-3 border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          <CalendarDays
            className={`h-4 w-4 flex-shrink-0 ${value ? "text-[#097EEC]" : "text-gray-400"}`}
          />
          <span className="whitespace-nowrap">
            {value ? formatCorta(value) : placeholder}
          </span>
        </button>
        {allowClear && value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="ml-1 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Quitar fecha"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Popover calendario */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4"
          >
            {/* Header: mes + navegación */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => cambiarMes(-1)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <p className="text-sm font-semibold text-gray-800">
                {MESES[vista.mes]} {vista.anio}
              </p>
              <button
                type="button"
                onClick={() => cambiarMes(1)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 mb-1">
              {DIAS_SEMANA.map((d) => (
                <span
                  key={d}
                  className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-1"
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Grilla de días */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {celdas.map((dia, i) => {
                if (dia === null) return <span key={`hueco-${i}`} />;
                const ymd = aYmd(vista.anio, vista.mes, dia);
                const esSeleccionado = ymd === value;
                const esHoy = ymd === hoy;
                return (
                  <button
                    key={ymd}
                    type="button"
                    onClick={() => seleccionar(dia)}
                    className={`h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                      esSeleccionado
                        ? "bg-[#097EEC] text-white shadow-sm"
                        : esHoy
                          ? "text-[#097EEC] ring-1 ring-inset ring-[#097EEC]/40 hover:bg-blue-50"
                          : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>

            {/* Footer: hoy / limpiar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  onChange(hoy);
                  setOpen(false);
                }}
                className="text-xs font-medium text-[#097EEC] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Hoy
              </button>
              {allowClear && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;
