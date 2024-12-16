export interface DepartmentSelect {
  id: string;
  name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface CreateDepto {
  name: string;
}

export interface UpdateDepto extends CreateDepto {}
