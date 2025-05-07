
-- Create a function to send emails using PostgreSQL's built-in email functionality
CREATE OR REPLACE FUNCTION send_email(
  to_email TEXT,
  subject TEXT,
  html_content TEXT
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Using pg_notify to send an event that can be picked up by Supabase's event system
  -- This is a workaround since we cannot directly send emails from SQL
  PERFORM pg_notify(
    'send_email_channel', 
    json_build_object(
      'to', to_email,
      'subject', subject,
      'html', html_content
    )::text
  );
  
  -- Return success result
  result := json_build_object('success', true, 'message', 'Email notification sent');
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Return error information
  result := json_build_object('success', false, 'error', SQLERRM);
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the service role
GRANT EXECUTE ON FUNCTION send_email TO service_role;
