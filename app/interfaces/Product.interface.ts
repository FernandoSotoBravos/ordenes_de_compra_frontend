export interface AddProduct {
  quantity: number;
  unit_price: number;
  description: string;
  total: number;
}

export interface Product {
  id?: number;
  productCode?: string;
  description?: string;
  unit_price?: number;
  quantity?: number;
  img?: string;
  warehouse?: string;
  created_at?: string;
}

export interface EditProduct extends AddProduct {
  id: number
}

export interface ProductEdit extends Product {
  warehouse_id?: number;
}

export interface ProductDialog {
  action: "create" | "edit";
  payload?: ProductEdit;
}

