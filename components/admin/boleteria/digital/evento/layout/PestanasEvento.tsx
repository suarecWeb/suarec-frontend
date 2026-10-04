"use client";

import { MouseEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { rutaPalcosEvento } from "../../../palcos/rutas";
import { rutaEditarEvento } from "../rutas";
import ConfirmarSalirSinGuardar from "../modal-confirmaciones/ConfirmarSalirSinGuardar";

type Pestana = "datos" | "palcos";

// Pestañas de un evento PALCO, debajo del título en la barra azul: "Datos
// y precios" (editar, con Guardar) y "Gestión de palcos" (ver la venta; en
// la fase 7, apartar y vender a mano). Son dos páginas hermanas que
// comparten la barra. Con cambios sin guardar, pregunta antes de salir
export default function PestanasEvento({
  eventoId,
  activa,
  volver,
  hayCambios = false,
}: {
  eventoId: number;
  activa: Pestana;
  // ?volver= viaja entre las dos: la flecha regresa a donde se entró
  volver: string;
  hayCambios?: boolean;
}) {
  const router = useRouter();
  const [destino, setDestino] = useState<string | null>(null);
  // Las pestañas viven en el marco compartido (no se desmontan al cambiar
  // de pestaña): el aviso se cierra solo si la pestaña cambia por otro
  // camino (ej. la flecha atrás del navegador)
  useEffect(() => setDestino(null), [activa]);
  const pestanas: { id: Pestana; etiqueta: string; href: string }[] = [
    {
      id: "datos",
      etiqueta: "Datos y precios",
      href: rutaEditarEvento(eventoId, volver),
    },
    {
      id: "palcos",
      etiqueta: "Gestión de palcos",
      href: rutaPalcosEvento(eventoId, null, volver),
    },
  ];

  const alTocar = (e: MouseEvent, href: string) => {
    if (!hayCambios) return;
    e.preventDefault();
    setDestino(href);
  };

  return (
    <>
      <nav aria-label="Secciones del evento" className="flex gap-1">
        {pestanas.map((p) =>
          p.id === activa ? (
            <span
              key={p.id}
              aria-current="page"
              className="px-3 py-2 text-sm font-semibold border-b-2 border-white"
            >
              {p.etiqueta}
            </span>
          ) : (
            <Link
              key={p.id}
              href={p.href}
              onClick={(e) => alTocar(e, p.href)}
              className="px-3 py-2 text-sm font-medium text-blue-100 border-b-2 border-transparent hover:text-white hover:border-white/40 transition-colors"
            >
              {p.etiqueta}
            </Link>
          ),
        )}
      </nav>
      {/* Fuera de la barra fija: dentro, quedaría debajo del menú de arriba */}
      {destino &&
        createPortal(
          <ConfirmarSalirSinGuardar
            onQuedarse={() => setDestino(null)}
            onSalir={() => {
              setDestino(null);
              router.push(destino);
            }}
          />,
          document.body,
        )}
    </>
  );
}
