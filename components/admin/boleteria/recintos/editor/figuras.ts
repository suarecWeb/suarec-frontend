import {
  Recinto,
  RecintoFigura,
  RecintoFiguraTipo,
  RecintoFiguraForma,
  FiguraAGuardar,
} from "@/interfaces/recinto.interface";

// Figura tal como la maneja el editor mientras se dibuja. Misma
// convencion que el backend (ver RecintoFigura): x, y = centro
export interface FiguraEditor {
  // Id local estable: las figuras nuevas aun no tienen id del backend
  clave: string;
  id?: number;
  tipo: RecintoFiguraTipo;
  forma: RecintoFiguraForma;
  nombre: string;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  rotacion: number;
  color: string;
  etiquetaRotada: boolean;
  // No se mueve, estira, rota ni borra por accidente (como Canva)
  bloqueada: boolean;
}

export const TAMANO_MINIMO = 10;
export const NOMBRE_MAXIMO = 100; // MaxLength del DTO del backend
export const COLOR_PALCO = "#097EEC";

// Unica aunque se recargue la pagina: las figuras recuperadas de un
// borrador conservan su clave y un contador reiniciado podria repetirla
export const claveNueva = () =>
  `nueva-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const desdeBackend = (f: RecintoFigura): FiguraEditor => ({
  clave: `fig-${f.id}`,
  id: f.id,
  tipo: f.tipo,
  forma: f.forma,
  nombre: f.nombre,
  x: f.x,
  y: f.y,
  ancho: f.ancho,
  alto: f.alto,
  rotacion: f.rotacion,
  color: f.color,
  etiquetaRotada: f.etiquetaRotada,
  bloqueada: f.bloqueada ?? false,
});

// Las figuras guardadas de un recinto, en el orden en que se crearon
export const figurasDelRecinto = (recinto: Recinto): FiguraEditor[] =>
  [...(recinto.figuras ?? [])]
    .sort((a, b) => a.zIndex - b.zIndex || a.id - b.id)
    .map(desdeBackend);

// Lo que se envia al backend: sin la clave local (el DTO rechaza campos
// de mas) y con el nombre sin espacios sobrantes
export const aEnvio = (f: FiguraEditor): FiguraAGuardar => ({
  ...(f.id !== undefined ? { id: f.id } : {}),
  tipo: f.tipo,
  forma: f.forma,
  nombre: f.nombre.trim(),
  x: f.x,
  y: f.y,
  ancho: f.ancho,
  alto: f.alto,
  rotacion: f.rotacion,
  color: f.color,
  etiquetaRotada: f.etiquetaRotada,
  // Siempre se manda: el backend lo guarda tal cual
  bloqueada: f.bloqueada,
});

export interface Lienzo {
  ancho: number;
  alto: number;
}

// El centro de una figura nunca queda fuera del lienzo: la app dibuja
// solo el lienzo, y un palco afuera quedaria invisible o cortado
export const limitarAlLienzo = (
  punto: { x: number; y: number },
  lienzo: Lienzo,
) => ({
  x: Math.min(Math.max(Math.round(punto.x), 0), lienzo.ancho),
  y: Math.min(Math.max(Math.round(punto.y), 0), lienzo.alto),
});

// Orden de dibujo: primero las referencias, encima los palcos. Asi una
// zona nunca tapa un palco y en la app el palco siempre se puede tocar
// (RN-04). Dentro de cada grupo, en el orden en que se crearon
export const ordenDeDibujo = (figuras: FiguraEditor[]) => [
  ...figuras.filter((f) => f.tipo !== "PALCO"),
  ...figuras.filter((f) => f.tipo === "PALCO"),
];

// Grados enteros entre 0 y 359 (el backend guarda enteros)
export const normalizarRotacion = (grados: number) =>
  ((Math.round(grados) % 360) + 360) % 360;

// "Palco N" con el siguiente numero libre, para no escribir a mano
export const siguienteNombrePalco = (figuras: FiguraEditor[]) => {
  const numeros = figuras
    .map((f) => /^palco\s+(\d+)$/i.exec(f.nombre.trim()))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[1]));
  return `Palco ${numeros.length ? Math.max(...numeros) + 1 : 1}`;
};

// Nombre de una copia, sin repetir ninguno del recinto (el backend no
// deja nombres repetidos). Si termina en numero sigue la serie desde el
// mas alto ("Palco 12" -> "Palco 41" si ya hay hasta el 40); si no,
// agrega un numero ("Tarima" -> "Tarima 2")
export const nombreDeCopia = (nombre: string, figuras: FiguraEditor[]) => {
  const limpio = nombre.trim();
  const conNumero = /^(.*?)(\d+)$/.exec(limpio);
  const prefijo = conNumero ? conNumero[1] : `${limpio} `;
  const usados = new Set(figuras.map((f) => f.nombre.trim().toLowerCase()));
  const numerosDeLaSerie = figuras
    .map((f) => f.nombre.trim())
    .filter((n) => n.toLowerCase().startsWith(prefijo.toLowerCase()))
    .map((n) => Number(n.slice(prefijo.length)))
    .filter((n) => Number.isInteger(n) && n > 0);

  let numero =
    Math.max(conNumero ? Number(conNumero[2]) : 1, ...numerosDeLaSerie) + 1;
  while (usados.has(`${prefijo}${numero}`.toLowerCase())) numero++;
  return `${prefijo}${numero}`.slice(0, NOMBRE_MAXIMO);
};

// Una copia de la figura: identica pero nueva (sin id, clave propia),
// corrida en diagonal para que se vea que es otra y siempre dentro del
// lienzo. "veces" = cuantas copias seguidas van, para que no se apilen
export const copiaDeFigura = (
  original: FiguraEditor,
  figuras: FiguraEditor[],
  lienzo: Lienzo,
  veces: number,
): FiguraEditor => {
  const corrimiento =
    Math.round(Math.min(lienzo.ancho, lienzo.alto) * 0.02) * veces;
  return {
    ...original,
    id: undefined,
    clave: claveNueva(),
    // La copia sale desbloqueada, para poder acomodarla
    bloqueada: false,
    nombre: nombreDeCopia(original.nombre, figuras),
    ...limitarAlLienzo(
      { x: original.x + corrimiento, y: original.y + corrimiento },
      lienzo,
    ),
  };
};

// Copias de un grupo: todas corridas igual (el grupo conserva su forma) y
// con nombres que no chocan ni con el recinto ni entre ellas
export const copiasDeFiguras = (
  originales: FiguraEditor[],
  figuras: FiguraEditor[],
  lienzo: Lienzo,
  veces: number,
): FiguraEditor[] => {
  const existentes = [...figuras];
  return originales.map((original) => {
    const copia = copiaDeFigura(original, existentes, lienzo, veces);
    existentes.push(copia);
    return copia;
  });
};

// RN-05 tal como lo valida HOY el backend: nombre obligatorio y unico
// entre TODAS las figuras del recinto, no solo palcos. Aqui sin distinguir
// mayusculas (un poco mas estricto), para que guardar no falle. Ademas,
// el centro dentro del lienzo (figuras viejas o creadas por API)
export const validarFiguras = (
  figuras: FiguraEditor[],
  lienzo: Lienzo,
): Record<string, string> => {
  const conteo = new Map<string, number>();
  figuras.forEach((f) => {
    const nombre = f.nombre.trim().toLowerCase();
    if (nombre) conteo.set(nombre, (conteo.get(nombre) ?? 0) + 1);
  });

  const errores: Record<string, string> = {};
  figuras.forEach((f) => {
    const nombre = f.nombre.trim();
    if (!nombre) errores[f.clave] = "El nombre es obligatorio";
    else if (nombre.length > NOMBRE_MAXIMO)
      errores[f.clave] = `Máximo ${NOMBRE_MAXIMO} caracteres`;
    else if ((conteo.get(nombre.toLowerCase()) ?? 0) > 1)
      errores[f.clave] = "Otra figura ya tiene este nombre";
    else if (f.x < 0 || f.y < 0 || f.x > lienzo.ancho || f.y > lienzo.alto)
      errores[f.clave] = "Está fuera del lienzo: arrástrala adentro";
  });
  return errores;
};

const aRgb = (hex: string): [number, number, number] | null => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// Las referencias se ven "apagadas" (RN-04): mismo color, transparente
export const rellenoDe = (figura: FiguraEditor): string => {
  if (figura.tipo === "PALCO") return figura.color;
  const rgb = aRgb(figura.color);
  return rgb ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.3)` : figura.color;
};

// Texto negro o blanco segun el fondo, para que el nombre se lea
export const colorDeTexto = (figura: FiguraEditor): string => {
  const rgb = aRgb(figura.color);
  if (figura.tipo !== "PALCO" || !rgb) return "#111827";
  const luminancia = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return luminancia > 0.6 ? "#111827" : "#ffffff";
};
