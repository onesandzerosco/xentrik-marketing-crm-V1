-- Add columns for deductions in payroll
ALTER TABLE public.sales_tracker 
ADD COLUMN deduction_amount numeric DEFAULT 0,
ADD COLUMN deduction_notes text DEFAULT NULL;