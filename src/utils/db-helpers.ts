
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a new SQL function in Supabase to allow team member creation with an explicit ID
 */
export const setupDatabaseFunctions = async () => {
  try {
    // Create the function that allows specifying a UUID
    const { error } = await supabase.rpc('create_function_if_not_exists', {
      function_name: 'create_team_member_with_id',
      function_body: `
CREATE OR REPLACE FUNCTION public.create_team_member_with_id(
  user_id UUID,
  email TEXT, 
  password TEXT, 
  name TEXT, 
  phone TEXT DEFAULT NULL, 
  telegram TEXT DEFAULT NULL, 
  roles TEXT[] DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Manually insert the user with the provided ID
  INSERT INTO auth.users (
    id,
    email, 
    email_confirmed_at, 
    raw_user_meta_data
  )
  VALUES (
    user_id,
    email,
    NOW(),
    jsonb_build_object(
      'name', name,
      'phone_number', phone,
      'telegram', telegram,
      'roles', roles
    )
  );
  
  -- Update auth.users with the password
  UPDATE auth.users
  SET encrypted_password = crypt(password, gen_salt('bf'))
  WHERE id = user_id;
  
  -- The profile will be created automatically via the handle_new_user trigger
  
  -- Update the profile with additional info
  UPDATE public.profiles
  SET 
    phone_number = phone,
    telegram = telegram,
    roles = roles
  WHERE id = user_id;
  
  RETURN user_id;
END;
$$;
      `
    });

    if (error) {
      console.error("Error creating database function:", error);
    }

    // Create a helper function to check if a function exists and create it if it doesn't
    const { error: helperFunctionError } = await supabase.rpc('create_function_if_not_exists', {
      function_name: 'create_function_if_not_exists',
      function_body: `
CREATE OR REPLACE FUNCTION create_function_if_not_exists(
  function_name TEXT,
  function_body TEXT
) RETURNS VOID AS $$
DECLARE
  func_exists BOOLEAN;
BEGIN
  -- Check if the function already exists
  SELECT EXISTS (
    SELECT 1 
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = function_name
  ) INTO func_exists;
  
  -- If function doesn't exist, create it
  IF NOT func_exists THEN
    EXECUTE function_body;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (helperFunctionError) {
      console.error("Error creating helper function:", helperFunctionError);
    }
    
  } catch (error) {
    console.error("Error setting up database functions:", error);
  }
};
