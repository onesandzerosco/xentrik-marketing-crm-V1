-- Add marketing_strategy column to creators table
ALTER TABLE public.creators 
ADD COLUMN marketing_strategy text;