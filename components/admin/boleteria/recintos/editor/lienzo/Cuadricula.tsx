"use client";

import { memo } from "react";
import { Shape } from "react-konva";
import type Konva from "konva";
import { TamanoLienzo } from "../figuras";

interface CuadriculaProps {
  lienzo: TamanoLienzo;
  // Tamano de celda en unidades del lienzo
  tamano: number;
  // Escala de la vista: para no dibujar lineas pegadas al alejar
  escala: number;
}

// Separacion minima en pantalla entre lineas dibujadas
const MINIMO_PX = 8;
// Cada tantas celdas, una linea mas marcada (ayuda a contar)
const CADA_MAYOR = 5;

const lineas = (ctx: Konva.Context, lienzo: TamanoLienzo, paso: number) => {
  ctx.beginPath();
  for (let x = paso; x < lienzo.ancho; x += paso) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, lienzo.alto);
  }
  for (let y = paso; y < lienzo.alto; y += paso) {
    ctx.moveTo(0, y);
    ctx.lineTo(lienzo.ancho, y);
  }
};

// Lineas de fondo del lienzo (solo dentro de el). No escuchan el mouse:
// clic y recuadro de seleccion pasan de largo. Al alejar el zoom se dibuja
// una de cada tantas, para que no se vuelva una mancha gris
const Cuadricula = memo(function Cuadricula({
  lienzo,
  tamano,
  escala,
}: CuadriculaProps) {
  const salto = Math.max(1, Math.ceil(MINIMO_PX / (tamano * escala)));
  const paso = tamano * salto;
  return (
    <>
      <Shape
        listening={false}
        perfectDrawEnabled={false}
        stroke="#eef0f3"
        strokeWidth={1}
        strokeScaleEnabled={false}
        sceneFunc={(ctx, shape) => {
          lineas(ctx, lienzo, paso);
          ctx.fillStrokeShape(shape);
        }}
      />
      <Shape
        listening={false}
        perfectDrawEnabled={false}
        stroke="#dde1e7"
        strokeWidth={1}
        strokeScaleEnabled={false}
        sceneFunc={(ctx, shape) => {
          lineas(ctx, lienzo, paso * CADA_MAYOR);
          ctx.fillStrokeShape(shape);
        }}
      />
    </>
  );
});

export default Cuadricula;
