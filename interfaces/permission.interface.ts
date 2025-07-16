import { RolePermission } from "./role-permission.interface";

export interface Permission {
  id: string;
  name: string; // Unique
  role_permissions: RolePermission[];
}
