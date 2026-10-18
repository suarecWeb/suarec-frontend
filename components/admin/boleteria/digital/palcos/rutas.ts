// Direcciones de "Gestion de palcos"
export const RUTA_TAB_PALCOS = "/admin/boleteria/ferias?tab=gestion-palcos";

// Junto a crear y editar: todo lo de un evento digital vive en
// /admin/boleteria/digital/eventos/[eventoId]/
// Es la pestaña "Gestión de palcos" del evento; ?volver= viaja entre las
// pestañas para que la flecha regrese a donde se entró
export const rutaPalcosEvento = (
  eventoId: number,
  palcoId?: number | null,
  volver?: string,
) => {
  const q = new URLSearchParams();
  if (palcoId) q.set("palco", String(palcoId));
  if (volver) q.set("volver", volver);
  const texto = q.toString();
  return `/admin/boleteria/digital/eventos/${eventoId}/gestion-de-palcos${texto ? `?${texto}` : ""}`;
};
