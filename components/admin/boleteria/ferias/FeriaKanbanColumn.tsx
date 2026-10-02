"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CalendarDays, Edit, Eye, EyeOff, Ticket } from "lucide-react";
import { Feria } from "@/interfaces/feria.interface";
import { Evento } from "@/interfaces/event.interface";
import EventKanbanTicket from "@/components/admin/boleteria/ferias/eventos/EventKanbanTicket";
import { formatDisplayDate } from "@/lib/TimeZone";

interface FeriaKanbanColumnProps {
  feria: Feria;
  // Ya filtrados a los digitales de ESTA feria -- el padre decide el filtro,
  // la columna solo pinta lo que le llega.
  eventos: Evento[];
  onToggleVisibility: (feria: Feria) => void;
  // Se dispara al soltar un evento arrastrado desde OTRA columna sobre esta.
  // El padre decide si hace falta llamar al backend (puede venir de la misma
  // feria, ver nota en FeriasManagement).
  onDropEvento: (eventoId: number, feriaId: number) => void;
}

// Una feria como columna de tablero: imagen colapsable arriba, eventos
// (digitales) apilados debajo, zona completa receptora de drag-and-drop
// nativo (mismo mecanismo que ya usa CreateFeriaModal/EventosParaAsignar --
// dataTransfer con el id del evento, sin librería).
export default function FeriaKanbanColumn({
  feria,
  eventos,
  onToggleVisibility,
  onDropEvento,
}: FeriaKanbanColumnProps) {
  const router = useRouter();
  // Arranca colapsada -- aparece al pasar el mouse por el header, se
  // esconde de nuevo al sacarlo (reemplaza el botón de antes).
  const [colapsada, setColapsada] = useState(true);
  const [sobreArrastre, setSobreArrastre] = useState(false);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const [imgHeight, setImgHeight] = useState(0);

  useLayoutEffect(() => {
    if (imgWrapRef.current) setImgHeight(imgWrapRef.current.offsetHeight);
  }, []);

  return (
    <div
      className={`flex-shrink-0 w-72 rounded-xl border bg-gray-50/60 flex flex-col max-h-[calc(100vh-220px)] transition-colors ${
        sobreArrastre ? "border-[#097EEC] bg-[#097EEC]/5" : "border-gray-200"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setSobreArrastre(true);
      }}
      onDragLeave={() => setSobreArrastre(false)}
      onDrop={(e) => {
        e.preventDefault();
        setSobreArrastre(false);
        const eventoId = Number(e.dataTransfer.getData("text/plain"));
        if (eventoId) onDropEvento(eventoId, feria.id);
      }}
    >
      {/* Header: imagen colapsable (altura medida y animada, igual técnica
        que el Stepper de referencia) + nombre + acciones. Hover en vez de
        botón: pasar el mouse por el header la muestra, sacarlo la esconde. */}
      <div
        className="p-3 border-b border-gray-200 bg-white rounded-t-xl"
        onMouseEnter={() => setColapsada(false)}
        onMouseLeave={() => setColapsada(true)}
      >
        <motion.div
          animate={{ height: colapsada ? 0 : imgHeight }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ overflow: "hidden" }}
        >
          <div
            ref={imgWrapRef}
            className="relative rounded-lg overflow-hidden mb-2"
          >
            {feria.imagenUrl ? (
              <img
                src={feria.imagenUrl}
                alt={feria.nombre}
                className={`w-full h-28 object-cover ${feria.visible === false ? "grayscale" : ""}`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-28 bg-emerald-50 flex items-center justify-center">
                <CalendarDays className="h-8 w-8 text-emerald-300" />
              </div>
            )}
            {feria.visible === false && (
              <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-800/70 text-white flex items-center gap-1">
                <EyeOff className="h-3 w-3" /> Oculta
              </span>
            )}
          </div>
        </motion.div>

        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {feria.nombre}
            </p>
            <p className="text-[11px] text-gray-400">
              {formatDisplayDate(feria.fechaInicio)} —{" "}
              {formatDisplayDate(feria.fechaFin)}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => onToggleVisibility(feria)}
              title={
                feria.visible === false ? "Mostrar en app" : "Ocultar de app"
              }
              className="h-7 w-7 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-colors"
            >
              {feria.visible === false ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/admin/boleteria/ferias/${feria.id}`)}
              title="Editar feria"
              className="h-7 w-7 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center justify-center transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Zona receptora: los eventos digitales de esta feria, arrastrables
        hacia otra columna */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4 min-h-[120px]">
        {eventos.length === 0 ? (
          <div className="text-center py-10 text-gray-300">
            <Ticket className="h-7 w-7 mx-auto mb-1.5" />
            <p className="text-[11px] text-gray-400">
              {sobreArrastre
                ? "Suelta aquí para asignar"
                : "Sin eventos digitales"}
            </p>
          </div>
        ) : (
          eventos.map((evento) => (
            <div
              key={evento.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(evento.id));
                e.dataTransfer.effectAllowed = "move";
              }}
              className="cursor-grab active:cursor-grabbing"
            >
              <EventKanbanTicket event={evento} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
