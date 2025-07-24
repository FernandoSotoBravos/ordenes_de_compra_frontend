import dayjs from "dayjs";

export interface ProductsRequisition {
  id: string;
  quantity: number;
  description: string;
  unit_id: number;
}

export interface RequisitionCreate {
  department: string;
  area: string;
  concept: string;
  segment: string;
  comments?: string;
  products: ProductsRequisition[];
}

export interface RequisitionUpdateHeaders {
  concept_id: number;
  area_id: number;
  department_id: number;
  comments: string;
}

export interface ProductsRequiProps {
  product_id?: number;
  description: string;
  quantity: number;
}

export interface RequisitionCreateProps {
  concept_id: number;
  comments?: string;
  created_by: string;
  area_id?: number;
  department_id?: number;
  details: ProductsRequiProps[];
  documents: any[];
}

export interface ChangeStatus {
  requisitionId: number;
  status: string;
  comments: string;
}

export interface RequisitionDetail {
  id?: number;
  product: string;
  description: string;
  quantity: number;
}

export interface Requisition {
  id: number;
  concept: string;
  area?: string;
  department?: string;
  created_by: string;
  created_user?: string;
  created_at: dayjs.Dayjs;
  comments: string;
  status: string;
  status_id: number;
  details: RequisitionDetail[];
  documents?: any;
  quotizations?: any;
  approved_quo?: string;
}

export interface RequisitionHistory {
  action: string;
  comments: string;
  changed_by: string;
  created_at: string;
}

export type RequisitionHistoryProps = {
  id: number;
};

export type RequisitionDocumentsProps = {
  id: number;
  documents: string[];
};

export interface CRUDTableProps {
  tableData: ProductsRequisition[];
  setTableData: (products: ProductsRequisition[]) => void;
  isSaving?: boolean;
}

export interface RequisitionDocument {
  name: string;
  folder: string;
}

export interface DocumentsRequisition {
  name: string;
  folder: unknown;
}
