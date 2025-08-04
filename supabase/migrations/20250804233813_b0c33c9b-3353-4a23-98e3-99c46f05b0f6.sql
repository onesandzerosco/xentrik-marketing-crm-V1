-- Add hourly rate column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN hourly_rate numeric DEFAULT 0;