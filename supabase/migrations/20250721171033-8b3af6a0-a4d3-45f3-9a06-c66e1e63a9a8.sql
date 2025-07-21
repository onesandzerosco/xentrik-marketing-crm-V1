-- Change marketing_strategy from text to text array
ALTER TABLE public.creators 
ALTER COLUMN marketing_strategy TYPE text[] USING CASE 
  WHEN marketing_strategy IS NULL OR marketing_strategy = '' 
  THEN '{}'::text[]
  ELSE ARRAY[marketing_strategy]
END;