"use client";

import { memo } from "react";
import { Rect, Circle, Text } from "react-konva";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Vector2d } from "konva/lib/types";
import {
  FiguraEditor,
  TAMANO_MINIMO,
  limitarAlLienzo,
  normalizarRotacion,
  rellenoDe,
  colorDeTexto,
} from "./figuras";

interface FiguraNodoProps {
  figura: FiguraEditor;
  lienzoAncho: number;
  lienzoAlto: number;
  conError: boolean;
  // Al presionar (puede empezar un arrastre del grupo) y al hacer clic
  // sin arrastrar. conShift: agregar/quitar de la seleccion
  onPresionar: (clave: string, conShift: boolean) => void;
  onClic: (clave: string, conShift: boolean) => void;
  onCambiar: (clave: string, cambios: Partial<FiguraEditor>) => void;
}

// Una figura del recinto: su forma y, aparte, su nombre. La etiqueta no
// va agrupada con la forma para que no agrande la caja de seleccion;
// mientras se arrastra o transforma se mueve a mano (sin estado de React)
// y al soltar se guarda todo en el estado. memo: al cambiar una figura
// no se redibujan las demas
const FiguraNodo = memo(function FiguraNodo({
  figura,
  lienzoAncho,
  lienzoAlto,
  conError,
  onPresionar,
  onClic,
  onCambiar,
}: FiguraNodoProps) {
  const esPalco = figura.tipo === "PALCO";
  const lienzo = { ancho: lienzoAncho, alto: lienzoAlto };

  // Mientras se arrastra, el centro se frena en el borde del lienzo. Konva
  // entrega la posicion en pixeles de pantalla: se pasa a unidades del
  // lienzo con la vista actual del Stage, se limita y se devuelve
  function limitarArrastre(this: Konva.Node, pos: Vector2d): Vector2d {
    const stage = this.getStage();
    if (!stage) return pos;
    const escala = stage.scaleX();
    const limitado = limitarAlLienzo(
      { x: (pos.x - stage.x()) / escala, y: (pos.y - stage.y()) / escala },
      lienzo,
    );
    return {
      x: limitado.x * escala + stage.x(),
      y: limitado.y * escala + stage.y(),
    };
  }
  const claveEtiqueta = `${figura.clave}-etiqueta`;
  const tamanoFuente = Math.min(
    Math.max(Math.min(figura.ancho, figura.alto) * 0.28, 8),
    40,
  );

  const moverEtiqueta = (nodo: Konva.Node) => {
    const etiqueta = nodo.getLayer()?.findOne(`#${claveEtiqueta}`);
    if (!etiqueta) return;
    etiqueta.position(nodo.position());
    if (figura.etiquetaRotada) etiqueta.rotation(nodo.rotation());
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    onCambiar(
      figura.clave,
      limitarAlLienzo({ x: e.target.x(), y: e.target.y() }, lienzo),
    );
  };

  // El Transformer estira con scaleX/scaleY: se pasa ese estiramiento al
  // tamano real y la escala vuelve a 1
  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    const nodo = e.target;
    const escalaX = nodo.scaleX();
    const escalaY = nodo.scaleY();
    nodo.scaleX(1);
    nodo.scaleY(1);
    const ancho = Math.max(TAMANO_MINIMO, Math.round(figura.ancho * escalaX));
    const alto =
      figura.forma === "CIRCULO"
        ? ancho
        : Math.max(TAMANO_MINIMO, Math.round(figura.alto * escalaY));
    // Estirar desde un borde mueve el centro: tambien se limita al lienzo
    onCambiar(figura.clave, {
      ...limitarAlLienzo({ x: nodo.x(), y: nodo.y() }, lienzo),
      rotacion: normalizarRotacion(nodo.rotation()),
      ancho,
      alto,
    });
  };

  const propiedadesComunes = {
    id: figura.clave,
    // "bloqueada": el editor la trata como fondo para empezar un recuadro
    name: figura.bloqueada ? "figura bloqueada" : "figura",
    x: figura.x,
    y: figura.y,
    rotation: figura.rotacion,
    fill: rellenoDe(figura),
    stroke: conError ? "#dc2626" : esPalco ? "#1f2937" : figura.color,
    strokeWidth: conError ? 2 : 1,
    strokeScaleEnabled: false,
    // Palco solido; referencia con borde punteado (RN-04)
    dash: esPalco ? undefined : [6, 4],
    // Bloqueada: no se arrastra (y el editor tampoco mueve la vista)
    draggable: !figura.bloqueada,
    dragBoundFunc: limitarArrastre,
    onMouseDown: (e: KonvaEventObject<MouseEvent>) =>
      onPresionar(figura.clave, e.evt.shiftKey),
    onClick: (e: KonvaEventObject<MouseEvent>) =>
      onClic(figura.clave, e.evt.shiftKey),
    onTap: () => {
      onPresionar(figura.clave, false);
      onClic(figura.clave, false);
    },
    onDragMove: (e: KonvaEventObject<DragEvent>) => moverEtiqueta(e.target),
    onDragEnd: handleDragEnd,
    onTransform: (e: KonvaEventObject<Event>) => moverEtiqueta(e.target),
    onTransformEnd: handleTransformEnd,
  };

  return (
    <>
      {figura.forma === "CIRCULO" ? (
        <Circle {...propiedadesComunes} radius={figura.ancho / 2} />
      ) : (
        <Rect
          {...propiedadesComunes}
          width={figura.ancho}
          height={figura.alto}
          offsetX={figura.ancho / 2}
          offsetY={figura.alto / 2}
        />
      )}
      <Text
        id={claveEtiqueta}
        x={figura.x}
        y={figura.y}
        width={figura.ancho}
        height={figura.alto}
        offsetX={figura.ancho / 2}
        offsetY={figura.alto / 2}
        rotation={figura.etiquetaRotada ? figura.rotacion : 0}
        text={figura.bloqueada ? `🔒 ${figura.nombre}` : figura.nombre}
        fontSize={tamanoFuente}
        fontStyle={esPalco ? "bold" : "normal"}
        fill={colorDeTexto(figura)}
        align="center"
        verticalAlign="middle"
        wrap="none"
        ellipsis
        listening={false}
      />
    </>
  );
});

export default FiguraNodo;
