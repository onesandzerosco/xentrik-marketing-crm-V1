-- Remove the incorrect unique constraint on model_name alone
ALTER TABLE public.sales_models DROP CONSTRAINT IF EXISTS sales_models_model_name_key;

-- Add a proper composite unique constraint that allows the same model for different weeks or different chatters
-- This prevents duplicate entries for the same model, week, and chatter combination
ALTER TABLE public.sales_models 
ADD CONSTRAINT sales_models_unique_model_week_chatter 
UNIQUE (model_name, week_start_date, created_by);