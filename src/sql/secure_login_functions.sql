
-- Function to get secure logins for a user
CREATE OR REPLACE FUNCTION public.get_secure_logins_for_user(user_id_param UUID)
RETURNS TABLE (creator_id TEXT, login_details JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    secure_logins.creator_id,
    secure_logins.login_details
  FROM 
    public.secure_logins
  WHERE 
    secure_logins.user_id = user_id_param;
END;
$$;

-- Function to upsert a secure login
CREATE OR REPLACE FUNCTION public.upsert_secure_login(
  user_id_param UUID,
  creator_id_param TEXT,
  login_details_param JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.secure_logins (
    user_id,
    creator_id,
    login_details,
    updated_at
  )
  VALUES (
    user_id_param,
    creator_id_param,
    login_details_param,
    NOW()
  )
  ON CONFLICT (user_id, creator_id)
  DO UPDATE SET
    login_details = login_details_param,
    updated_at = NOW();
END;
$$;
