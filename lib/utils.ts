import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function canCompleteContract(
  contract: any,
  currentUserId: number,
): boolean {
  if (contract.provider?.id !== currentUserId) {
    return false;
  }

  if (contract.status === "cancelled" || contract.status === "completed") {
    return false;
  }

  if (!contract.agreedDate || !contract.agreedTime) {
    return false;
  }

  const agreedDate = new Date(contract.agreedDate);
  const [hours, minutes] = contract.agreedTime.split(":").map(Number);

  const serviceDateTime = new Date(agreedDate);
  serviceDateTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  return now >= serviceDateTime;
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

// Función para calcular el precio con IVA incluido
export function calculatePriceWithTax(
  basePrice: number | string,
  taxRate: number = 0.19,
): number {
  // Convertir a número si es string
  const price =
    typeof basePrice === "string" ? parseFloat(basePrice) : basePrice;

  // Validar que sea un número válido
  if (isNaN(price) || price < 0) {
    return 0;
  }

  return Math.round(price + price * taxRate);
}

// Configuración escalable para tipos de publicación y sus reglas de IVA
export interface PublicationPriceConfig {
  showTax: boolean;
  taxRate: number;
  description: string;
}

const PUBLICATION_PRICE_CONFIG: Record<string, PublicationPriceConfig> = {
  SERVICE: {
    showTax: true,
    taxRate: 0.19, // 19% IVA para servicios
    description: "Servicios incluyen IVA",
  },
  JOB: {
    showTax: false,
    taxRate: 0,
    description: "Ofertas de trabajo sin IVA",
  },
  // Fácil de extender para nuevos tipos
  PRODUCT: {
    showTax: true,
    taxRate: 0.19,
    description: "Productos incluyen IVA",
  },
};

// Función escalable para obtener el precio de una publicación
export function getPublicationDisplayPrice(
  basePrice: number | string,
  publicationType?: string,
  priceUnit?: string,
): {
  price: number;
  showsTax: boolean;
  taxApplied: number;
} {
  const price =
    typeof basePrice === "string" ? parseFloat(basePrice) : basePrice;

  if (isNaN(price) || price < 0) {
    return {
      price: 0,
      showsTax: false,
      taxApplied: 0,
    };
  }

  // Determinar el tipo si no se proporciona explícitamente
  // Esta lógica se puede remover cuando tengamos el campo `type` en todas las publicaciones
  let resolvedType = publicationType;
  if (!resolvedType) {
    // Fallback temporal basado en priceUnit
    if (
      priceUnit === "hour" ||
      priceUnit === "project" ||
      priceUnit === "service"
    ) {
      resolvedType = "SERVICE";
    } else {
      resolvedType = "JOB";
    }
  }

  // Mapear tipos de servicio a SERVICE para compatibilidad
  if (resolvedType === "SERVICE_REQUEST") {
    resolvedType = "SERVICE";
  }

  const config =
    PUBLICATION_PRICE_CONFIG[resolvedType] || PUBLICATION_PRICE_CONFIG.JOB;

  const finalPrice = config.showTax
    ? calculatePriceWithTax(price, config.taxRate)
    : price;

  return {
    price: finalPrice,
    showsTax: config.showTax,
    taxApplied: config.showTax ? config.taxRate : 0,
  };
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
