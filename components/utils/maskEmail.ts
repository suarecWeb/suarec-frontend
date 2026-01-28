/**
 * Función para enmascarar correos electrónicos basada en permisos del usuario
 * @param email - Correo electrónico
 * @param options - Opciones de visibilidad
 * @returns Email completo o enmascarado según permisos
 */
export interface EmailVisibilityOptions {
  isAdmin?: boolean;
  isCompanyOwner?: boolean;
  hasActiveRelation?: boolean;
  isInternalProcess?: boolean;
  isSuarecModule?: boolean;
  currentUserId?: number;
  companyOwnerId?: number;
  userRoles?: string[];
}

export const maskEmail = (
  email: string,
  options?: EmailVisibilityOptions,
): string => {
  if (!email || !email.includes("@")) return email;

  // Si no se proporcionan opciones, enmascarar por defecto
  if (!options) {
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 2) {
      return `${localPart[0]}***@${domain}`;
    }
    const visibleStart = localPart.slice(0, 2);
    const visibleEnd = localPart.slice(-1);
    const maskedLength = Math.max(3, localPart.length - 3);
    return `${visibleStart}${"*".repeat(maskedLength)}${visibleEnd}@${domain}`;
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

  // El email completo es visible para:
  if (
    isUserAdmin || // Administrador
    isOwner || // Propietario de la empresa
    hasActiveRelation || // Usuario con relación activa
    isInternalProcess || // Procesos internos (pagos, facturación, validaciones)
    isSuarecModule // Módulos internos de SUAREC
  ) {
    return email; // Mostrar email completo
  }

  // En caso contrario, enmascarar
  // Formato: jo***n@example.com (muestra primeros 2 caracteres y último antes del @)
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  const visibleStart = localPart.slice(0, 2);
  const visibleEnd = localPart.slice(-1);
  const maskedLength = Math.max(3, localPart.length - 3);
  return `${visibleStart}${"*".repeat(maskedLength)}${visibleEnd}@${domain}`;
};
