export interface Area {
  id: number;
  name: string;
  department: string;
  department_id: number;
}

export interface Areas {
  areas: Area[];
}

export interface createArea {
  name: string;
  department_id: number;
}

export interface updateArea {
  id: number;
  name: string;
  department_id: number;
}


export interface deleteArea {
    id: number;
    comments: string;
}