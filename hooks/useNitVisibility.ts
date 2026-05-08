import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { TokenPayload } from "@/interfaces/auth.interface";
import { NitVisibilityOptions } from "@/components/utils/maskNit";
import { UserRelationService } from "@/services/UserRelationService";

interface UseNitVisibilityProps {
  companyId?: string;
  companyOwnerId?: number;
  isInternalProcess?: boolean;
  isSuarecModule?: boolean;
}

export const useNitVisibility = ({
  companyId,
  companyOwnerId,
  isInternalProcess = false,
  isSuarecModule = false,
}: UseNitVisibilityProps = {}) => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [hasActiveRelation, setHasActiveRelation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const decoded = jwtDecode<TokenPayload>(token);
        setCurrentUserId(decoded.id);
        setUserRoles(decoded.roles.map((role) => role.name));

        // Verificar relación activa con la empresa
        if (companyId && decoded.id) {
          try {
            const relationResponse =
              await UserRelationService.hasActiveRelationWithCompany(
                decoded.id,
                companyId,
              );
            setHasActiveRelation(relationResponse.data.hasActiveRelation);
          } catch (error) {
            console.error("Error checking user-company relation:", error);
            setHasActiveRelation(false);
          }
        }
      } catch (error) {
        console.error("Error loading user data for NIT visibility:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [companyId]);

  const getNitVisibilityOptions = (): NitVisibilityOptions => {
    return {
      currentUserId: currentUserId || undefined,
      companyOwnerId,
      userRoles,
      hasActiveRelation,
      isInternalProcess,
      isSuarecModule,
    };
  };

  return {
    currentUserId,
    userRoles,
    hasActiveRelation,
    isLoading,
    getNitVisibilityOptions,
  };
};
