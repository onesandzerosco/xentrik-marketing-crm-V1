
-- Add geographic_restrictions column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN geographic_restrictions text[] DEFAULT '{}';

-- Update the column to be nullable initially for existing records
ALTER TABLE public.profiles 
ALTER COLUMN geographic_restrictions DROP NOT NULL;

-- Add a comment to describe the purpose
COMMENT ON COLUMN public.profiles.geographic_restrictions IS 'Array of geographic restrictions for this team member (e.g., ["south_africa"] means they cannot see South African creators)';
