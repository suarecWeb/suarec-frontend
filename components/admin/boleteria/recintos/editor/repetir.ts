import {
  FiguraEditor,
  TamanoLienzo,
  MAXIMO_FIGURAS,
  claveNueva,
  nombreDeCopia,
  normalizarRotacion,
} from "./figuras";
import { mitadesDe } from "./acomodar";

// Repetir una figura en fila o en abanico (PEN-24): N copias ordenadas de
// una vez, para dibujar recintos grandes. Funciones puras: el editor
// muestra el resultado como vista previa y lo crea en un solo paso

export type DireccionFila = "derecha" | "izquierda" | "abajo" | "arriba";
export type Sentido = "horario" | "antihorario";

export interface ResultadoRepetir {
  copias: FiguraEditor[];
  // Por qué no se pueden crear (null si se puede)
  problema: string | null;
}

interface Posicion {
  x: number;
  y: number;
  rotacion: number;
}

// Mismo tamano, forma, tipo, color y etiqueta; clave nueva, sin id y
// desbloqueada. Nombres en serie sin repetir (Palco 5 -> Palco 6, 7...)
const copiasEn = (
  original: FiguraEditor,
  figuras: FiguraEditor[],
  posiciones: Posicion[],
): FiguraEditor[] => {
  const existentes = [...figuras];
  return posiciones.map((p) => {
    const copia: FiguraEditor = {
      ...original,
      clave: claveNueva(),
      id: undefined,
      bloqueada: false,
      nombre: nombreDeCopia(original.nombre, existentes),
      ...p,
    };
    existentes.push(copia);
    return copia;
  });
};

// No se crean si pasan el tope del recinto o si alguna cae fuera del
// lienzo: se avisa antes, en vez de dejarlas afuera o arrimarlas al borde
const revisar = (
  copias: FiguraEditor[],
  figuras: FiguraEditor[],
  lienzo: TamanoLienzo,
): string | null => {
  const caben = MAXIMO_FIGURAS - figuras.length;
  if (copias.length > caben) {
    return `Un recinto admite hasta ${MAXIMO_FIGURAS} figuras: caben ${caben} más`;
  }
  const fuera = copias.filter(
    (c) => c.x < 0 || c.y < 0 || c.x > lienzo.ancho || c.y > lienzo.alto,
  ).length;
  if (fuera > 0) {
    return `${fuera} ${
      fuera === 1 ? "copia quedaría" : "copias quedarían"
    } fuera del lienzo: baja la cantidad o la separación`;
  }
  return null;
};

// Fila: a continuación de la original, hacia un lado, con la separación
// pedida entre bordes (tamano de la figura ya girada)
export const repetirEnFila = (
  original: FiguraEditor,
  figuras: FiguraEditor[],
  opciones: { cantidad: number; direccion: DireccionFila; espacio: number },
  lienzo: TamanoLienzo,
): ResultadoRepetir => {
  const { mx, my } = mitadesDe(original);
  const horizontal =
    opciones.direccion === "derecha" || opciones.direccion === "izquierda";
  const signo =
    opciones.direccion === "derecha" || opciones.direccion === "abajo" ? 1 : -1;
  const paso = (horizontal ? mx * 2 : my * 2) + opciones.espacio;
  const posiciones = Array.from({ length: opciones.cantidad }, (_, i) => {
    const corrimiento = signo * paso * (i + 1);
    return {
      x: Math.round(original.x + (horizontal ? corrimiento : 0)),
      y: Math.round(original.y + (horizontal ? 0 : corrimiento)),
      rotacion: original.rotacion,
    };
  });
  const copias = copiasEn(original, figuras, posiciones);
  return { copias, problema: revisar(copias, figuras, lienzo) };
};

// Abanico: un arco alrededor de un centro (normalmente la tarima) que pasa
// por la original; el radio es su distancia al centro. Cada copia gira lo
// mismo que avanza en el arco: si la original mira a la tarima, todas
// miran a la tarima. "angulo" es lo que abarcan las copias
export const repetirEnAbanico = (
  original: FiguraEditor,
  figuras: FiguraEditor[],
  opciones: {
    cantidad: number;
    angulo: number;
    sentido: Sentido;
    centro: { x: number; y: number };
  },
  lienzo: TamanoLienzo,
): ResultadoRepetir => {
  const dx = original.x - opciones.centro.x;
  const dy = original.y - opciones.centro.y;
  const radio = Math.hypot(dx, dy);
  if (radio < 1) {
    return {
      copias: [],
      problema:
        "La figura está justo en el centro del arco: muévela hacia afuera",
    };
  }
  const inicio = Math.atan2(dy, dx);
  // En pantalla la y crece hacia abajo: sumar grados es girar en horario
  const paso =
    (opciones.angulo / opciones.cantidad) *
    (opciones.sentido === "horario" ? 1 : -1);
  const posiciones = Array.from({ length: opciones.cantidad }, (_, i) => {
    const giro = paso * (i + 1);
    const rad = inicio + (giro * Math.PI) / 180;
    return {
      x: Math.round(opciones.centro.x + radio * Math.cos(rad)),
      y: Math.round(opciones.centro.y + radio * Math.sin(rad)),
      rotacion: normalizarRotacion(original.rotacion + giro),
    };
  });
  const copias = copiasEn(original, figuras, posiciones);
  return { copias, problema: revisar(copias, figuras, lienzo) };
};

// Centro sugerido para el abanico: la referencia más grande (la tarima)
export const referenciaMasGrande = (figuras: FiguraEditor[]) =>
  figuras
    .filter((f) => f.tipo === "REFERENCIA")
    .sort((a, b) => b.ancho * b.alto - a.ancho * a.alto)[0] ?? null;
