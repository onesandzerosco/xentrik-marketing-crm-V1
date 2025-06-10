
-- Deactivate all current passwords
UPDATE public.secure_area_passwords 
SET active = false 
WHERE active = true;

-- Insert the new password with a simple hash
INSERT INTO public.secure_area_passwords (password_hash, active) 
VALUES ('simple:' || encode(digest('BananaMoney$!', 'sha256'), 'base64'), true);
