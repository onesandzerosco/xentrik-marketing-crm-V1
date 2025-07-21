-- Add model_name column to creators table
ALTER TABLE public.creators 
ADD COLUMN model_name TEXT;

-- Update existing creators to use their current name as model_name initially
UPDATE public.creators 
SET model_name = name 
WHERE model_name IS NULL;