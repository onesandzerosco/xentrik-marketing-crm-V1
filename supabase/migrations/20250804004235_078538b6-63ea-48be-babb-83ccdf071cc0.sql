-- Add unique constraint to sales_tracker table for proper upsert functionality
ALTER TABLE public.sales_tracker 
ADD CONSTRAINT sales_tracker_unique_entry 
UNIQUE (week_start_date, model_name, day_of_week, chatter_id);