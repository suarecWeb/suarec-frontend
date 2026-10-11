// Página pública del enlace compartido de un evento (roadmap
// compartir-publicacion-evento-enlace, 7.2). Server Component con
// generateMetadata: es lo que genera el preview (título, descripción,
// imagen) cuando el enlace se pega en WhatsApp/redes (RF-6).
// Vista de SOLO LECTURA — comprar y gestionar solo en la app (ADR-2).
import type { Metadata } from "next";
import { getPublicEvento } from "@/lib/public-api";
import EventoPublicView from "@/components/public/EventoPublicView";
import EventoNoDisponible from "@/components/public/EventoNoDisponible";

interface EventoPublicPageProps {
  params: { id: string };
}

const truncate = (text: string, max = 160): string =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

export async function generateMetadata({
  params,
}: EventoPublicPageProps): Promise<Metadata> {
  const evento = await getPublicEvento(params.id);

  if (!evento || !evento.visible || evento.modalidad === "FISICO") {
    return {
      title: "Evento en SUAREC",
      description:
        "Mira este evento en SUAREC. Descarga la app para comprar boletas y vivir la experiencia completa.",
    };
  }

  const description = evento.descripcion
    ? truncate(evento.descripcion)
    : `${evento.nombre} — evento en SUAREC. Descarga la app para comprar boletas.`;

  return {
    title: `${evento.nombre} | SUAREC`,
    description,
    openGraph: {
      title: evento.nombre,
      description,
      type: "website",
      locale: "es_ES",
      images: evento.imagenUrl ? [{ url: evento.imagenUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: evento.nombre,
      description,
      images: evento.imagenUrl ? [evento.imagenUrl] : undefined,
    },
  };
}

export default async function EventoPublicPage({
  params,
}: EventoPublicPageProps) {
  const evento = await getPublicEvento(params.id);

  // RF-5: contenido eliminado, oculto (visible=false — el detalle del
  // backend no lo filtra), físico o fallo del endpoint -> estado legible
  // con CTA de descarga, nunca pantalla rota.
  if (!evento || !evento.visible || evento.modalidad === "FISICO") {
    return <EventoNoDisponible />;
  }

  return <EventoPublicView evento={evento} />;
}
