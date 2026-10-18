// Leyenda bajo el mapa: precio base · precio propio · elegido · vendido
export default function LeyendaPrecios({
  colorBase,
  colorPropio,
  conVendidos,
}: {
  colorBase: string;
  colorPropio: string;
  // Solo al editar un evento que ya vendió palcos
  conVendidos: boolean;
}) {
  return (
    <ul
      aria-label="Leyenda"
      className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500"
    >
      <li className="inline-flex items-center gap-1.5">
        <span
          className="h-3 w-3 rounded-full border border-gray-300"
          style={{ backgroundColor: colorBase }}
        />
        precio base
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: colorPropio }}
        />
        precio propio
      </li>
      <li className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-full border-[3px] border-gray-900 bg-white" />
        elegido
      </li>
      {conVendidos && (
        <li className="inline-flex items-center gap-1.5">
          <span className="font-bold text-gray-700">✓</span>
          vendido
        </li>
      )}
      <li className="text-gray-400">
        En el celular, cada toque suma o quita un palco.
      </li>
    </ul>
  );
}
