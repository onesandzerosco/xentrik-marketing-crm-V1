
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  email: string;
  destination: string;
  media_quantity: number;
  time_uploaded: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { email, destination, media_quantity, time_uploaded }: WebhookPayload = await req.json();

    console.log('Media upload webhook triggered:', {
      email,
      destination,
      media_quantity,
      time_uploaded
    });

    // Here you would typically send to your external webhook
    // For now, I'll just log it and return success
    // Replace this URL with your actual webhook endpoint
    const webhookUrl = Deno.env.get('MEDIA_UPLOAD_WEBHOOK_URL');
    
    if (webhookUrl) {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          destination,
          media_quantity,
          time_uploaded
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed with status: ${webhookResponse.status}`);
      }

      console.log('Webhook sent successfully');
    } else {
      console.log('No webhook URL configured, logging data only');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in media-upload-webhook function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
