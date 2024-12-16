export interface Supplier {
  id: number;
  name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  tax: string;
  tax_id: number;
  account_manager: string;
  bank_name: string;
  account_number: string;
  clabe: string;
  website: string;
}

export interface createSupplier {
  name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  tax_id: number;
  account_manager: string;
  account_number: string;
  bank_name: string;
  clabe: string;
  website: string;
}

export interface updateSupplier extends createSupplier {}
