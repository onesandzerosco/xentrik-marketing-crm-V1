-- Add columns for sales confirmation and payroll management
ALTER TABLE public.sales_tracker 
ADD COLUMN sales_locked boolean NOT NULL DEFAULT false,
ADD COLUMN admin_confirmed boolean NOT NULL DEFAULT false,
ADD COLUMN confirmed_hours_worked numeric DEFAULT NULL,
ADD COLUMN confirmed_commission_rate numeric DEFAULT NULL;