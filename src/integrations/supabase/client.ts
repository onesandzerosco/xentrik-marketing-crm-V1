// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rdzwpiokpyssqhnfiqrt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkendwaW9rcHlzc3FobmZpcXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2Njc3MTIsImV4cCI6MjA2MDI0MzcxMn0.aUc4NpSjXMG-KQs7FeDPJTjZxp4ehJxvGi5-kk3CZRE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);