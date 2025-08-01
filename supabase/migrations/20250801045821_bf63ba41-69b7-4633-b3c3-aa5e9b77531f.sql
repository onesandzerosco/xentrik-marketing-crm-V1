-- Add working_day column to sales_tracker table
ALTER TABLE public.sales_tracker 
ADD COLUMN working_day boolean NOT NULL DEFAULT true;