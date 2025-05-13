
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface RequestBody {
  function_name?: string;
  function_definition?: string;
  action?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    let responseMessage = '';
    
    // If creating a function
    if (body.function_name && body.function_definition) {
      // Execute the SQL to create the function
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({
          sql: body.function_definition
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        responseMessage = `Successfully created function: ${body.function_name}`;
      } else {
        throw new Error(`Failed to create function: ${JSON.stringify(result)}`);
      }
    }
    
    // If it's just testing the helper function
    if (body.action === 'create_helper_function') {
      responseMessage = 'Helper function executed successfully';
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ message: responseMessage, success: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
