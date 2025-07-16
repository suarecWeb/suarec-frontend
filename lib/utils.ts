import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Función para traducir unidades de precio de inglés a español
export function translatePriceUnit(priceUnit: string): string {
  const translations: { [key: string]: string } = {
    hour: "hora",
    project: "proyecto",
    event: "evento",
    monthly: "mensual",
    daily: "diario",
    weekly: "semanal",
    piece: "pieza",
    service: "servicio",
  };

  return translations[priceUnit] || priceUnit;
}

// Función para obtener la URL pública de una imagen desde Supabase
export function getPublicUrl(imagePath: string): string {
  // Si la imagen ya es una URL completa, la devolvemos tal como está
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Si es una ruta relativa, construimos la URL completa de Supabase
  const supabaseUrl =
    "https://xkwybhxcytfhnqrdvcel.supabase.co/storage/v1/object/public/suarec-media";

  // Removemos el prefijo 'suarec-media/' si ya está incluido
  const cleanPath = imagePath.replace(/^suarec-media\//, "");

  return `${supabaseUrl}/${cleanPath}`;
}
