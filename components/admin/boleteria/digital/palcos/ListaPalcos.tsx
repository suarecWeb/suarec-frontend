"use client";

import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDisplayDate, formatDisplayTime } from "@/lib/TimeZone";
import { PalcoOcupadoAdmin } from "@/interfaces/palcos.interface";
import { ESTILO_ESTADO } from "./estadosPalco";

type Filtro = "TODOS" | PalcoOcupadoAdmin["estado"];

const FILTROS: { valor: Filtro; etiqueta: string }[] = [
  { valor: "TODOS", etiqueta: "Todos" },
  { valor: "VENDIDO", etiqueta: "Vendidos" },
  { valor: "APARTADO", etiqueta: "Apartados" },
  { valor: "EN_COMPRA", etiqueta: "En compra" },
];

// Primero lo vendido, luego lo apartado y al final lo que se está pagando
const ORDEN: Record<PalcoOcupadoAdmin["estado"], number> = {
  VENDIDO: 0,
  APARTADO: 1,
  EN_COMPRA: 2,
};

// Quién tiene el palco: el comprador de la app o el cliente del admin
const titularDe = (p: PalcoOcupadoAdmin) =>
  p.apartadoPor
    ? {
        nombre: p.cliente?.nombre ?? "Sin datos del cliente",
        correo: p.cliente?.correo ?? null,
        cedula: p.cliente?.cedula ?? null,
      }
    : {
        nombre: p.comprador?.nombre ?? "Sin dato",
        correo: p.comprador?.email ?? null,
        cedula: null,
      };

// En compra: cuándo la tomó; si no, cuándo quedó en su estado
const fechaDe = (p: PalcoOcupadoAdmin) =>
  p.estado === "EN_COMPRA" && p.reservadoEn ? p.reservadoEn : p.actualizadoEn;

// "13 de oct de 2026, 01:52 p. m." -> "13 de oct de 2026"
const fechaCorta = (iso: string) => formatDisplayDate(iso).split(",")[0];

const pagoDe = (p: PalcoOcupadoAdmin) => {
  if (p.estado === "EN_COMPRA") return "En pago";
  if (p.apartadoPor) return p.estado === "VENDIDO" ? "Fuera de la app" : "—";
  return p.monto !== null ? formatCurrency(p.monto) : "—";
};

// Todos los palcos ocupados del evento en filas: quién los tiene, cuánto
// pagó y cuándo. Tocar una fila lo abre en el mapa
export default function ListaPalcos({
  palcos,
  onVerEnMapa,
}: {
  palcos: PalcoOcupadoAdmin[];
  onVerEnMapa: (figuraId: number) => void;
}) {
  const [filtro, setFiltro] = useState<Filtro>("TODOS");

  const ordenados = useMemo(
    () =>
      [...palcos].sort(
        (a, b) =>
          ORDEN[a.estado] - ORDEN[b.estado] ||
          a.palcoNombre.localeCompare(b.palcoNombre, "es", { numeric: true }),
      ),
    [palcos],
  );
  const cuantos = (f: Filtro) =>
    f === "TODOS" ? palcos.length : palcos.filter((p) => p.estado === f).length;
  const filas =
    filtro === "TODOS"
      ? ordenados
      : ordenados.filter((p) => p.estado === filtro);

  return (
    <section
      aria-label="Lista de palcos"
      className="flex min-w-0 flex-col gap-3"
    >
      <div
        role="group"
        aria-label="Filtrar por estado"
        className="flex flex-wrap gap-2"
      >
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            type="button"
            aria-pressed={filtro === f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              filtro === f.valor
                ? "border-[#097EEC] bg-blue-50 text-[#097EEC]"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.etiqueta} ({cuantos(f.valor)})
          </button>
        ))}
      </div>

      {filas.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
          {palcos.length === 0
            ? "Todavía no hay palcos vendidos, apartados ni en compra en este evento."
            : "No hay palcos con este estado."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
              <tr>
                <th className="px-4 py-2.5">Palco</th>
                <th className="px-4 py-2.5">Estado</th>
                <th className="px-4 py-2.5 min-w-[220px]">
                  Comprador o cliente
                </th>
                <th className="px-4 py-2.5">Pagó</th>
                <th className="px-4 py-2.5">Fecha</th>
                <th className="px-4 py-2.5">Origen</th>
                <th className="px-4 py-2.5">
                  <span className="sr-only">Ver en el mapa</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filas.map((p) => {
                const { etiqueta, color, marca } = ESTILO_ESTADO[p.estado];
                const titular = titularDe(p);
                return (
                  <tr
                    key={p.figuraId}
                    onClick={() => onVerEnMapa(p.figuraId)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {p.palcoNombre}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white whitespace-nowrap"
                        style={{ background: color }}
                      >
                        <span aria-hidden>{marca}</span>
                        {etiqueta}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block font-medium text-gray-800">
                        {titular.nombre}
                      </span>
                      {titular.correo && (
                        <span className="block text-xs text-gray-400 break-words">
                          {titular.correo}
                        </span>
                      )}
                      {titular.cedula && (
                        <span className="block text-xs text-gray-400">
                          CC {titular.cedula}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {pagoDe(p)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      <span className="block">{fechaCorta(fechaDe(p))}</span>
                      <span className="block text-xs text-gray-400">
                        {formatDisplayTime(fechaDe(p))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="block">
                        {p.apartadoPor ? "Admin" : "App"}
                      </span>
                      {p.apartadoPor && (
                        <span className="block text-xs text-gray-400">
                          {p.apartadoPor.nombre}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onVerEnMapa(p.figuraId);
                        }}
                        aria-label={`Ver ${p.palcoNombre} en el mapa`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#097EEC] hover:bg-blue-50"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
