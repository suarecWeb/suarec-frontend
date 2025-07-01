/**
 * Formatea un número o string a moneda colombiana (COP)
 * @param value - Número o string a formatear
 * @param options - Opciones de formateo
 * @returns String formateado como moneda COP
 */
interface FormatCurencyOptions {
  /** Mostrar símbolo de peso ($). Default: true */
  showSymbol?: boolean;
  /** Mostrar código de moneda (COP). Default: false */
  showCurrency?: boolean;
  /** Número de decimales. Default: 0 para pesos */
  decimals?: number;
  /** Usar formato compacto (K, M, B). Default: false */
  compact?: boolean;
  /** Mostrar "peso" o "pesos" en texto. Default: false */
  showText?: boolean;
}

export const formatCurrency = (
  value: number | string | null | undefined,
  options: FormatCurencyOptions = {}
): string => {
  const {
    showSymbol = true,
    showCurrency = false,
    decimals = 0,
    compact = false,
    showText = false
  } = options;

  // Manejar valores nulos o indefinidos
  if (value === null || value === undefined || value === '') {
    return showSymbol ? '$0' : '0';
  }

  // Convertir a número
  let numValue: number;
  if (typeof value === 'string') {
    // Limpiar string: remover todo excepto números, puntos y comas
    const cleanValue = value.replace(/[^\d.-]/g, '');
    numValue = parseFloat(cleanValue);
  } else {
    numValue = value;
  }

  // Validar que sea un número válido
  if (isNaN(numValue)) {
    return showSymbol ? '$0' : '0';
  }

  // Formato compacto (K, M, B)
  if (compact) {
    return formatCompactCOP(numValue, showSymbol);
  }

  // Formatear usando Intl.NumberFormat para Colombia
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  let formatted = formatter.format(numValue);

  // Personalizar el resultado según las opciones
  if (!showSymbol && !showCurrency) {
    // Solo el número con puntuación
    formatted = formatted.replace(/[$COP\s]/g, '').trim();
  } else if (!showSymbol && showCurrency) {
    // Número + COP
    formatted = formatted.replace('$', '').trim() + ' COP';
  } else if (showSymbol && showCurrency) {
    // $ + número + COP
    formatted = formatted + ' COP';
  }
  // Si showSymbol es true y showCurrency es false, usar el formato por defecto

  // Agregar texto "peso/pesos"
  if (showText) {
    const textSuffix = Math.abs(numValue) === 1 ? ' peso' : ' pesos';
    formatted += textSuffix;
  }

  return formatted;
};

/**
 * Formato compacto para números grandes
 */
const formatCompactCOP = (value: number, showSymbol: boolean): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const symbol = showSymbol ? '$' : '';

  if (abs >= 1e12) {
    return `${sign}${symbol}${(abs / 1e12).toFixed(1)}B`;
  } else if (abs >= 1e9) {
    return `${sign}${symbol}${(abs / 1e9).toFixed(1)}M`;
  } else if (abs >= 1e6) {
    return `${sign}${symbol}${(abs / 1e6).toFixed(1)}M`;
  } else if (abs >= 1e3) {
    return `${sign}${symbol}${(abs / 1e3).toFixed(1)}K`;
  } else {
    return formatCurrency(value, { showSymbol, compact: false });
  }
};