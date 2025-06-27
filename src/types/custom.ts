
export interface Custom {
  id: string;
  model_name: string;
  fan_display_name: string;
  fan_username: string | null;
  description: string;
  sale_date: string;
  due_date: string | null;
  downpayment: number;
  full_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  sale_by: string;
  custom_type?: string | null;
  endorsed_by?: string;
  sent_by?: string;
  attachments?: string[] | null;
}
