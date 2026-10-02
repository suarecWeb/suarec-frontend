"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  History,
  MapPin,
  MapPinOff,
} from "lucide-react";
import { formatDisplayDate } from "@/lib/TimeZone";
import VistaPreviaRecinto from "../recintos/vista-previa/VistaPreviaRecinto";
import { FiguraEditor, figurasDelRecinto } from "../recintos/editor/figuras";
import { buscarEventoDePrueba } from "./datosDePrueba";
import {
  ESTADOS_PALCO,
  ESTILO_ESTADO,
  EventoConPalcos,
  contarEstados,
  esPasado,
  estadoDe,
} from "./estadosPalco";
import ContadoresPalcos from "./ContadoresPalcos";
import EstadoEventoBadge from "./EstadoEventoBadge";
import PanelPalco from "./PanelPalco";
import AvisoDatosDePrueba from "./AvisoDatosDePrueba";
import { rutaPalcosEvento } from "./PalcosPorFeria";
import { useZoomMapa } from "./useZoomMapa";
import ControlesZoom from "./ControlesZoom";

export const RUTA_TAB_PALCOS = "/admin/boleteria/ferias?tab=gestion-palcos";

// Los palcos de UN evento: el recinto de su feria con cada palco pintado
// segun lo que paso con el EN ESTE EVENTO (libre, en compra, apartado,
// vendido). Al tocar un palco se ve su detalle. Solo para mirar: apartar,
// liberar y descargar boletas son de la fase 7
export default function PalcosEvento({
  eventoId,
  palcoInicial = null,
}: {
  eventoId: number;
  // El palco elegido viaja en la direccion (?palco=) al pasar a otro
  // evento de la feria (es el mismo recinto): asi se compara, ej. Palco 3
  // vendido el viernes y libre el sabado (CA-11)
  palcoInicial?: number | null;
}) {
  const encontrado = buscarEventoDePrueba(eventoId);
  const [palcoId, setPalcoId] = useState<number | null>(palcoInicial);

  if (!encontrado) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-base font-semibold text-gray-700">
          Evento no encontrado
        </h2>
        <Link
          href={RUTA_TAB_PALCOS}
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#097EEC] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Gestión de palcos
        </Link>
      </div>
    );
  }

  return (
    <ContenidoEvento
      evento={encontrado.evento}
      deLaFeria={encontrado.deLaFeria}
      palcoId={palcoId}
      onElegirPalco={setPalcoId}
    />
  );
}

interface ContenidoEventoProps {
  evento: EventoConPalcos;
  deLaFeria: EventoConPalcos[];
  palcoId: number | null;
  onElegirPalco: (id: number) => void;
}

function ContenidoEvento({
  evento,
  deLaFeria,
  palcoId,
  onElegirPalco,
}: ContenidoEventoProps) {
  const pasado = esPasado(evento);
  const { recinto } = evento;

  // Anterior y siguiente evento de la misma feria, por fecha
  const ordenados = [...deLaFeria].sort(
    (a, b) =>
      new Date(a.fechaEvento).getTime() - new Date(b.fechaEvento).getTime(),
  );
  const posicion = ordenados.findIndex((e) => e.id === evento.id);
  const anterior = ordenados[posicion - 1];
  const siguiente = ordenados[posicion + 1];

  const figuras = useMemo(
    () => (recinto ? figurasDelRecinto(recinto) : []),
    [recinto],
  );
  const palco: FiguraEditor | null =
    figuras.find((f) => f.id === palcoId && f.tipo === "PALCO") ?? null;
  const estadoPalco = palco ? estadoDe(evento, palco.id as number) : "LIBRE";

  const estiloDePalco = useCallback(
    (f: FiguraEditor) => {
      const estilo = ESTILO_ESTADO[estadoDe(evento, f.id as number)];
      return {
        color: estilo.color,
        marca: estilo.marca,
        descripcion: `${f.nombre}, ${estilo.etiqueta.toLowerCase()}`,
      };
    },
    [evento],
  );
  const elegir = useCallback(
    (f: FiguraEditor) => f.id !== undefined && onElegirPalco(f.id),
    [onElegirPalco],
  );

  // Acercar, alejar y mover el mapa
  const mapaRef = useRef<HTMLDivElement>(null);
  const zoom = useZoomMapa(mapaRef, {
    ancho: recinto?.lienzoAncho ?? 1,
    alto: recinto?.lienzoAlto ?? 1,
  });

  return (
    <div className="flex flex-col gap-5">
      <AvisoDatosDePrueba />

      {/* Evento: feria, recinto, fecha y estado + anterior/siguiente */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              {evento.nombre}
            </h2>
            <EstadoEventoBadge estado={evento.estado} />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {formatDisplayDate(evento.fechaEvento)} · {evento.feria.nombre}
            {recinto && (
              <span className="inline-flex items-center gap-1 ml-2">
                <MapPin className="h-3.5 w-3.5" />
                {recinto.nombre}
              </span>
            )}
          </p>
        </div>
        <nav
          aria-label="Otros eventos de la feria"
          className="flex items-center gap-2 flex-shrink-0"
        >
          <NavegarEvento
            evento={anterior}
            direccion="anterior"
            palcoId={palcoId}
          />
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {posicion + 1} de {ordenados.length}
          </span>
          <NavegarEvento
            evento={siguiente}
            direccion="siguiente"
            palcoId={palcoId}
          />
        </nav>
      </div>

      {pasado && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <History className="h-4 w-4 flex-shrink-0" />
          Este evento ya pasó: el mapa queda como historial de lo que se vendió.
        </div>
      )}

      {!recinto ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-gray-200">
          <MapPinOff className="mx-auto h-8 w-8 text-gray-300" />
          <h3 className="mt-3 text-base font-semibold text-gray-700">
            La feria no tiene recinto asignado
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Asígnale uno en &quot;Editar feria&quot; para ver y vender sus
            palcos.
          </p>
        </div>
      ) : (
        <>
          <ContadoresPalcos {...contarEstados(evento)} />

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-0 flex flex-col gap-3">
              {/* Sin acercar, un dedo sigue bajando la pagina (pan-y) y
                  dos dedos acercan; ya acercado, un dedo mueve el mapa */}
              <div
                ref={mapaRef}
                {...zoom.eventos}
                style={{ touchAction: zoom.zoom > 1 ? "none" : "pan-y" }}
                className={`relative rounded-xl border border-gray-200 bg-gray-50 p-3 overflow-hidden select-none ${
                  zoom.zoom > 1
                    ? zoom.arrastrando
                      ? "cursor-grabbing"
                      : "cursor-grab"
                    : ""
                }`}
              >
                <VistaPreviaRecinto
                  recinto={recinto}
                  estiloDePalco={estiloDePalco}
                  onElegirPalco={elegir}
                  palcoElegidoId={palcoId}
                  vista={zoom.vista}
                  className="w-full h-auto lg:h-[520px]"
                />
                <ControlesZoom
                  zoom={zoom.zoom}
                  puedeAcercar={zoom.puedeAcercar}
                  puedeAlejar={zoom.puedeAlejar}
                  onAcercar={zoom.acercar}
                  onAlejar={zoom.alejar}
                  onAjustar={zoom.ajustar}
                />
              </div>
              <p className="-mt-1 text-[11px] text-gray-400">
                <span className="hidden sm:inline">
                  Ctrl + rueda del mouse (o pellizca en el trackpad) para
                  acercar; con el mapa acercado, arrástralo para moverte.
                </span>
                <span className="sm:hidden">
                  Pellizca con dos dedos para acercar; con el mapa acercado,
                  arrástralo para moverte.
                </span>
              </p>
              <Leyenda />
            </div>
            <PanelPalco
              evento={evento}
              palco={palco}
              estado={estadoPalco}
              ocupado={palco ? evento.palcos[palco.id as number] : undefined}
              pasado={pasado}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Leyenda() {
  return (
    <ul
      aria-label="Leyenda"
      className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500"
    >
      {ESTADOS_PALCO.map((estado) => {
        const { etiqueta, color, marca } = ESTILO_ESTADO[estado];
        return (
          <li key={estado} className="inline-flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ background: color }}
            />
            {marca && <span aria-hidden>{marca}</span>}
            {etiqueta}
          </li>
        );
      })}
      <li className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-sm border border-dashed border-gray-400 bg-gray-200" />
        Referencias (tarima, zonas): no se tocan
      </li>
    </ul>
  );
}

function NavegarEvento({
  evento,
  direccion,
  palcoId,
}: {
  evento?: EventoConPalcos;
  direccion: "anterior" | "siguiente";
  palcoId: number | null;
}) {
  const Icono = direccion === "anterior" ? ChevronLeft : ChevronRight;
  const titulo =
    direccion === "anterior" ? "Evento anterior" : "Evento siguiente";
  const clases =
    "h-8 w-8 rounded-lg border inline-flex items-center justify-center transition-colors";

  if (!evento) {
    return (
      <span
        aria-disabled
        title={`No hay ${titulo.toLowerCase()}`}
        className={`${clases} border-gray-100 text-gray-300`}
      >
        <Icono className="h-4 w-4" />
      </span>
    );
  }
  return (
    <Link
      href={`${rutaPalcosEvento(evento.id)}${palcoId ? `?palco=${palcoId}` : ""}`}
      aria-label={`${titulo}: ${evento.nombre}`}
      title={`${titulo}: ${evento.nombre}`}
      className={`${clases} border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#097EEC]`}
    >
      <Icono className="h-4 w-4" />
    </Link>
  );
}
