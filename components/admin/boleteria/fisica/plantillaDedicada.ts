import {
  CampoPlantillaDedicada,
  ClaveImagenBoletaDedicada,
  ClaveCampoDedicada,
  PlantillaDedicada,
} from "@/interfaces/plantilla-dedicada.interface";

export const DOTS_MM = 8;
// 0 = el arte sangra hasta el borde del papel. Ver CAMPOS_DEFAULT del
// backend: con el desfase físico de la TSC MH241, sangrar se ve mejor que
// dejar franja de papel visible.
export const DEFAULT_MARGIN_MM = 0;
export const MAX_MARGIN_MM = 10;
export const PAPER_WIDTH = 400;
// 152.4 × 8 = 1219.2; la impresora trabaja con dots enteros.
export const PAPER_HEIGHT = 1219;
export const IMAGE_SLOT_KEYS: ClaveImagenBoletaDedicada[] = [
  "imagenTitulo",
  "imagenArtista",
  "imagenNombreArtista",
];

// Formato recomendado del archivo a subir por ranura (mm), definido por
// producto 2026-11-18. Si la foto no trae esta proporción, el encuadre se
// ajusta con la herramienta de recorte (click derecho sobre la imagen).
// OJO: si cambian las cajas de la plantilla global, actualizar estos valores.
export const FORMATO_RECOMENDADO_IMAGEN: Partial<
  Record<ClaveImagenBoletaDedicada, { anchoMm: number; altoMm: number }>
> = {
  imagenTitulo: { anchoMm: 46.5, altoMm: 37.3 },
  imagenArtista: { anchoMm: 46.7, altoMm: 49.5 },
  imagenNombreArtista: { anchoMm: 46.4, altoMm: 15.7 },
};
export function isImageField(clave: ClaveCampoDedicada): boolean {
  return (
    clave === "logoPatrocinadores" ||
    IMAGE_SLOT_KEYS.includes(clave as ClaveImagenBoletaDedicada)
  );
}

export const FIELD_LABELS: Record<ClaveCampoDedicada, string> = {
  imagenTitulo: "Título del evento (imagen)",
  imagenArtista: "Foto del artista",
  imagenNombreArtista: "Nombre del artista (imagen)",
  tipoBoleta: "Tipo de boleta",
  descripcion: "Descripción",
  fecha: "Fecha",
  hora: "Hora",
  lugar: "Lugar",
  qrId: "Identificador QR",
  qr: "QR",
  precio: "Precio",
  fechaCompra: "Fecha de compra",
  logoPatrocinadores: "Logo patrocinadores (beta)",
};
// Distribución inicial del editor; Guardar la publica como plantilla global.
export function createDefaultTemplate(): PlantillaDedicada {
  const fields: Array<
    [
      ClaveCampoDedicada,
      number,
      number,
      number,
      number,
      number,
      CampoPlantillaDedicada["alineacion"],
      boolean,
      boolean,
      boolean,
    ]
  > = [
    // Boleta solo-imagen con sangrado completo (calibrado en papel real
    // 2026-11-17). Debe coincidir con CAMPOS_DEFAULT del backend
    // (plantilla-boleta-dedicada.service.ts): el backend es la fuente de
    // verdad, esto es el espejo para "Restaurar default" del editor.
    ["imagenTitulo", 0, 4, 50, 26, 1, "centro", false, false, true],
    ["imagenArtista", 0, 32, 50, 62, 1, "centro", false, false, true],
    ["imagenNombreArtista", 0, 96, 50, 20, 1, "centro", false, false, true],
    ["qr", 14.5, 120, 21, 21, 6, "centro", false, false, true],
    // Texto activo (2026-11-18): tipo de boleta entre el nombre y el QR;
    // folio y fecha debajo del QR, como en el POS. Son campos de TEXTO: la
    // caja es la referencia de dónde se inyecta el valor real al vender.
    ["tipoBoleta", 3, 116.5, 44, 3.5, 2, "centro", true, true, true],
    ["qrId", 3, 141.5, 44, 3.5, 1, "centro", false, false, true],
    ["fecha", 3, 145.5, 44, 5, 2, "centro", false, true, true],
    // Texto apagado; las coordenadas pueden solapar a los activos: al
    // activarlos, reubicarlos en el editor.
    ["precio", 3, 147, 21, 5, 2, "izquierda", true, false, false],
    ["fechaCompra", 26, 147, 21, 5, 1, "derecha", false, false, false],
    ["descripcion", 3, 106, 44, 8, 2, "centro", true, true, false],
    ["hora", 3, 146, 21, 4, 1, "izquierda", false, false, false],
    ["lugar", 26, 146, 21, 4, 1, "derecha", false, false, false],
    ["logoPatrocinadores", 3, 96, 44, 5, 1, "centro", false, false, false],
  ];
  return {
    margenMm: DEFAULT_MARGIN_MM,
    activa: false,
    anchoMm: 50,
    altoMm: 152.4,
    campos: fields.map(
      ([
        clave,
        xMm,
        yMm,
        anchoMm,
        altoMm,
        fontSize,
        alineacion,
        negrita,
        mayusculas,
        activo,
      ]) => ({
        clave,
        activo,
        xMm,
        yMm,
        anchoMm,
        altoMm,
        fontSize,
        alineacion,
        negrita,
        mayusculas,
      }),
    ),
  };
}

export function normalizeMarginMm(value: number = DEFAULT_MARGIN_MM): number {
  return Number.isFinite(value)
    ? Math.max(0, Math.min(MAX_MARGIN_MM, value))
    : DEFAULT_MARGIN_MM;
}

export function constrainField(
  field: CampoPlantillaDedicada,
  margenMm = DEFAULT_MARGIN_MM,
): CampoPlantillaDedicada {
  const margin = normalizeMarginMm(margenMm);
  const width = PAPER_WIDTH / DOTS_MM;
  const height = PAPER_HEIGHT / DOTS_MM;
  const anchoMm = Math.max(
    1 / DOTS_MM,
    Math.min(width - margin * 2, field.anchoMm),
  );
  const altoMm = Math.max(
    1 / DOTS_MM,
    Math.min(height - margin * 2, field.altoMm),
  );
  return {
    ...field,
    anchoMm,
    altoMm,
    xMm: Math.max(margin, Math.min(width - margin - anchoMm, field.xMm)),
    yMm: Math.max(margin, Math.min(height - margin - altoMm, field.yMm)),
  };
}

export const FONT_PREVIEW_PX = [0, 12, 20, 24, 32, 48, 19, 27, 25];
