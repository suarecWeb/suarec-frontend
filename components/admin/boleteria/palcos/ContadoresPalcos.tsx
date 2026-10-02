import { ESTADOS_PALCO, ESTILO_ESTADO, EstadoPalco } from "./estadosPalco";

interface ContadoresPalcosProps {
  conteo: Record<EstadoPalco, number>;
  total: number;
  // Compacto: en la lista de eventos (sin los estados en 0)
  compacto?: boolean;
}

// Cuantos palcos hay en cada estado. El total sale del dibujo (RN-20)
export default function ContadoresPalcos({
  conteo,
  total,
  compacto = false,
}: ContadoresPalcosProps) {
  const estados = compacto
    ? ESTADOS_PALCO.filter((e) => conteo[e] > 0)
    : ESTADOS_PALCO;

  return (
    <div
      className={`flex flex-wrap items-center ${compacto ? "gap-x-3 gap-y-1" : "gap-2"}`}
    >
      {estados.map((estado) => {
        const { etiqueta, plural, color } = ESTILO_ESTADO[estado];
        // "1 vendido", "3 vendidos"
        const nombre = conteo[estado] === 1 ? etiqueta : plural;
        return compacto ? (
          <span
            key={estado}
            className="inline-flex items-center gap-1 text-xs text-gray-600"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: color }}
            />
            {conteo[estado]} {nombre.toLowerCase()}
          </span>
        ) : (
          <span
            key={estado}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: color }}
            />
            <span className="text-sm font-semibold text-gray-800">
              {conteo[estado]}
            </span>
            <span className="text-xs text-gray-500">{nombre}</span>
          </span>
        );
      })}
      <span
        className={
          compacto ? "text-xs text-gray-400" : "text-xs text-gray-400 ml-1"
        }
      >
        Total {total} palcos
      </span>
    </div>
  );
}
