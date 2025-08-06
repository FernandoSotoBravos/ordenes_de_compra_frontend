import { SelectChangeEvent } from "@mui/material";
import dayjs from "dayjs";

export interface ProductsOrder {
  id: string;
  quantity: number;
  description: string;
  unit_price: number;
  total: number;
  unit_id: number
}

export interface TaxesOrder {
  name: string;
  value: string;
}

export type OrderHistoryProps = {
  id: number;
};

export type OrderDocumentsProps = {
  id: number;
  documents: string[];
};

export interface OrderCreate {
  department: string;
  area: string;
  concept: string;
  segment: string;
  beneficiary: string;
  currency: string;
  descriptionPayment: string;
  comments?: string;
  observations?: string;
  subtotal?: number;
  iva?: number;
  total?: number;
  taxes?: TaxesOrder[];
  products: ProductsOrder[];
}

export interface CRUDTableProps {
  tableData: ProductsOrder[];
  setTableData: (products: ProductsOrder[]) => void;
  isSaving?: boolean;
  formValues: OrderCreate;
  setFormsValue: (data: any) => void;
}

export interface ProductsOrderProps {
  product_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  unit_id: number;
}

export interface OrderCreateProps {
  concept_id: number;
  supplier_id: number;
  currency_id: number;
  comments?: string;
  description?: string;
  subtotal?: number;
  iva?: number;
  total?: number;
  other?: string;
  other_2?: string;
  created_by: string;
  area_id?: number;
  department_id?: number;
  details: ProductsOrderProps[];
  documents: any[];
  taxes: TaxesOrder[];
}

export interface OrderDetail {
  id?: number;
  product: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  unit_id: number;
}

export interface Order {
  id: number;
  concept: string;
  supplier: string;
  area?: string;
  department?: string;
  currency?: string;
  created_by: string;
  created_user?: string;
  created_at: dayjs.Dayjs;
  total: number;
  subtotal: number;
  iva: number;
  comments: string;
  description: string;
  other: string;
  other_2: string;
  status: string;
  status_id: number;
  details: OrderDetail[];
  documents?: any;
  taxes?: TaxesOrder[];
}

export interface OrderHistory {
  action: string;
  comments: string;
  changed_by: string;
  created_at: string;
}

export interface ChangeStatus {
  orderId: number;
  status: number;
  comments: string;
}

export interface OrderDocument {
  name: string;
  folder: string;
}

export interface OrderUpdateHeaders {
  concept_id: number;
  area_id: number;
  department_id: number;
  supplier_id: number;
  currency_id: number;
  comments: string;
  description: string;
}

export interface Documents {
  filename: string;
  content: string;
  content_type: string;
}
