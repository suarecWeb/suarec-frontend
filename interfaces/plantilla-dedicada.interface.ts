export type ClaveCampoDedicada =
  | "imagenTitulo"
  | "imagenArtista"
  | "imagenNombreArtista"
  | "tipoBoleta"
  | "descripcion"
  | "fecha"
  | "hora"
  | "lugar"
  | "qrId"
  | "qr"
  | "precio"
  | "fechaCompra"
  | "logoPatrocinadores";

export type ClaveImagenBoletaDedicada =
  | "imagenTitulo"
  | "imagenArtista"
  | "imagenNombreArtista";

// Región visible de la imagen fuente, en fracciones 0..1 de su propio
// ancho/alto. Recorta la IMAGEN, no la caja: la caja del campo conserva su
// posición y tamaño. Va por evento (Evento.boletaImagenesRecorte) porque el
// encuadre depende de la foto concreta. Debe coincidir con RecorteImagen del
// backend (plantilla-boleta-dedicada.entity.ts).
export interface RecorteImagen {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const RECORTE_COMPLETO: RecorteImagen = { x: 0, y: 0, w: 1, h: 1 };

export function esRecorteCompleto(recorte?: RecorteImagen | null): boolean {
  if (!recorte) return true;
  return recorte.x <= 0 && recorte.y <= 0 && recorte.w >= 1 && recorte.h >= 1;
}

export interface CampoPlantillaDedicada {
  clave: ClaveCampoDedicada;
  activo: boolean;
  xMm: number;
  yMm: number;
  anchoMm: number;
  altoMm: number;
  fontSize: number;
  alineacion: "izquierda" | "centro" | "derecha";
  negrita: boolean;
  mayusculas: boolean;
}

export interface PlantillaDedicada {
  margenMm: number;
  activa: boolean;
  anchoMm: number;
  altoMm: number;
  campos: CampoPlantillaDedicada[];
}

// Contrato del backend: se reenvía íntegro al agente, sin transformar.
export interface PayloadImpresionDedicada {
  imagenes?: Record<string, string>;
  // Encuadre de cada imagen (fracciones 0..1 de la imagen fuente). El agente
  // recorta ANTES de encajar en la caja; una ranura sin entrada usa la imagen
  // completa.
  recortes?: Record<string, RecorteImagen>;
  impresora: {
    anchoMm: number;
    altoMm: number;
    sensor: "black_mark";
    metodo: "termica_directa";
    direccion: 1;
  };
  campos: CampoPlantillaDedicada[];
  boletas: Array<{ qrValue: string; valores: Record<string, string> }>;
}
