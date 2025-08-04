-- Drop the previous constraint and create a better one that handles NULL chatter_id
ALTER TABLE public.sales_tracker 
DROP CONSTRAINT sales_tracker_unique_entry;

-- Add a unique constraint that includes chatter_id (including NULL values)
-- This ensures each combination is unique regardless of whether chatter_id is NULL or not
ALTER TABLE public.sales_tracker 
ADD CONSTRAINT sales_tracker_unique_entry 
UNIQUE (week_start_date, model_name, day_of_week, chatter_id);