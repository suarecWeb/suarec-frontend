// Capa de datos server-side para las vistas públicas de enlaces
// compartidos (roadmap compartir-publicacion-evento-enlace, 7.2).
// Primer fetcher server-side del repo: el resto de la app usa axios
// client-side, pero las páginas públicas necesitan generateMetadata
// (OG dinámico) y eso solo existe en Server Components.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// URLs de tiendas para el CTA de descarga. Única fuente — nada de
// hardcodearlas en componentes.
export const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.dantesiio.suarecmobile";
// PENDIENTE: reemplazar por la URL real de App Store cuando se tenga el
// id de la app en App Store Connect (mismo bloque de datos que el
// Team ID de los .well-known).
export const APP_STORE_URL = "https://apps.apple.com/co/search?term=suarec";

export interface PublicEventoFormat {
  id: number;
  nombre: string;
  resolucion: string;
  ratio: string;
  descripcion?: string | null;
}

export interface PublicEventoFeria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  fechaInicio: string;
  fechaFin: string;
  ubicacion?: string | null;
  latitud?: string | number | null;
  longitud?: string | number | null;
}

export interface PublicEvento {
  id: number;
  nombre: string;
  descripcion?: string | null;
  fechaEvento: string;
  ubicacion: string;
  imagenUrl?: string | null;
  imagenUrlMobile?: string | null;
  precioBase: number;
  estado: "preventa" | "venta" | "cerrado" | "cancelado";
  tipo?: "GENERAL" | "VIP" | "PALCO" | "PALCO_INDIVIDUAL" | null;
  modalidad: "DIGITAL" | "FISICO";
  visible: boolean;
  aforoTotal: number;
  aforoDisponible: number;
  nombreOrganizador?: string | null;
  comisionEstimada?: number;
  format?: PublicEventoFormat | null;
  feria?: PublicEventoFeria | null;
}

/**
 * Detalle público de un evento para la vista web de solo lectura.
 * Devuelve null ante 404, id inválido o fallo del backend: la página
 * muestra el estado "no disponible" en vez de romperse (RF-5).
 */
export async function getPublicEvento(
  id: string,
): Promise<PublicEvento | null> {
  if (!API_BASE_URL || !/^\d+$/.test(id)) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/suarec/events/${id}`, {
      // El endpoint público ya manda Cache-Control: public, max-age=60;
      // alineamos la revalidación de Next a esa ventana.
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicEvento;
  } catch {
    return null;
  }
}
