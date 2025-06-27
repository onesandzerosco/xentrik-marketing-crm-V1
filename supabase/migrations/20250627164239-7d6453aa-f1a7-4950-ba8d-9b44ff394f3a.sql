
-- Update the check constraint on the customs table to allow 'refunded' status
ALTER TABLE public.customs DROP CONSTRAINT IF EXISTS customs_status_check;

-- Add the updated constraint that includes 'refunded'
ALTER TABLE public.customs ADD CONSTRAINT customs_status_check 
CHECK (status IN ('partially_paid', 'fully_paid', 'endorsed', 'done', 'refunded'));
