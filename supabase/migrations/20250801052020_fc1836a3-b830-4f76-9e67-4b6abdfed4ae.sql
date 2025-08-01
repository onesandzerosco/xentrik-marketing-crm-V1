-- Add week_start_date to sales_models table to tie models to specific weeks
ALTER TABLE public.sales_models 
ADD COLUMN week_start_date date NOT NULL DEFAULT CURRENT_DATE;