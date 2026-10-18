// Pagina de crear y editar evento DIGITAL (reemplaza las ventanas; los
// eventos fisicos siguen con su ventana). ?volver= lleva de vuelta a donde
// se toco el boton
export const RUTA_BOLETERIA_DIGITAL = "/admin/boleteria/digital";

const conVolver = (ruta: string, volver?: string, feriaId?: number) => {
  const q = new URLSearchParams();
  if (volver) q.set("volver", volver);
  if (feriaId) q.set("feria", String(feriaId));
  const texto = q.toString();
  return texto ? `${ruta}?${texto}` : ruta;
};

// feriaId: se entra desde una feria y llega ya elegida
export const rutaCrearEvento = (volver?: string, feriaId?: number) =>
  conVolver(`${RUTA_BOLETERIA_DIGITAL}/eventos/crear`, volver, feriaId);

export const rutaEditarEvento = (eventoId: number, volver?: string) =>
  conVolver(`${RUTA_BOLETERIA_DIGITAL}/eventos/${eventoId}/editar`, volver);

// La pagina actual, para volver a ella despues de guardar
export const paginaActual = () =>
  typeof window === "undefined"
    ? undefined
    : `${window.location.pathname}${window.location.search}`;

// Solo rutas del panel admin: ?volver= viene en la URL y no puede mandar a
// otro sitio ("//otro.com", "https://...")
export const volverSeguro = (volver?: string | null) =>
  volver && volver.startsWith("/admin/") && !volver.startsWith("//")
    ? volver
    : RUTA_BOLETERIA_DIGITAL;
