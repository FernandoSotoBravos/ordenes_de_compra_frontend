export interface SelectBase {
  id: string;
  name: string;
}

export interface SelectDescription {
  id: string;
  description: string;
}

export interface TaxSelect extends SelectBase {
  value: number;
  active?: boolean;
  extra?: number;
  is_deduction: boolean;
}
