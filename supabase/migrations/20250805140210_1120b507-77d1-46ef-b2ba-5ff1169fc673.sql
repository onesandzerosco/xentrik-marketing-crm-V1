-- Add overtime pay columns to sales_tracker table
ALTER TABLE public.sales_tracker 
ADD COLUMN overtime_pay NUMERIC DEFAULT 0,
ADD COLUMN overtime_notes TEXT;