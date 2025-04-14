
-- Create a table for storing secure logins
CREATE TABLE public.secure_logins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  creator_id TEXT NOT NULL,
  login_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, creator_id)
);

-- Enable Row Level Security
ALTER TABLE public.secure_logins ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access only their own login details
CREATE POLICY "Users can manage their own secure logins"
ON public.secure_logins
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX secure_logins_user_id_idx ON public.secure_logins(user_id);

-- Trigger for updated_at
CREATE TRIGGER handle_secure_logins_updated_at
BEFORE UPDATE ON public.secure_logins
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();
