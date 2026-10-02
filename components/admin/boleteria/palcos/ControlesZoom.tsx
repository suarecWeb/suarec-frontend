import { ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface ControlesZoomProps {
  zoom: number;
  puedeAcercar: boolean;
  puedeAlejar: boolean;
  onAcercar: () => void;
  onAlejar: () => void;
  onAjustar: () => void;
}

// Mismo estilo que los del editor de recintos (BarraHerramientas)
const botonClase =
  "h-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 inline-flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed";

// Botones de zoom sobre el mapa (esquina de arriba a la derecha)
export default function ControlesZoom({
  zoom,
  puedeAcercar,
  puedeAlejar,
  onAcercar,
  onAlejar,
  onAjustar,
}: ControlesZoomProps) {
  return (
    <div
      // Presionar un boton no debe empezar a arrastrar el mapa
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute top-4 right-4 flex items-center gap-1 rounded-xl bg-white/90 p-1 shadow-sm border border-gray-200"
    >
      <button
        type="button"
        onClick={onAlejar}
        disabled={!puedeAlejar}
        aria-label="Alejar"
        title="Alejar"
        className={`${botonClase} w-8`}
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <span
        aria-live="polite"
        className="w-12 text-center text-xs font-medium text-gray-600 tabular-nums"
      >
        {Math.round(zoom * 100)}%
      </span>
      <button
        type="button"
        onClick={onAcercar}
        disabled={!puedeAcercar}
        aria-label="Acercar"
        title="Acercar"
        className={`${botonClase} w-8`}
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onAjustar}
        disabled={!puedeAlejar}
        aria-label="Ver el recinto completo"
        title="Ver el recinto completo"
        className={`${botonClase} px-2.5 gap-1.5 text-xs font-medium`}
      >
        <Maximize className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Ajustar</span>
      </button>
    </div>
  );
}
