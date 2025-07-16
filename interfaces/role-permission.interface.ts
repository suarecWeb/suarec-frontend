import { Role } from "./role.interface";
import { Permission } from "./permission.interface";

export interface RolePermission {
  id: string;
  role: Role;
  permission: Permission;
}
