"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { FiguraEditor, TAMANO_MINIMO } from "../figuras";

const limitar = (valor: number, maximo: number) =>
  Math.min(Math.max(Math.round(valor), TAMANO_MINIMO), maximo);

interface CampoMedidaProps {
  etiqueta: string;
  valor: number;
  maximo: number;
  deshabilitado: boolean;
  onAplicar: (valor: number) => void;
}

// Una medida que se aplica con Enter o al salir del campo, no en cada
// tecla (escribir "80" no pasa por "8"). Esc vuelve al valor actual. Se
// limita sola entre el minimo y el tamano del lienzo
function CampoMedida({
  etiqueta,
  valor,
  maximo,
  deshabilitado,
  onAplicar,
}: CampoMedidaProps) {
  const [texto, setTexto] = useState(String(valor));
  const cancelado = useRef(false);

  // Si la figura se estira en el lienzo, el campo la sigue
  useEffect(() => setTexto(String(valor)), [valor]);

  const aplicar = () => {
    if (cancelado.current) {
      cancelado.current = false;
      return;
    }
    const numero = Number(texto);
    if (texto.trim() === "" || !Number.isFinite(numero)) {
      setTexto(String(valor));
      return;
    }
    const final = limitar(numero, maximo);
    setTexto(String(final));
    if (final !== valor) onAplicar(final);
  };

  return (
    <label className="block">
      <span className="block text-[11px] text-gray-500 mb-0.5">{etiqueta}</span>
      <input
        type="number"
        min={TAMANO_MINIMO}
        max={maximo}
        step={1}
        value={texto}
        disabled={deshabilitado}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={aplicar}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            cancelado.current = true;
            setTexto(String(valor));
            e.currentTarget.blur();
          }
        }}
        className="w-full px-2 py-1.5 text-sm border border-gray-200 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] tabular-nums disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </label>
  );
}

interface CamposTamanoProps {
  figura: FiguraEditor;
  lienzoAncho: number;
  lienzoAlto: number;
  onCambiar: (cambios: Partial<FiguraEditor>) => void;
  // El UNICO candado del panel: bloquea la figura entera (posicion, tamano,
  // rotacion y borrar), como "Bloquear" en Canva
  onBloquear: (bloquear: boolean) => void;
}

// Cada campo va atado a su figura (key): si se escribe una medida y se
// selecciona otra figura sin presionar Enter, no se aplica a la nueva.
// Tamano exacto de la figura, en unidades del lienzo. Crece o se achica
// alrededor de su centro (x, y no cambian). En el circulo, un solo campo.
// Entre las medidas va el candado: con la figura bloqueada los numeros se
// deshabilitan, pero el candado sigue activo para poder desbloquearla
export default function CamposTamano({
  figura,
  lienzoAncho,
  lienzoAlto,
  onCambiar,
  onBloquear,
}: CamposTamanoProps) {
  const etiquetaClase = "block text-xs font-medium text-gray-600 mb-1";
  const bloqueada = figura.bloqueada;

  const candado = (
    <button
      type="button"
      onClick={() => onBloquear(!bloqueada)}
      aria-pressed={bloqueada}
      aria-label={bloqueada ? "Desbloquear figura" : "Bloquear figura"}
      title={bloqueada ? "Desbloquear figura" : "Bloquear figura"}
      className={`h-[34px] w-8 rounded-lg border flex items-center justify-center transition-colors ${
        bloqueada
          ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
      }`}
    >
      {bloqueada ? (
        <Lock className="h-3.5 w-3.5" />
      ) : (
        <Unlock className="h-3.5 w-3.5" />
      )}
    </button>
  );

  const aviso = bloqueada && (
    <p className="mt-1 text-[11px] text-amber-700">
      Bloqueada: no se mueve, estira, rota ni borra. Clic en el candado para
      desbloquear.
    </p>
  );

  if (figura.forma === "CIRCULO") {
    return (
      <div>
        <span className={etiquetaClase}>Tamaño</span>
        <div className="grid grid-cols-[1fr_auto] items-end gap-1.5">
          <CampoMedida
            key={`${figura.clave}-diametro`}
            etiqueta="Diámetro"
            valor={figura.ancho}
            maximo={Math.min(lienzoAncho, lienzoAlto)}
            deshabilitado={bloqueada}
            onAplicar={(diametro) =>
              onCambiar({ ancho: diametro, alto: diametro })
            }
          />
          {candado}
        </div>
        {aviso}
      </div>
    );
  }

  return (
    <div>
      <span className={etiquetaClase}>Tamaño</span>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-1.5">
        <CampoMedida
          key={`${figura.clave}-ancho`}
          etiqueta="Ancho"
          valor={figura.ancho}
          maximo={lienzoAncho}
          deshabilitado={bloqueada}
          onAplicar={(ancho) => onCambiar({ ancho })}
        />
        {candado}
        <CampoMedida
          key={`${figura.clave}-alto`}
          etiqueta="Alto"
          valor={figura.alto}
          maximo={lienzoAlto}
          deshabilitado={bloqueada}
          onAplicar={(alto) => onCambiar({ alto })}
        />
      </div>
      {aviso}
    </div>
  );
}
