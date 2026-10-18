"use client";

import PalcosEvento from "../../palcos/PalcosEvento";
import { useLayoutEvento } from "../layout/LayoutEvento";

// Pestaña "Gestión de palcos": el mapa con el estado de cada palco
// (PalcosEvento pide sus propios datos). La barra y las pestañas son del
// layout (LayoutEvento)
export default function GestionPalcosEvento({
  eventoId,
  palcoInicial,
}: {
  eventoId: number;
  palcoInicial: number | null;
}) {
  const { volver } = useLayoutEvento();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 overflow-hidden">
      <PalcosEvento
        eventoId={eventoId}
        palcoInicial={palcoInicial}
        volver={volver}
      />
    </div>
  );
}
