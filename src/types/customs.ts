
export interface Custom {
  id: string;
  model_name: string;
  fan_display_name: string;
  fan_username: string;
  description: string;
  sale_date: string;
  due_date: string;
  downpayment: number;
  full_price: number;
  status: 'partially_paid' | 'fully_paid' | 'endorsed' | 'done';
  created_at: string;
  updated_at: string;
  sale_by: string;
  endorsed_by?: string;
  sent_by?: string;
}

export interface CustomStatusHistory {
  id: string;
  custom_id: string;
  old_status?: string;
  new_status: string;
  chatter_name?: string;
  changed_at: string;
  changed_by?: string;
}

export type CustomStatus = 'partially_paid' | 'fully_paid' | 'endorsed' | 'done';

export interface CreateCustomData {
  model_name: string;
  fan_display_name: string;
  fan_username: string;
  description: string;
  sale_date: string;
  due_date: string;
  downpayment: number;
  full_price: number;
  sale_by: string;
}
