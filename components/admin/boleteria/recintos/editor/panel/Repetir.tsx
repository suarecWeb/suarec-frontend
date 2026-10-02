"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  RotateCw,
  RotateCcw,
  Copy,
} from "lucide-react";
import { FiguraEditor, TamanoLienzo } from "../figuras";
import {
  DireccionFila,
  Sentido,
  referenciaMasGrande,
  repetirEnAbanico,
  repetirEnFila,
} from "../repetir";
import { tamanoSugerido } from "../hooks/useCuadricula";

interface RepetirProps {
  figura: FiguraEditor;
  // Todo el dibujo: para nombrar las copias sin repetir y elegir el centro
  figuras: FiguraEditor[];
  lienzo: TamanoLienzo;
  // Copias fantasma en el lienzo mientras el formulario esta abierto
  onVistaPrevia: (copias: FiguraEditor[] | null) => void;
  onCrear: (copias: FiguraEditor[]) => void;
}

const CANTIDAD_MAXIMA = 100;
const CENTRO_LIENZO = "lienzo";

const DIRECCIONES: {
  valor: DireccionFila;
  titulo: string;
  Icono: typeof ArrowRight;
}[] = [
  { valor: "derecha", titulo: "Hacia la derecha", Icono: ArrowRight },
  { valor: "izquierda", titulo: "Hacia la izquierda", Icono: ArrowLeft },
  { valor: "abajo", titulo: "Hacia abajo", Icono: ArrowDown },
  { valor: "arriba", titulo: "Hacia arriba", Icono: ArrowUp },
];

const etiqueta = "block text-[11px] font-medium text-gray-500 mb-1";
const campo =
  "w-full px-2 py-1.5 text-sm border border-gray-200 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC]";
const opcion = (activa: boolean) =>
  `h-8 rounded-lg border text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors ${
    activa
      ? "border-[#097EEC] bg-[#097EEC]/5 text-[#097EEC]"
      : "border-gray-200 text-gray-600 hover:bg-gray-50"
  }`;

const entero = (texto: string, minimo: number, maximo: number) => {
  const n = Math.round(Number(texto));
  return Number.isFinite(n) && n >= minimo && n <= maximo ? n : null;
};

// Repetir la figura en fila o en abanico (PEN-24): N copias ordenadas de
// una vez. Mientras el formulario esta abierto se ven en el lienzo como
// fantasmas; "Crear" las agrega en un solo paso (un Deshacer las quita)
export default function Repetir({
  figura,
  figuras,
  lienzo,
  onVistaPrevia,
  onCrear,
}: RepetirProps) {
  const sugerida = referenciaMasGrande(figuras);
  const [abierto, setAbierto] = useState(false);
  const [modo, setModo] = useState<"fila" | "abanico">("fila");
  const [cantidad, setCantidad] = useState("5");
  const [direccion, setDireccion] = useState<DireccionFila>("derecha");
  const [espacio, setEspacio] = useState(String(tamanoSugerido(lienzo)));
  const [angulo, setAngulo] = useState("90");
  const [sentido, setSentido] = useState<Sentido>("horario");
  const [centroClave, setCentroClave] = useState(
    sugerida?.clave ?? CENTRO_LIENZO,
  );
  // Al abrirlo, el panel se desplaza hasta el formulario (va al final del
  // panel y en pantallas bajas quedaba oculto)
  const formularioRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (abierto)
      formularioRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
  }, [abierto]);

  const referencias = figuras.filter(
    (f) => f.tipo === "REFERENCIA" && f.clave !== figura.clave,
  );
  const centroFigura = referencias.find((f) => f.clave === centroClave);
  const centro = centroFigura
    ? { x: centroFigura.x, y: centroFigura.y }
    : { x: lienzo.ancho / 2, y: lienzo.alto / 2 };
  const radio = Math.round(
    Math.hypot(figura.x - centro.x, figura.y - centro.y),
  );

  const resultado = useMemo(() => {
    if (!abierto) return null;
    const n = entero(cantidad, 1, CANTIDAD_MAXIMA);
    if (n === null) {
      return {
        copias: [],
        problema: `La cantidad va de 1 a ${CANTIDAD_MAXIMA}`,
      };
    }
    if (modo === "fila") {
      const e = entero(espacio, 0, Math.max(lienzo.ancho, lienzo.alto));
      if (e === null) return { copias: [], problema: "Separación no válida" };
      return repetirEnFila(
        figura,
        figuras,
        { cantidad: n, direccion, espacio: e },
        lienzo,
      );
    }
    const a = entero(angulo, 1, 360);
    if (a === null)
      return { copias: [], problema: "El ángulo va de 1 a 360 grados" };
    return repetirEnAbanico(
      figura,
      figuras,
      { cantidad: n, angulo: a, sentido, centro },
      lienzo,
    );
    // centro se recalcula en cada render a partir de centroClave/figuras
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    abierto,
    modo,
    cantidad,
    direccion,
    espacio,
    angulo,
    sentido,
    centroClave,
    figura,
    figuras,
    // Numeros y no el objeto: el panel arma { ancho, alto } en cada render
    // y con el objeto esto se recalcularia siempre (y la vista previa con
    // el, en bucle)
    lienzo.ancho,
    lienzo.alto,
  ]);

  // La vista previa sigue al formulario; al cerrarlo o al cambiar de
  // figura (se desmonta) se borra
  useEffect(() => {
    onVistaPrevia(resultado && !resultado.problema ? resultado.copias : null);
  }, [resultado, onVistaPrevia]);
  useEffect(() => () => onVistaPrevia(null), [onVistaPrevia]);

  if (!abierto) {
    return (
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1">Repetir</p>
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="w-full h-8 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 inline-flex items-center justify-center gap-1.5 hover:bg-gray-50 hover:text-[#097EEC] transition-colors"
        >
          <Copy className="h-3.5 w-3.5" />
          Repetir en fila o abanico
        </button>
      </div>
    );
  }

  const cantidadValida = resultado?.copias.length ?? 0;

  return (
    <div
      ref={formularioRef}
      className="rounded-lg border border-[#097EEC]/30 bg-[#097EEC]/[0.02] p-3 flex flex-col gap-3"
    >
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setModo("fila")}
          className={opcion(modo === "fila")}
        >
          Fila
        </button>
        <button
          type="button"
          onClick={() => setModo("abanico")}
          className={opcion(modo === "abanico")}
        >
          Abanico
        </button>
      </div>

      <label className="block">
        <span className={etiqueta}>Cantidad de copias</span>
        <input
          type="number"
          min={1}
          max={CANTIDAD_MAXIMA}
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          className={campo}
        />
      </label>

      {modo === "fila" ? (
        <>
          <div>
            <span className={etiqueta}>Dirección</span>
            <div className="grid grid-cols-4 gap-1">
              {DIRECCIONES.map(({ valor, titulo, Icono }) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setDireccion(valor)}
                  aria-label={titulo}
                  title={titulo}
                  aria-pressed={direccion === valor}
                  className={opcion(direccion === valor)}
                >
                  <Icono className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className={etiqueta}>Separación entre figuras</span>
            <input
              type="number"
              min={0}
              value={espacio}
              onChange={(e) => setEspacio(e.target.value)}
              className={campo}
            />
          </label>
        </>
      ) : (
        <>
          <label className="block">
            <span className={etiqueta}>Centro del arco</span>
            <select
              value={centroFigura ? centroClave : CENTRO_LIENZO}
              onChange={(e) => setCentroClave(e.target.value)}
              className={campo}
            >
              {referencias.map((r) => (
                <option key={r.clave} value={r.clave}>
                  {/* Varias decorativas sin nombre: el tamano las distingue */}
                  {r.nombre.trim() || `Sin nombre (${r.ancho} × ${r.alto})`}
                </option>
              ))}
              <option value={CENTRO_LIENZO}>Centro del lienzo</option>
            </select>
          </label>
          <label className="block">
            <span className={etiqueta}>Ángulo que abarcan (grados)</span>
            <input
              type="number"
              min={1}
              max={360}
              value={angulo}
              onChange={(e) => setAngulo(e.target.value)}
              className={campo}
            />
          </label>
          <div>
            <span className={etiqueta}>Sentido</span>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setSentido("horario")}
                aria-pressed={sentido === "horario"}
                className={opcion(sentido === "horario")}
              >
                <RotateCw className="h-3.5 w-3.5" />
                Horario
              </button>
              <button
                type="button"
                onClick={() => setSentido("antihorario")}
                aria-pressed={sentido === "antihorario"}
                className={opcion(sentido === "antihorario")}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Antihorario
              </button>
            </div>
          </div>
          <p className="text-[11px] text-gray-400">
            Radio: {radio} (la distancia de la figura al centro; para cambiarlo,
            mueve la figura)
          </p>
        </>
      )}

      {resultado?.problema && (
        <p role="alert" className="text-[11px] text-amber-700">
          {resultado.problema}
        </p>
      )}

      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="h-8 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={!resultado || !!resultado.problema || cantidadValida === 0}
          onClick={() => {
            if (resultado && !resultado.problema) {
              onCrear(resultado.copias);
              setAbierto(false);
            }
          }}
          className="h-8 rounded-lg bg-[#097EEC] text-white text-xs font-medium hover:bg-[#0562C7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Crear {cantidadValida || ""}{" "}
          {cantidadValida === 1 ? "copia" : "copias"}
        </button>
      </div>
    </div>
  );
}
