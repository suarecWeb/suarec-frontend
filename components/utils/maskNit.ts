/**
 * Función para enmascarar el NIT (ocultar los últimos 4 dígitos)
 * @param nit - Número de identificación tributaria
 * @returns NIT enmascarado con formato: 12345***-*
 */
export const maskNit = (nit: string): string => {
  if (!nit || nit.length <= 4) return nit;
  const visiblePart = nit.slice(0, -4);
  return `${visiblePart}***-*`;
};
