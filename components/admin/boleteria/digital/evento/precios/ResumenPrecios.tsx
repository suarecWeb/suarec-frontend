import { formatCurrency } from "@/lib/formatCurrency";

export interface Grupo {
  precio: number | undefined;
  propio: boolean;
  color: string;
  ids: number[];
}

export interface PalcoVendido {
  id: number;
  nombre: string;
  // Lo que se pagó (null si la venta no lo tiene)
  monto: number | null;
}

// Resumen ("15 a $1.000.000 (base)", "5 a $2.500.000") y, al editar, los
// palcos ya vendidos con lo que se pagó
export default function ResumenPrecios({
  grupos,
  vendidos,
  onElegirGrupo,
}: {
  grupos: Grupo[];
  vendidos: PalcoVendido[];
  // Tocar una fila del resumen elige esos palcos
  onElegirGrupo: (ids: number[]) => void;
}) {
  return (
    <>
      <div className="rounded-xl border border-gray-200 p-3">
        <p className="text-xs font-medium text-gray-600 mb-1">Resumen</p>
        <ul className="space-y-0.5">
          {grupos.map((g) => (
            <li key={g.propio ? g.precio : "base"}>
              <button
                type="button"
                onClick={() => onElegirGrupo(g.ids)}
                title="Elegir estos palcos"
                className="w-full flex items-center gap-2 rounded-md px-1.5 py-1 text-sm text-left text-gray-700 hover:bg-gray-50"
              >
                <span
                  className="h-3 w-3 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: g.color }}
                />
                <span>
                  {g.ids.length} a{" "}
                  {g.precio !== undefined
                    ? formatCurrency(g.precio)
                    : "(falta el precio base)"}
                  {!g.propio && <span className="text-gray-400"> (base)</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {vendidos.length > 0 && (
        <div className="rounded-xl border border-gray-200 p-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Vendidos</p>
          <ul className="space-y-0.5 text-sm text-gray-700">
            {vendidos.map((p) => (
              <li key={p.id}>
                ✓ {p.nombre}
                {p.monto !== null && (
                  <span className="text-gray-500">
                    {" "}
                    · vendido a {formatCurrency(p.monto)}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-[11px] text-gray-400">
            Cambiar su precio solo afecta las ventas nuevas.
          </p>
        </div>
      )}
    </>
  );
}
