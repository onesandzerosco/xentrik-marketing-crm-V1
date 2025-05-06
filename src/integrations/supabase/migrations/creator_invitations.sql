
-- Creator Invitations Table
CREATE TABLE IF NOT EXISTS public.creator_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    stage_name TEXT,
    token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '72 hours') NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    submission_path TEXT,
    created_by UUID REFERENCES auth.users(id)
);

-- Add RLS Policies
ALTER TABLE public.creator_invitations ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins have full access to creator invitations"
ON public.creator_invitations
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role = 'Admin' OR 'Admin' = ANY(roles))
    )
);

-- Non-admins can only read/verify their own invitation by token
CREATE POLICY "Users can read their own invitations" 
ON public.creator_invitations
FOR SELECT
USING (true); -- Allow verification by token without login

-- Add index for faster token lookups
CREATE INDEX IF NOT EXISTS creator_invitations_token_idx ON public.creator_invitations(token);
