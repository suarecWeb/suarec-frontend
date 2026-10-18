import { ReactNode } from "react";

// Una fila del formulario como en el boceto: etiqueta a la izquierda y el
// campo a la derecha (en celular, la etiqueta arriba)
export default function Fila({
  id,
  etiqueta,
  obligatorio = false,
  error,
  aviso,
  children,
}: {
  id: string;
  etiqueta: string;
  obligatorio?: boolean;
  error?: string;
  // En rojo debajo del campo aunque no se haya intentado guardar
  aviso?: string | null;
  children: ReactNode;
}) {
  const mensaje = error ?? aviso;
  return (
    <div className="sm:grid sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-start sm:gap-x-3">
      <label
        htmlFor={id}
        className="block text-xs font-medium text-gray-600 mb-1 sm:mb-0 sm:pt-2.5"
      >
        {etiqueta}
        {obligatorio && <span className="text-red-400"> *</span>}
      </label>
      <div className="min-w-0">
        {children}
        {mensaje && <p className="mt-1 text-xs text-red-500">{mensaje}</p>}
      </div>
    </div>
  );
}
