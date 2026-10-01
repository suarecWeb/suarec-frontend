"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Loader2,
  MapPinOff,
} from "lucide-react";
import { Recinto } from "@/interfaces/recinto.interface";
import VistaPreviaRecinto from "@/components/admin/boleteria/recintos/vista-previa/VistaPreviaRecinto";
import { DetalleRecinto, useRecintosCarrusel } from "./useRecintosCarrusel";

interface SelectorRecintoProps {
  // Lo elegido en el formulario; null = sin recinto
  valor: number | null;
  // Lo que la feria tiene guardado hoy (al crear, null)
  asignadoId: number | null;
  onCambiar: (recintoId: number | null) => void;
  // Mas bajo, para cuando comparte la columna con otra seccion (crear
  // feria: debajo van los eventos para arrastrar)
  compacto?: boolean;
}

// Con mas recintos que esto, los puntos no caben: queda solo "2 / 30"
const MAXIMO_PUNTOS = 12;

// Deslizar hacia el lado de la flecha, como al elegir pista en un juego
const deslizar = {
  entra: (direccion: number) => ({ x: direccion * 48, opacity: 0 }),
  quieto: { x: 0, opacity: 1 },
  sale: (direccion: number) => ({ x: direccion * -48, opacity: 0 }),
};

// Columna derecha del formulario de la feria: elegir su recinto (RN-13)
// como un selector de mapa de videojuego. Se ve el dibujo del recinto
// (solo para mirar) y las flechas pasan al anterior o al siguiente; lo que
// se ve es lo que queda elegido. La primera tarjeta es "Sin recinto"
export default function SelectorRecinto({
  valor,
  asignadoId,
  onCambiar,
  compacto = false,
}: SelectorRecintoProps) {
  const { opciones, error, detalles, precargar } =
    useRecintosCarrusel(asignadoId);
  const [direccion, setDireccion] = useState(0);

  const tarjetas = useMemo<(Recinto | null)[]>(
    () => (opciones ? [null, ...opciones] : []),
    [opciones],
  );
  const total = tarjetas.length;
  const indice = Math.max(
    0,
    tarjetas.findIndex((t) => (t?.id ?? null) === valor),
  );
  const actual = tarjetas[indice] ?? null;

  // El visible y sus dos vecinos: la flecha cambia el mapa sin esperar
  useEffect(() => {
    if (total === 0) return;
    const ids = [indice - 1, indice, indice + 1]
      .map((i) => tarjetas[(i + total) % total]?.id)
      .filter((id): id is number => id !== undefined);
    precargar(ids);
  }, [tarjetas, total, indice, precargar]);

  const irA = (nuevo: number, paso: number) => {
    if (total <= 1) return;
    setDireccion(paso);
    onCambiar(tarjetas[(nuevo + total) % total]?.id ?? null);
  };
  const anterior = () => irA(indice - 1, -1);
  const siguiente = () => irA(indice + 1, 1);

  const cargando = opciones === null && !error;
  const sinFlechas = cargando || error || total <= 1;
  const cambia = asignadoId !== null && valor !== asignadoId;

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 ${
        compacto ? "" : "min-h-[520px]"
      }`}
    >
      <div>
        <p className="text-xs font-medium text-gray-600">
          <LayoutGrid className="h-3 w-3 inline mr-1" />
          Recinto
        </p>
        <p className="mt-1 text-[11px] text-gray-400">
          Todos los eventos con palcos de esta feria usan el mapa de este
          recinto. Usa las flechas para cambiarlo; solo se ofrecen recintos
          activos.
        </p>
      </div>

      <div
        className="flex-1 flex items-stretch gap-3"
        // Con el foco en el selector, las flechas del teclado tambien sirven
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") anterior();
          if (e.key === "ArrowRight") siguiente();
        }}
      >
        <BotonFlecha
          lado="anterior"
          onClick={anterior}
          deshabilitado={sinFlechas}
        />

        <div
          tabIndex={0}
          aria-roledescription="carrusel"
          aria-label="Recinto de la feria"
          className={`relative flex-1 ${
            compacto ? "min-h-[260px]" : "min-h-[340px]"
          } rounded-xl border border-gray-200 bg-gray-100 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#097EEC]/40`}
        >
          {cargando ? (
            <Centro>
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <p className="text-xs text-gray-400">Cargando recintos...</p>
            </Centro>
          ) : error ? (
            // Sin la lista no se puede cambiar; al guardar se conserva el
            // recinto que la feria ya tenia
            <Centro>
              <p className="text-sm text-red-600">
                No se pudieron cargar los recintos.
              </p>
              <p className="text-xs text-gray-400">
                El recinto actual se conserva.
              </p>
            </Centro>
          ) : (
            <AnimatePresence initial={false} custom={direccion} mode="wait">
              <motion.div
                key={actual?.id ?? "sin-recinto"}
                custom={direccion}
                variants={deslizar}
                initial="entra"
                animate="quieto"
                exit="sale"
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Tarjeta
                  recinto={actual}
                  detalle={actual ? detalles[actual.id] : undefined}
                  esElAsignado={actual !== null && actual.id === asignadoId}
                  hayRecintos={total > 1}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <BotonFlecha
          lado="siguiente"
          onClick={siguiente}
          deshabilitado={sinFlechas}
        />
      </div>

      {!cargando && !error && (
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-800">
            {actual?.nombre ?? "Sin recinto"}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {resumen(actual, actual ? detalles[actual.id] : undefined)}
          </p>
          {total > 1 && (
            <div className="mt-2 flex items-center justify-center gap-2">
              {total <= MAXIMO_PUNTOS && (
                <div className="flex gap-1.5">
                  {tarjetas.map((t, i) => (
                    <button
                      key={t?.id ?? "sin-recinto"}
                      type="button"
                      onClick={() => irA(i, i > indice ? 1 : -1)}
                      aria-label={`Ver ${t?.nombre ?? "Sin recinto"}`}
                      aria-current={i === indice}
                      className={`h-2 rounded-full transition-all ${
                        i === indice
                          ? "w-5 bg-[#097EEC]"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
              <span className="text-[11px] text-gray-400 tabular-nums">
                {indice + 1} / {total}
              </span>
            </div>
          )}
        </div>
      )}

      {cambia && (
        <p className="text-[11px] text-amber-700 text-center">
          {valor === null
            ? "Al guardar se quita el recinto de la feria."
            : "Al guardar se cambia el recinto de la feria."}{" "}
          Si ya hay palcos reservados o vendidos, se pedirá confirmación.
        </p>
      )}
    </div>
  );
}

// "24 palcos · 1 referencia · lienzo 1000 × 600" (los conteos, cuando
// ya llego el dibujo)
const resumen = (recinto: Recinto | null, detalle?: DetalleRecinto) => {
  if (!recinto) return "La feria queda sin mapa de palcos";
  const lienzo = `lienzo ${recinto.lienzoAncho} × ${recinto.lienzoAlto}`;
  if (!detalle || detalle === "error") return lienzo;
  const figuras = detalle.figuras ?? [];
  const palcos = figuras.filter((f) => f.tipo === "PALCO").length;
  const referencias = figuras.length - palcos;
  return [
    `${palcos} ${palcos === 1 ? "palco" : "palcos"}`,
    `${referencias} ${referencias === 1 ? "referencia" : "referencias"}`,
    lienzo,
  ].join(" · ");
};

function Tarjeta({
  recinto,
  detalle,
  esElAsignado,
  hayRecintos,
}: {
  recinto: Recinto | null;
  detalle?: DetalleRecinto;
  esElAsignado: boolean;
  hayRecintos: boolean;
}) {
  if (!recinto) {
    return (
      <Centro>
        <MapPinOff className="h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">Sin recinto</p>
        <p className="text-xs text-gray-400">
          {hayRecintos
            ? "Usa las flechas para elegir uno"
            : "Aún no hay recintos activos. Créalos en Boletería → Recintos"}
        </p>
      </Centro>
    );
  }

  return (
    <>
      {detalle === undefined ? (
        <Centro>
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          <p className="text-xs text-gray-400">Cargando mapa...</p>
        </Centro>
      ) : detalle === "error" ? (
        <Centro>
          <p className="text-sm text-red-600">
            No se pudo cargar el mapa de este recinto.
          </p>
          <p className="text-xs text-gray-400">Igual se puede elegir.</p>
        </Centro>
      ) : (
        <VistaPreviaRecinto
          recinto={detalle}
          className="absolute inset-0 w-full h-full p-4"
        />
      )}

      <div className="absolute top-2 left-2 flex gap-1.5">
        {esElAsignado && (
          <span className="px-2 py-0.5 rounded-full bg-[#097EEC] text-white text-[10px] font-semibold">
            Actual
          </span>
        )}
        {!recinto.activo && (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
            Desactivado
          </span>
        )}
      </div>
    </>
  );
}

function Centro({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
      {children}
    </div>
  );
}

function BotonFlecha({
  lado,
  onClick,
  deshabilitado,
}: {
  lado: "anterior" | "siguiente";
  onClick: () => void;
  deshabilitado: boolean;
}) {
  const Icono = lado === "anterior" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      aria-label={
        lado === "anterior" ? "Recinto anterior" : "Recinto siguiente"
      }
      className="self-center flex-shrink-0 h-12 w-12 rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm inline-flex items-center justify-center hover:border-[#097EEC] hover:text-[#097EEC] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-all"
    >
      <Icono className="h-6 w-6" />
    </button>
  );
}
