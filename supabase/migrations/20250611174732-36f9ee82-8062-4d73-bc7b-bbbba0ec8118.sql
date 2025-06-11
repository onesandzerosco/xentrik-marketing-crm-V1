
-- Remove the automatic expiration from creator_invitations table
-- Change expires_at to be nullable since we won't use time-based expiration
ALTER TABLE public.creator_invitations 
ALTER COLUMN expires_at DROP NOT NULL,
ALTER COLUMN expires_at DROP DEFAULT;

-- Update existing records to remove expiration dates
UPDATE public.creator_invitations 
SET expires_at = NULL 
WHERE status = 'pending';
