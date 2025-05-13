
import { supabase } from "@/integrations/supabase/client";

export async function setupDatabaseFunctions() {
  try {
    // Check if the create_team_member_with_id function exists
    // @ts-ignore - The function name isn't in the TypeScript definitions
    const { data: existingFunction, error: checkError } = await supabase.rpc(
      'create_function_if_not_exists',
      {
        function_name: 'create_team_member_with_id',
        function_definition: `
        CREATE OR REPLACE FUNCTION public.create_team_member_with_id(
          user_id uuid,
          email text,
          password text,
          name text,
          phone text DEFAULT NULL,
          telegram text DEFAULT NULL,
          roles text[] DEFAULT '{}'::text[],
          teams text[] DEFAULT '{}'::text[]
        )
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $function$
        BEGIN
          -- Insert directly into auth.users with the provided ID
          INSERT INTO auth.users (
            id,
            email,
            email_confirmed_at,
            encrypted_password,
            raw_user_meta_data
          )
          VALUES (
            user_id,
            email,
            NOW(),
            crypt(password, gen_salt('bf')),
            jsonb_build_object(
              'name', name,
              'phone_number', phone,
              'telegram', telegram,
              'roles', roles,
              'teams', teams
            )
          );
          
          -- Update the profile with additional info
          -- The profile should be created automatically via the handle_new_user trigger
          UPDATE public.profiles
          SET 
            phone_number = phone,
            telegram = telegram,
            roles = roles,
            teams = teams
          WHERE id = user_id;
        END;
        $function$;
        `
      }
    );

    if (checkError) {
      console.error("Error checking for function existence:", checkError);
    } else {
      console.log("Database functions setup complete");
    }

    // Check if the create_function_if_not_exists function exists
    // @ts-ignore - The function isn't in TypeScript definitions
    const { data: helperFunctionExists, error: helperError } = await supabase.rpc(
      'create_function_if_not_exists',
      {
        function_name: 'create_function_if_not_exists',
        function_definition: `
        CREATE OR REPLACE FUNCTION public.create_function_if_not_exists(
          function_name text,
          function_definition text
        )
        RETURNS boolean
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $function$
        DECLARE
          function_exists boolean;
        BEGIN
          -- Check if the function exists
          SELECT EXISTS (
            SELECT 1
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.proname = function_name
          ) INTO function_exists;
          
          IF NOT function_exists THEN
            -- Execute the function definition
            EXECUTE function_definition;
            RETURN true;
          END IF;
          
          RETURN false;
        END;
        $function$;
        `
      }
    );

    if (helperError) {
      console.error("Error checking for helper function existence:", helperError);
    }

  } catch (error) {
    console.error("Error setting up database functions:", error);
  }
}
