/**
 * Función para enmascarar números de teléfono basada en permisos del usuario
 * @param phone - Número de teléfono
 * @param options - Opciones de visibilidad
 * @returns Teléfono completo o enmascarado según permisos
 */
export interface PhoneVisibilityOptions {
  isAdmin?: boolean;
  isCompanyOwner?: boolean;
  hasActiveRelation?: boolean;
  isInternalProcess?: boolean;
  isSuarecModule?: boolean;
  currentUserId?: number;
  companyOwnerId?: number;
  userRoles?: string[];
}

export const maskPhone = (
  phone: string,
  options?: PhoneVisibilityOptions,
): string => {
  if (!phone || phone.length <= 4) return phone;

  // Si no se proporcionan opciones, enmascarar por defecto
  if (!options) {
    const visibleStart = phone.slice(0, 3);
    const visibleEnd = phone.slice(-2);
    const maskedLength = phone.length - 5;
    return `${visibleStart}${"*".repeat(maskedLength)}${visibleEnd}`;
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

  // El teléfono completo es visible para:
  if (
    isUserAdmin || // Administrador
    isOwner || // Propietario de la empresa
    hasActiveRelation || // Usuario con relación activa
    isInternalProcess || // Procesos internos (pagos, facturación, validaciones)
    isSuarecModule // Módulos internos de SUAREC
  ) {
    return phone; // Mostrar teléfono completo
  }

  // En caso contrario, enmascarar
  // Formato: 300****45 (muestra primeros 3 dígitos y últimos 2)
  const visibleStart = phone.slice(0, 3);
  const visibleEnd = phone.slice(-2);
  const maskedLength = phone.length - 5;
  return `${visibleStart}${"*".repeat(maskedLength)}${visibleEnd}`;
};
