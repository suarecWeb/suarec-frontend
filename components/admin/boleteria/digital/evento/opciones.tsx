import { ReactNode } from "react";
import {
  Armchair,
  LucideIcon,
  Monitor,
  Smartphone,
  Star,
  User,
} from "lucide-react";
import { EventoEstado, EventoTipo } from "@/interfaces/event.interface";

// Las mismas opciones que tenian las ventanas de crear y editar evento

export const ESTADO_CONFIG: Record<
  EventoEstado,
  { label: string; color: string }
> = {
  [EventoEstado.PREVENTA]: {
    label: "Preventa",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  [EventoEstado.VENTA]: {
    label: "Venta",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  [EventoEstado.CERRADO]: {
    label: "Cerrado",
    color: "bg-gray-100 text-gray-600 border-gray-200",
  },
  [EventoEstado.CANCELADO]: {
    label: "Cancelado",
    color: "bg-red-100 text-red-600 border-red-200",
  },
};

export interface FormatoImagen {
  id: number;
  label: string;
  resolution: string;
  ratio: string;
  width: string;
  icon: ReactNode;
}

// Mismos ids que la ventana; en el orden del boceto (Web, Móvil). El
// ancho es el de la caja de imagen a la izquierda de los datos
export const FORMAT_OPTIONS: FormatoImagen[] = [
  {
    id: 2,
    label: "Web",
    resolution: "1280 × 720 px",
    ratio: "aspect-video",
    width: "w-full",
    icon: <Monitor className="h-4 w-4" />,
  },
  {
    id: 1,
    label: "Móvil",
    resolution: "1080 × 1920 px",
    ratio: "aspect-[9/16]",
    width: "w-32 mx-auto",
    icon: <Smartphone className="h-4 w-4" />,
  },
];

export const TIPO_OPCIONES: {
  tipo: EventoTipo;
  label: string;
  icon: ReactNode;
}[] = [
  {
    tipo: EventoTipo.GENERAL,
    label: "General",
    icon: <User className="h-4 w-4" />,
  },
  { tipo: EventoTipo.VIP, label: "VIP", icon: <Star className="h-4 w-4" /> },
  {
    tipo: EventoTipo.PALCO,
    label: "Palco",
    icon: <Armchair className="h-4 w-4" />,
  },
  {
    tipo: EventoTipo.PALCO_INDIVIDUAL,
    label: "Palco individual",
    icon: <Armchair className="h-4 w-4" />,
  },
];

// El tipo de boleta, con borde para no confundirlo con el estado. Lo usan
// el tablero de Ferias y las tarjetas de Estadísticas
export const TIPO_CONFIG: Record<
  EventoTipo,
  { label: string; icon: LucideIcon; color: string }
> = {
  [EventoTipo.GENERAL]: {
    label: "General",
    icon: User,
    color: "border-gray-200 text-gray-600",
  },
  [EventoTipo.VIP]: {
    label: "VIP",
    icon: Star,
    color: "border-amber-200 text-amber-700",
  },
  [EventoTipo.PALCO]: {
    label: "Palco",
    icon: Armchair,
    color: "border-purple-200 text-purple-700",
  },
  [EventoTipo.PALCO_INDIVIDUAL]: {
    label: "Palco individual",
    icon: Armchair,
    color: "border-indigo-200 text-indigo-700",
  },
};

// Mínimo de lo que se cobra por la pasarela (precio base y precio de cada
// palco): cobra un costo por cada transacción, así que no puede ser gratis.
// Igual que el backend (PRECIO_MINIMO_DIGITAL)
export const PRECIO_MINIMO = 10_000;

export const formatPriceDisplay = (value: number | undefined): string =>
  value !== undefined ? value.toLocaleString("es-CO") : "";

export const parsePriceInput = (raw: string): number | undefined => {
  const cleaned = raw.replace(/\./g, "");
  const num = Number(cleaned);
  return cleaned === "" ? undefined : isNaN(num) ? undefined : num;
};

// Clases de un campo de texto, en rojo si tiene error
export const claseCampo = (conError?: boolean) =>
  `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#097EEC]/20 focus:border-[#097EEC] ${
    conError
      ? "border-red-400 bg-red-50"
      : "border-gray-200 bg-gray-50 focus:bg-white"
  }`;

export const claseEtiqueta = "block text-xs font-medium text-gray-600 mb-1";
