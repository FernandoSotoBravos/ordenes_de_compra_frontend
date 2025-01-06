export interface Role {
  id: number;
  name: string;
  description: string;
}

export interface RoleCreate {
  name: string;
  description: string;
}

export interface RoleUpdate extends RoleCreate {}

export interface SelectRole {
  id: number;
  description: string;
}