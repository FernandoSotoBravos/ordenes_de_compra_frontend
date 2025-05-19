export interface AddProduct {
  quantity: number;
  unit_price: number;
  description: string;
  total: number;
}

export interface EditProduct extends AddProduct {
  id: number
}
