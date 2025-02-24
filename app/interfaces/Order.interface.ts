import dayjs from "dayjs";

export interface ProductsOrder {
  id: string;
  quantity: number;
  description: string;
  unit_price: number;
  total: number;
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
  concept: string;
  segment: string;
  beneficiary: string;
  descriptionPayment: string;
  comments?: string;
  observations?: string;
  products: ProductsOrder[];
}

export interface CRUDTableProps {
  // onProductsChange: (products: ProductsOrder[]) => void;
  tableData: ProductsOrder[];
  setTableData: (products: ProductsOrder[]) => void;
  isSaving?: boolean;
}

export interface ProductsOrderProps {
  product_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface OrderCreateProps {
  concept_id: number;
  supplier_id: number;
  comments?: string;
  description?: string;
  other?: string;
  other_2?: string;
  created_by: string;
  area_id?: number;
  department_id?: number;
  details: ProductsOrderProps[];
  documents: any[];
}

export interface OrderDetail {
  product: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Order {
  id: number;
  concept: string;
  supplier: string;
  created_by: string;
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
}

export interface OrderHistory {
  action: string;
  comments: string;
  changed_by: string;
  created_at: string;
}


export interface ChangeStatus {
  orderId: number;
  status: string;
  comments: string;
}