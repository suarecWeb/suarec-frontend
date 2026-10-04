"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  History,
  MapPin,
  MapPinOff,
} from "lucide-react";
import { formatDisplayDate } from "@/lib/TimeZone";
import { MapaEventoPalco } from "@/interfaces/palcos.interface";
import { formatCurrency } from "@/lib/formatCurrency";
import VistaPreviaRecinto from "../recintos/vista-previa/VistaPreviaRecinto";
import { FiguraEditor, figurasDelRecinto } from "../recintos/editor/figuras";
import {
  ESTADOS_PALCO,
  ESTILO_ESTADO,
  EstadoPalco,
  contarMapa,
  esPasado,
  ocupadosPorFigura,
  textoVentasFueraDelMapa,
} from "./estadosPalco";
import ContadoresPalcos from "./ContadoresPalcos";
import EstadoEventoBadge from "./EstadoEventoBadge";
import PanelPalco from "./PanelPalco";
import { Cargando, ErrorCarga } from "./EstadoCarga";
import { useMapaEvento } from "./usePalcosEventos";
import { RUTA_TAB_PALCOS, rutaPalcosEvento } from "./rutas";
import { useZoomMapa } from "./useZoomMapa";
import ControlesZoom from "./ControlesZoom";

// Los palcos de UN evento, leidos de la base (GET /palcos/eventos/:id): el
// recinto de su feria con cada palco pintado segun lo que paso con el EN
// ESTE EVENTO (libre, en compra, apartado, vendido). Al tocar un palco se
// ve su detalle. Solo para mirar: apartar, liberar y descargar boletas son
// de la fase 7
export default function PalcosEvento({
  eventoId,
  palcoInicial = null,
  volver,
}: {
  eventoId: number;
  // Se conserva al pasar a otro evento de la feria (pestañas del evento)
  volver?: string;
  // El palco elegido viaja en la direccion (?palco=) al pasar a otro
  // evento de la feria (es el mismo recinto): asi se compara, ej. Palco 3
  // vendido el viernes y libre el sabado (CA-11)
  palcoInicial?: number | null;
}) {
  const [palcoId, setPalcoId] = useState<number | null>(palcoInicial);
  const { carga, reintentar } = useMapaEvento(eventoId);

  if (carga.estado === "cargando") {
    return <Cargando texto="Cargando el mapa del evento…" />;
  }
  if (carga.estado === "error") {
    return (
      <ErrorCarga
        mensaje={carga.mensaje}
        onReintentar={carga.noEncontrado ? undefined : reintentar}
        volver={volver ?? RUTA_TAB_PALCOS}
      />
    );
  }
  return (
    <ContenidoEvento
      mapa={carga.datos}
      palcoId={palcoId}
      onElegirPalco={setPalcoId}
      volver={volver}
    />
  );
}

interface ContenidoEventoProps {
  mapa: MapaEventoPalco;
  palcoId: number | null;
  onElegirPalco: (id: number) => void;
  volver?: string;
}

function ContenidoEvento({
  mapa,
  palcoId,
  onElegirPalco,
  volver,
}: ContenidoEventoProps) {
  const { evento, recinto, deLaFeria } = mapa;
  const pasado = esPasado(evento.fechaEvento);
  const ocupados = useMemo(() => ocupadosPorFigura(mapa.palcos), [mapa.palcos]);
  const estadoDe = useCallback(
    (figuraId: number): EstadoPalco =>
      ocupados.get(figuraId)?.estado ?? "LIBRE",
    [ocupados],
  );
  const conteos = recinto ? contarMapa(recinto, ocupados) : null;
  // Precio de cada palco en este evento: el propio o el base (RN-12)
  const precioDe = useMemo(() => {
    const propios = new Map(
      (mapa.precios ?? []).map((p) => [p.figuraId, p.precio]),
    );
    return (figuraId: number) => ({
      precio: propios.get(figuraId) ?? evento.precioPalco,
      propio: propios.has(figuraId),
    });
  }, [mapa.precios, evento.precioPalco]);
  // Ventas que no se ven en el mapa: palcos de otro recinto (RN-24) o
  // borrados del dibujo despues de un evento pasado
  const fueraDelMapa =
    mapa.palcosFueraDelRecinto + (conteos?.fueraDelDibujo ?? 0);

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
  const estadoPalco = palco ? estadoDe(palco.id as number) : "LIBRE";

  const estiloDePalco = useCallback(
    (f: FiguraEditor) => {
      const estilo = ESTILO_ESTADO[estadoDe(f.id as number)];
      const { precio } = precioDe(f.id as number);
      return {
        color: estilo.color,
        marca: estilo.marca,
        descripcion: `${f.nombre}, ${estilo.etiqueta.toLowerCase()}, ${formatCurrency(precio)}`,
        detalle: formatCurrency(precio, { compact: true }),
      };
    },
    [estadoDe, precioDe],
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
            {formatDisplayDate(evento.fechaEvento)}
            {evento.feria && ` · ${evento.feria.nombre}`}
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
            volver={volver}
          />
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {posicion + 1} de {ordenados.length}
          </span>
          <NavegarEvento
            evento={siguiente}
            direccion="siguiente"
            palcoId={palcoId}
            volver={volver}
          />
        </nav>
      </div>

      {fueraDelMapa > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {textoVentasFueraDelMapa(fueraDelMapa)}
        </div>
      )}

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
          {conteos && (
            <ContadoresPalcos conteo={conteos.conteo} total={conteos.total} />
          )}

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
              {...(palco
                ? precioDe(palco.id as number)
                : { precio: evento.precioPalco, propio: false })}
              ocupado={palco ? ocupados.get(palco.id as number) : undefined}
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
  volver,
}: {
  evento?: { id: number; nombre: string };
  direccion: "anterior" | "siguiente";
  palcoId: number | null;
  volver?: string;
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
      href={rutaPalcosEvento(evento.id, palcoId, volver)}
      aria-label={`${titulo}: ${evento.nombre}`}
      title={`${titulo}: ${evento.nombre}`}
      className={`${clases} border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[#097EEC]`}
    >
      <Icono className="h-4 w-4" />
    </Link>
  );
}
