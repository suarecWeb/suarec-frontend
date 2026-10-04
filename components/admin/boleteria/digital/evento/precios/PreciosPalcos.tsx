"use client";

import { PointerEvent, useMemo, useRef } from "react";
import { Recinto } from "@/interfaces/recinto.interface";
import { formatCurrency } from "@/lib/formatCurrency";
import VistaPreviaRecinto from "../../../recintos/vista-previa/VistaPreviaRecinto";
import {
  FiguraEditor,
  figurasDelRecinto,
} from "../../../recintos/editor/figuras";
import { useZoomMapa } from "../../../palcos/useZoomMapa";
import ControlesZoom from "../../../palcos/ControlesZoom";
import { PreciosPalcosEstado } from "../hooks/usePreciosPalcos";
import { Palco, useSeleccionPalcos } from "./useSeleccionPalcos";
import PanelPrecio from "./PanelPrecio";
import ResumenPrecios, { Grupo } from "./ResumenPrecios";
import LeyendaPrecios from "./LeyendaPrecios";

// Base en gris; cada precio propio con un color (del más caro al más barato)
const COLOR_BASE = "#e5e7eb";
const COLORES = [
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

// 4 · Precios de los palcos de ESTE evento, sobre el mapa. Une las piezas:
// selección (useSeleccionPalcos), panel de precio, resumen y leyenda
export default function PreciosPalcos({
  recinto,
  precioBase,
  estado,
}: {
  recinto: Recinto;
  precioBase?: number;
  estado: PreciosPalcosEstado;
}) {
  const { precios, asignar, volverAlBase, vendidos } = estado;
  const palcos = useMemo(
    () =>
      figurasDelRecinto(recinto).filter(
        (f): f is Palco => f.tipo === "PALCO" && f.id !== undefined,
      ),
    [recinto],
  );
  const seleccion = useSeleccionPalcos(palcos);
  const { elegidos } = seleccion;

  // Resumen: primero el base, luego los propios del más caro al más barato
  const grupos = useMemo<Grupo[]>(() => {
    const porPrecio = new Map<number, number[]>();
    const base: number[] = [];
    palcos.forEach(({ id }) => {
      const propio = precios.get(id);
      if (propio === undefined) base.push(id);
      else porPrecio.set(propio, [...(porPrecio.get(propio) ?? []), id]);
    });
    const propios = Array.from(porPrecio.entries())
      .sort(([a], [b]) => b - a)
      .map(([precio, ids], i) => ({
        precio,
        propio: true,
        color: COLORES[i % COLORES.length],
        ids,
      }));
    return base.length > 0
      ? [
          { precio: precioBase, propio: false, color: COLOR_BASE, ids: base },
          ...propios,
        ]
      : propios;
  }, [palcos, precios, precioBase]);

  const grupoDe = useMemo(() => {
    const m = new Map<number, Grupo>();
    grupos.forEach((g) => g.ids.forEach((id) => m.set(id, g)));
    return m;
  }, [grupos]);

  const estiloDePalco = (f: FiguraEditor) => {
    const g = f.id !== undefined ? grupoDe.get(f.id) : undefined;
    const precio = g?.precio;
    const vendido = f.id !== undefined && vendidos.has(f.id);
    return {
      color: g?.color ?? COLOR_BASE,
      marca: vendido ? "✓" : undefined,
      detalle:
        precio !== undefined ? formatCurrency(precio, { compact: true }) : "—",
      descripcion: `${f.nombre}, ${
        precio !== undefined ? formatCurrency(precio) : "sin precio"
      }${g?.propio ? " (precio propio)" : ""}${vendido ? ", vendido" : ""}`,
    };
  };

  const conPrecioPropio = Array.from(elegidos).filter((id) => precios.has(id));
  const listaVendidos = palcos
    .filter((p) => vendidos.has(p.id))
    .map((p) => ({
      id: p.id,
      nombre: p.nombre,
      monto: vendidos.get(p.id) ?? null,
    }));

  // Mapa: acercar con botones o Ctrl + rueda. Arrastrar con el mouse dibuja
  // el recuadro, así que mover el mapa arrastrando queda solo para el dedo
  const mapaRef = useRef<HTMLDivElement>(null);
  const zoom = useZoomMapa(mapaRef, {
    ancho: recinto.lienzoAncho,
    alto: recinto.lienzoAlto,
  });
  const soloTactil =
    (fn: (e: PointerEvent<HTMLElement>) => void) =>
    (e: PointerEvent<HTMLElement>) => {
      if (e.pointerType !== "mouse") fn(e);
    };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            4 · Precios de los palcos
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Elige palcos en el mapa (clic, Shift + clic o arrastrando un
            recuadro)
          </p>
        </div>
        <ControlesZoom
          enLinea
          zoom={zoom.zoom}
          puedeAcercar={zoom.puedeAcercar}
          puedeAlejar={zoom.puedeAlejar}
          onAcercar={zoom.acercar}
          onAlejar={zoom.alejar}
          onAjustar={zoom.ajustar}
        />
      </div>

      <div className="mt-4 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <div
            ref={mapaRef}
            onPointerDown={soloTactil(zoom.eventos.onPointerDown)}
            onPointerMove={soloTactil(zoom.eventos.onPointerMove)}
            onPointerUp={soloTactil(zoom.eventos.onPointerUp)}
            onPointerCancel={soloTactil(zoom.eventos.onPointerCancel)}
            onClickCapture={zoom.eventos.onClickCapture}
            style={{ touchAction: zoom.zoom > 1 ? "none" : "pan-y" }}
            className="rounded-xl border border-gray-200 bg-gray-50 p-3 overflow-hidden select-none"
          >
            <VistaPreviaRecinto
              recinto={recinto}
              estiloDePalco={estiloDePalco}
              onElegirPalco={seleccion.elegirPalco}
              elegidos={elegidos}
              onRecuadro={seleccion.elegirEnZona}
              onClicFondo={seleccion.limpiar}
              vista={zoom.vista}
              className="w-full h-auto lg:h-[480px]"
            />
          </div>
          <LeyendaPrecios
            colorBase={COLOR_BASE}
            colorPropio={COLORES[0]}
            conVendidos={listaVendidos.length > 0}
          />
        </div>

        <div className="lg:w-72 flex-shrink-0 space-y-3">
          <PanelPrecio
            cantidad={elegidos.size}
            conPrecioPropio={conPrecioPropio.length}
            onTodos={seleccion.elegirTodos}
            onNinguno={seleccion.limpiar}
            onAplicar={(precio) => {
              asignar(Array.from(elegidos), precio);
              seleccion.limpiar();
            }}
            onVolverAlBase={() => {
              volverAlBase(conPrecioPropio);
              seleccion.limpiar();
            }}
          />
          <ResumenPrecios
            grupos={grupos}
            vendidos={listaVendidos}
            onElegirGrupo={seleccion.elegirVarios}
          />
        </div>
      </div>
    </div>
  );
}
