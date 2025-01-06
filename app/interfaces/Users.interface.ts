export interface CreateUser {
  fullname: string;
  username: string;
  password_hash: string;
  email: string;
  area_id: number;
  department_id: number;
  created_by: number;
  role_id: number;
}

export interface UpdatePassword {
  new_password: string;
}
