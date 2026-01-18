import api from "./axios_config";

const baseURL = "/suarec/user-relations";

export interface UserCompanyRelation {
  id: string;
  userId: number;
  companyId: string;
  relationType:
    | "APPLICATION_ACCEPTED"
    | "CONTRACT_ACTIVE"
    | "COMMERCIAL_RELATION";
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  startDate: Date;
  endDate?: Date;
  created_at: Date;
  updated_at: Date;
}

// Verificar si el usuario tiene relación activa con una empresa
const hasActiveRelationWithCompany = (userId: number, companyId: string) =>
  api.get<{ hasActiveRelation: boolean }>(
    `${baseURL}/check-relation/${userId}/${companyId}`,
  );

// Obtener todas las relaciones activas del usuario
const getUserActiveRelations = (userId: number) =>
  api.get<UserCompanyRelation[]>(`${baseURL}/user/${userId}/active`);

// Obtener relaciones de una empresa
const getCompanyRelations = (companyId: string) =>
  api.get<UserCompanyRelation[]>(`${baseURL}/company/${companyId}`);

export const UserRelationService = {
  hasActiveRelationWithCompany,
  getUserActiveRelations,
  getCompanyRelations,
};
