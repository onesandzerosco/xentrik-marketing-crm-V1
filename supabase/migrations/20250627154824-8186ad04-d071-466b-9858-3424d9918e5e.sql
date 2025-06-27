
-- Make due_date nullable since it's optional in the form
ALTER TABLE public.customs ALTER COLUMN due_date DROP NOT NULL;
