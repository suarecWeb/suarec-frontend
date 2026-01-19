/**
 * Función para enmascarar el NIT basada en permisos del usuario
 * @param nit - Número de identificación tributaria
 * @param options - Opciones de visibilidad
 * @returns NIT completo o enmascarado según permisos
 */
export interface NitVisibilityOptions {
  isAdmin?: boolean;
  isCompanyOwner?: boolean;
  hasActiveRelation?: boolean;
  isInternalProcess?: boolean;
  isSuarecModule?: boolean;
  currentUserId?: number;
  companyOwnerId?: number;
  userRoles?: string[];
}

export const maskNit = (
  nit: string,
  options?: NitVisibilityOptions,
): string => {
  if (!nit || nit.length <= 4) return nit;

  // Si no se proporcionan opciones, enmascarar por defecto
  if (!options) {
    const visiblePart = nit.slice(0, -4);
    return `${visiblePart}***-*`;
  }

  const {
    isAdmin = false,
    isCompanyOwner = false,
    hasActiveRelation = false,
    isInternalProcess = false,
    isSuarecModule = false,
    currentUserId,
    companyOwnerId,
    userRoles = [],
  } = options;

  // Verificar si es administrador
  const isUserAdmin =
    isAdmin || userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");

  // Verificar si es propietario de la empresa
  const isOwner =
    isCompanyOwner ||
    (currentUserId && companyOwnerId && currentUserId === companyOwnerId);

  // El NIT completo es visible para:
  if (
    isUserAdmin || // Administrador
    isOwner || // Propietario de la empresa
    hasActiveRelation || // Usuario con relación activa
    isInternalProcess || // Procesos internos (pagos, facturación, validaciones)
    isSuarecModule // Módulos internos de SUAREC
  ) {
    return nit; // Mostrar NIT completo
  }

  // En caso contrario, enmascarar
  const visiblePart = nit.slice(0, -4);
  return `${visiblePart}***-*`;
};
