
import { supabase } from "@/integrations/supabase/client";

/**
 * Function to create necessary database functions if they don't exist
 */
export async function setupDatabaseFunctions() {
  try {
    console.log("Setting up database functions...");
    
    // Create the function to create a team member with a specified ID
    // @ts-ignore - Supabase types don't recognize our custom functions
    const { error: createTeamMemberError } = await supabase.rpc(
      'create_function_if_not_exists',
      {
        function_name: 'create_team_member',
        function_definition: `
CREATE OR REPLACE FUNCTION public.create_team_member(
  user_id uuid,
  email text,
  password text,
  name text,
  phone text DEFAULT NULL,
  telegram text DEFAULT NULL,
  roles text[] DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID := user_id;
BEGIN
  -- Create the user in auth.users with the provided ID
  INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data
  )
  VALUES (
    new_user_id,
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
  WHERE id = new_user_id;
  
  -- The profile will be created automatically via the handle_new_user trigger
  
  -- Update the profile with additional info
  UPDATE public.profiles
  SET 
    phone_number = phone,
    telegram = telegram,
    roles = roles
  WHERE id = new_user_id;
  
  RETURN new_user_id;
END;
$$;
        `
      }
    );

    if (createTeamMemberError) {
      console.error("Error creating create_team_member function:", createTeamMemberError);
    } else {
      console.log("create_team_member function created successfully");
    }

    // Creating admin_update_user_roles function
    // @ts-ignore - Supabase types don't recognize our custom functions
    const { error: updateRolesError } = await supabase.rpc(
      'create_function_if_not_exists',
      {
        function_name: 'admin_update_user_roles',
        function_definition: `
CREATE OR REPLACE FUNCTION public.admin_update_user_roles(
  user_id uuid,
  new_primary_role text,
  new_additional_roles text[]
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the user's primary role and additional roles
  UPDATE public.profiles
  SET 
    role = new_primary_role,
    roles = new_additional_roles,
    updated_at = now()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$;
        `
      }
    );

    if (updateRolesError) {
      console.error("Error creating admin_update_user_roles function:", updateRolesError);
    } else {
      console.log("admin_update_user_roles function created successfully");
    }

    // Creating the helper function to create other functions if they don't exist
    const { error: helperFunctionError } = await supabase.functions.invoke(
      'create-function-helper',
      {
        body: {
          action: 'create_helper_function'
        }
      }
    );

    if (helperFunctionError) {
      console.error("Error creating helper function:", helperFunctionError);
    } else {
      console.log("Helper function created successfully");
    }

    return true;
  } catch (error) {
    console.error("Error setting up database functions:", error);
    return false;
  }
}
