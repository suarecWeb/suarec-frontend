"use client";

import { KeyboardEvent, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Feria } from "@/interfaces/feria.interface";
import { claseCampo } from "../opciones";
import { rangoFechas } from "../fechas";

interface Opcion {
  id: number | undefined;
  nombre: string;
  detalle?: string;
}

// Feria [Buscar feria… ▾]: escribir filtra por nombre. "Sin feria" solo
// si se permite (crear, o un evento que aún no tiene)
export default function SelectorFeria({
  ferias,
  feriaId,
  onCambiar,
  permitirSinFeria,
  conError,
}: {
  ferias: Feria[];
  feriaId?: number;
  onCambiar: (feriaId: number | undefined) => void;
  permitirSinFeria: boolean;
  conError: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [activa, setActiva] = useState(0);

  const opciones = useMemo<Opcion[]>(() => {
    const filtro = texto.trim().toLowerCase();
    const deFerias = ferias
      .filter((x) => !filtro || x.nombre.toLowerCase().includes(filtro))
      .map((x) => ({
        id: x.id,
        nombre: x.nombre,
        detalle: `${rangoFechas(x.fechaInicio, x.fechaFin)}${x.recintoId ? "" : " · sin recinto"}`,
      }));
    return permitirSinFeria && !filtro
      ? [{ id: undefined, nombre: "Sin feria (suelto)" }, ...deFerias]
      : deFerias;
  }, [ferias, texto, permitirSinFeria]);

  const elegida = ferias.find((x) => x.id === feriaId);
  const elegir = (op: Opcion) => {
    onCambiar(op.id);
    setAbierto(false);
    setTexto("");
  };

  const teclear = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setAbierto(true);
      const paso = e.key === "ArrowDown" ? 1 : -1;
      setActiva((i) => Math.min(Math.max(i + paso, 0), opciones.length - 1));
    } else if (e.key === "Enter") {
      // Enter elige la feria; no envía el formulario
      e.preventDefault();
      if (abierto && opciones[activa]) elegir(opciones[activa]);
    } else if (e.key === "Escape") {
      setAbierto(false);
      setTexto("");
    }
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        id="evento-feria"
        role="combobox"
        aria-expanded={abierto}
        aria-controls="evento-feria-opciones"
        aria-autocomplete="list"
        autoComplete="off"
        value={abierto ? texto : (elegida?.nombre ?? "")}
        placeholder={
          permitirSinFeria && !elegida ? "Sin feria (suelto)" : "Buscar feria…"
        }
        onChange={(e) => {
          setTexto(e.target.value);
          setActiva(0);
          setAbierto(true);
        }}
        onFocus={() => {
          setAbierto(true);
          setActiva(0);
        }}
        onBlur={() => {
          setAbierto(false);
          setTexto("");
        }}
        onKeyDown={teclear}
        className={`pl-9 pr-9 ${claseCampo(conError)}`}
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      {abierto && (
        <ul
          id="evento-feria-opciones"
          role="listbox"
          className="absolute z-30 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1"
        >
          {opciones.length === 0 && (
            <li className="px-3 py-2 text-xs text-gray-400">
              Ninguna feria con ese nombre
            </li>
          )}
          {opciones.map((op, i) => (
            <li
              key={op.id ?? "sin-feria"}
              role="option"
              aria-selected={op.id === feriaId}
              // mousedown: elegir antes de que el campo pierda el foco
              onMouseDown={(e) => {
                e.preventDefault();
                elegir(op);
              }}
              onMouseEnter={() => setActiva(i)}
              className={`px-3 py-2 cursor-pointer ${i === activa ? "bg-[#097EEC]/5" : ""}`}
            >
              <p
                className={`text-sm ${op.id === feriaId ? "font-semibold text-[#097EEC]" : "text-gray-700"}`}
              >
                {op.nombre}
              </p>
              {op.detalle && (
                <p className="text-[11px] text-gray-400">{op.detalle}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
