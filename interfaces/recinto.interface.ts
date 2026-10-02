// El dibujo del lugar del evento. Se dibuja una vez y se reutiliza en
// varias ferias (RN-13). El lienzo esta en unidades logicas, no pixeles
// (PEN-25)
export interface Recinto {
  id: number;
  nombre: string;
  descripcion: string | null;
  lienzoAncho: number;
  lienzoAlto: number;
  creadoPorId: number;
  // Solo id y nombre (el backend no manda nada mas del usuario). null si
  // el usuario ya no existe
  creadoPor?: { id: number; name: string } | null;
  // Uno desactivado no se puede asignar a ferias nuevas (RN-23)
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  // Solo viene al pedir un recinto por id
  figuras?: RecintoFigura[];
}

// Solo PALCO se toca en el mapa de la app (RN-04); REFERENCIA es visual
// (tarima, zonas)
export type RecintoFiguraTipo = "PALCO" | "REFERENCIA";
export type RecintoFiguraForma = "RECTANGULO" | "CIRCULO";

// Convencion del dibujo (la app debe pintar igual): x, y = CENTRO de la
// figura en unidades del lienzo; ancho x alto = su tamano (en el circulo
// ancho = alto = diametro); rotacion = grados alrededor del centro
export interface RecintoFigura {
  id: number;
  recintoId: number;
  tipo: RecintoFiguraTipo;
  // Obligatorio en PALCO (RN-05). null = referencia decorativa sin nombre
  // (migracion 065)
  nombre: string | null;
  forma: RecintoFiguraForma;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  rotacion: number;
  color: string;
  // false: el nombre siempre horizontal; true: gira con la figura (PEN-7)
  etiquetaRotada: boolean;
  // Bloqueada en el editor, como "Bloquear" en Canva (migracion 064)
  bloqueada: boolean;
  // 10 en los palcos (RN-01), la asigna el backend; null en referencias
  capacidad: number | null;
  zIndex: number;
}

// Una figura al guardar el dibujo: con id si ya existe, sin id si es nueva
export interface FiguraAGuardar {
  id?: number;
  tipo: RecintoFiguraTipo;
  forma: RecintoFiguraForma;
  nombre: string | null; // null solo en referencias
  x: number;
  y: number;
  ancho: number;
  alto: number;
  rotacion: number;
  color: string;
  etiquetaRotada: boolean;
  bloqueada: boolean;
  // Orden dentro de su grupo (referencias entre si, palcos entre si)
  zIndex: number;
}

// El dibujo COMPLETO: lo que no venga se borra. versionBase = updatedAt del
// recinto al abrirlo (si otro guardo entre medio, el backend responde 409)
export interface GuardarFigurasDto {
  versionBase: string;
  figuras: FiguraAGuardar[];
}

// Un problema devuelto por el backend al guardar. indice = posicion en
// figuras enviadas (null si es una figura que se intento borrar)
export interface ErrorDeFigura {
  indice: number | null;
  id: number | null;
  nombre: string | null;
  mensaje: string;
}

export interface CreateRecintoDto {
  nombre: string;
  descripcion?: string;
  lienzoAncho?: number;
  lienzoAlto?: number;
}

export interface UpdateRecintoDto extends Partial<CreateRecintoDto> {
  activo?: boolean;
}
