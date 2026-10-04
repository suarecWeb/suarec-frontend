"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  MapPin,
  Search,
  Ticket,
} from "lucide-react";
import { formatDisplayDate } from "@/lib/TimeZone";
import { EventoPalcoResumen } from "@/interfaces/palcos.interface";
import { esPasado } from "./estadosPalco";
import ContadoresPalcos from "./ContadoresPalcos";
import EstadoEventoBadge from "./EstadoEventoBadge";
import { Cargando, ErrorCarga } from "./EstadoCarga";
import { useEventosConPalcos } from "./usePalcosEventos";
import { rutaPalcosEvento } from "./rutas";

type Cuando = "proximos" | "pasados";

const coincide = (texto: string, busqueda: string) =>
  texto.toLowerCase().includes(busqueda.trim().toLowerCase());

// Tab "Gestion de palcos" de Ferias: los eventos PALCO agrupados por
// feria, leidos de la base (GET /palcos/eventos). Al elegir uno se abre su
// mapa (lo vendido, libre, en compra y apartado). Solo para mirar por
// ahora: apartar palcos es de la fase 7
export default function PalcosPorFeria() {
  const [busqueda, setBusqueda] = useState("");
  const [cuando, setCuando] = useState<Cuando>("proximos");
  const { carga, reintentar } = useEventosConPalcos();
  const todas = carga.estado === "listo" ? carga.datos : null;

  const ferias = useMemo(
    () =>
      (todas ?? [])
        .map((feria) => {
          const eventos = feria.eventos
            .filter((e) =>
              cuando === "pasados"
                ? esPasado(e.fechaEvento)
                : !esPasado(e.fechaEvento),
            )
            .filter(
              (e) =>
                !busqueda.trim() ||
                coincide(e.nombre, busqueda) ||
                coincide(feria.nombre, busqueda),
            )
            .sort((a, b) => {
              const diferencia =
                new Date(a.fechaEvento).getTime() -
                new Date(b.fechaEvento).getTime();
              // Proximos: el mas cercano primero; pasados: el mas reciente
              return cuando === "proximos" ? diferencia : -diferencia;
            });
          return { ...feria, eventos };
        })
        .filter((feria) => feria.eventos.length > 0)
        // La feria con el evento mas cercano (o el pasado mas reciente)
        // primero
        .sort((a, b) => {
          const diferencia =
            new Date(a.eventos[0].fechaEvento).getTime() -
            new Date(b.eventos[0].fechaEvento).getTime();
          return cuando === "proximos" ? diferencia : -diferencia;
        }),
    [todas, busqueda, cuando],
  );

  if (carga.estado === "cargando") {
    return <Cargando texto="Cargando los eventos de palcos…" />;
  }
  if (carga.estado === "error") {
    return <ErrorCarga mensaje={carga.mensaje} onReintentar={reintentar} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Buscar evento o feria</span>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar evento o feria…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC]"
          />
        </label>
        <div
          role="group"
          aria-label="Qué eventos mostrar"
          className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50"
        >
          {(["proximos", "pasados"] as const).map((valor) => (
            <button
              key={valor}
              type="button"
              aria-pressed={cuando === valor}
              onClick={() => setCuando(valor)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                cuando === valor
                  ? "bg-white text-[#097EEC] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {valor === "proximos" ? "Próximos" : "Pasados"}
            </button>
          ))}
        </div>
      </div>

      {ferias.length === 0 ? (
        <div className="py-16 text-center">
          <div className="bg-gray-50 border border-gray-100 inline-flex rounded-full p-5 mb-4">
            <Ticket className="h-9 w-9 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-700">
            {busqueda.trim()
              ? "Ningún evento coincide con la búsqueda"
              : cuando === "proximos"
                ? "No hay eventos de palcos próximos"
                : "No hay eventos de palcos pasados"}
          </h3>
          <p className="mt-1.5 text-sm text-gray-400">
            Aquí aparecen los eventos de tipo PALCO de cada feria.
            {todas?.length === 0 &&
              " Crea un evento PALCO en una feria con recinto para verlo aquí."}
          </p>
        </div>
      ) : (
        ferias.map((feria) => (
          <section
            key={feria.id}
            aria-labelledby={`feria-${feria.id}`}
            className="rounded-xl border border-gray-200 overflow-hidden"
          >
            <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3
                id={`feria-${feria.id}`}
                className="text-sm font-semibold text-gray-800"
              >
                {feria.nombre}
              </h3>
              {feria.recinto ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {feria.recinto.nombre}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Sin recinto asignado: asígnalo en &quot;Editar feria&quot;
                </span>
              )}
            </header>
            <ul className="divide-y divide-gray-100">
              {feria.eventos.map((evento) => (
                <li key={evento.id}>
                  <FilaEvento evento={evento} conRecinto={!!feria.recinto} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

function FilaEvento({
  evento,
  conRecinto,
}: {
  evento: EventoPalcoResumen;
  conRecinto: boolean;
}) {
  const datos = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-gray-800 truncate">
            {evento.nombre}
          </p>
          <EstadoEventoBadge estado={evento.estado} />
        </div>
        <p className="mt-0.5 text-xs text-gray-400">
          {formatDisplayDate(evento.fechaEvento)}
        </p>
      </div>
      <div className="sm:w-[420px] flex-shrink-0">
        {conRecinto ? (
          <ContadoresPalcos
            conteo={evento.conteo}
            total={evento.total}
            compacto
          />
        ) : (
          <span className="text-xs text-gray-400">
            Sin mapa hasta asignar un recinto
          </span>
        )}
        {evento.fueraDelRecinto > 0 && (
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            {evento.fueraDelRecinto} venta(s) en palcos que ya no están en el
            recinto
          </p>
        )}
      </div>
    </>
  );

  // Sin recinto no hay mapa que abrir
  if (!conRecinto) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 opacity-70">
        {datos}
        <span className="w-4" />
      </div>
    );
  }
  return (
    <Link
      href={rutaPalcosEvento(evento.id)}
      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-3 hover:bg-[#097EEC]/5 transition-colors group"
    >
      {datos}
      <ChevronRight className="hidden sm:block h-4 w-4 text-gray-300 group-hover:text-[#097EEC] flex-shrink-0" />
    </Link>
  );
}
