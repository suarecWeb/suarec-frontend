// Direcciones de "Gestion de palcos"
export const RUTA_TAB_PALCOS = "/admin/boleteria/ferias?tab=gestion-palcos";

// Junto a crear y editar: todo lo de un evento digital vive en
// /admin/boleteria/digital/eventos/[eventoId]/
export const rutaPalcosEvento = (eventoId: number, palcoId?: number | null) =>
  `/admin/boleteria/digital/eventos/${eventoId}/gestion-de-palcos${palcoId ? `?palco=${palcoId}` : ""}`;
