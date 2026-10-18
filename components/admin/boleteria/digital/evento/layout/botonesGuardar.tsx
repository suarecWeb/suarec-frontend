import { ReactNode } from "react";
import Link from "next/link";

// El formulario de la página de evento. Los botones de la barra están
// fuera de él y lo envían con form=
export const FORM_ID = "formulario-evento";

// Cancelar y Crear/Guardar para MarcoPaginaEvento: en la barra azul de
// arriba y, en el celular, en la barra blanca de abajo
export function botonesGuardar(
  volver: string,
  texto: string,
  guardando: boolean,
) {
  return function Botones(lugar: "arriba" | "abajo"): ReactNode {
    return lugar === "arriba" ? (
      <>
        <Link
          href={volver}
          className="px-4 py-2.5 text-sm font-medium rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          form={FORM_ID}
          disabled={guardando}
          className="px-4 py-2.5 text-sm font-medium rounded-xl bg-white text-[#097EEC] hover:bg-blue-50 shadow disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {texto}
        </button>
      </>
    ) : (
      <>
        <Link
          href={volver}
          className="flex-1 text-center whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          form={FORM_ID}
          disabled={guardando}
          className="flex-1 whitespace-nowrap px-3 py-2 text-sm font-medium text-white bg-[#097EEC] rounded-lg hover:bg-[#0562C7] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {texto}
        </button>
      </>
    );
  };
}
