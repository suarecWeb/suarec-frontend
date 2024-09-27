import { User } from "./user.interface";
import { RolePermission } from "./role-permission.interface";

export interface Role {
    id: string;
    name: string; // Unique
    role_permissions: RolePermission[];
    users: User[];
}