"use client";

import { useState } from "react";
import { PalcoOcupadoAdmin } from "@/interfaces/palcos.interface";

const iniciales = (nombre: string) =>
  nombre
    .split(" ")
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

// Foto del admin; sin foto (o si no carga), sus iniciales
const Avatar = ({ nombre, foto }: { nombre: string; foto: string | null }) => {
  const [fallo, setFallo] = useState(false);
  return (
    <span className="h-12 w-12 rounded-full ring-2 ring-white shadow bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold flex items-center justify-center overflow-hidden">
      {foto && !fallo ? (
        // img y no next/image: la foto puede venir de un dominio no configurado
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={foto}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFallo(true)}
        />
      ) : (
        iniciales(nombre)
      )}
    </span>
  );
};

// Quien aparto el palco y su nota, al estilo de las notas de Instagram: la
// burbuja encima de la foto
export default function NotaApartado({
  apartadoPor,
  nota,
}: {
  apartadoPor: NonNullable<PalcoOcupadoAdmin["apartadoPor"]>;
  nota: string | null;
}) {
  return (
    <figure className="flex flex-col items-center gap-1.5">
      {nota && (
        <blockquote className="relative max-w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 shadow-sm break-words">
          {nota}
          <span
            aria-hidden
            className="absolute left-1/2 -bottom-1.5 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-gray-200 bg-white"
          />
        </blockquote>
      )}
      <Avatar nombre={apartadoPor.nombre} foto={apartadoPor.foto} />
      <figcaption className="text-xs text-gray-500">
        Apartado por{" "}
        <span className="font-medium text-gray-700">{apartadoPor.nombre}</span>
      </figcaption>
    </figure>
  );
}
