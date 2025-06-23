import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para traducir unidades de precio de inglés a español
export function translatePriceUnit(priceUnit: string): string {
  const translations: { [key: string]: string } = {
    'hour': 'hora',
    'project': 'proyecto',
    'event': 'evento',
    'monthly': 'mensual',
    'daily': 'diario',
    'weekly': 'semanal',
    'piece': 'pieza',
    'service': 'servicio'
  };
  
  return translations[priceUnit] || priceUnit;
}
