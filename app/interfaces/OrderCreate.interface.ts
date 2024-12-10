export interface ProductsOrder {
  id: string;
  quantity: number;
  description: string;
  unit_price: number;
  total: number;
}

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
  status: string;
  created_by: string;
  details: ProductsOrderProps[];
}
