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
  nombre: string;
  forma: RecintoFiguraForma;
  x: number;
  y: number;
  ancho: number;
  alto: number;
  rotacion: number;
  color: string;
  // false: el nombre siempre horizontal; true: gira con la figura (PEN-7)
  etiquetaRotada: boolean;
  // 10 en los palcos (RN-01), la asigna el backend; null en referencias
  capacidad: number | null;
  zIndex: number;
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
