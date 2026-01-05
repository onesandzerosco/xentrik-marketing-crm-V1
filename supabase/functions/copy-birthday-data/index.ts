import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update onboarding_submissions table
    const { data: submissions, error: fetchSubmissionsError } = await supabase
      .from("onboarding_submissions")
      .select("id, data")
      .not("data->personalInfo", "is", null);

    if (fetchSubmissionsError) {
      throw new Error(`Failed to fetch submissions: ${fetchSubmissionsError.message}`);
    }

    let submissionsUpdated = 0;
    for (const submission of submissions || []) {
      const personalInfo = submission.data?.personalInfo;
      if (!personalInfo) continue;

      // Only update if modelAge or modelBirthday is not set and we have data to copy
      const needsUpdate = 
        (personalInfo.modelAge === null || personalInfo.modelAge === undefined) ||
        (personalInfo.modelBirthday === null || personalInfo.modelBirthday === undefined || personalInfo.modelBirthday === "");

      if (needsUpdate) {
        const updatedData = {
          ...submission.data,
          personalInfo: {
            ...personalInfo,
            modelAge: personalInfo.modelAge ?? personalInfo.age ?? null,
            modelBirthday: personalInfo.modelBirthday || personalInfo.dateOfBirth || "",
          },
        };

        const { error: updateError } = await supabase
          .from("onboarding_submissions")
          .update({ data: updatedData })
          .eq("id", submission.id);

        if (updateError) {
          console.error(`Failed to update submission ${submission.id}:`, updateError);
        } else {
          submissionsUpdated++;
        }
      }
    }

    // Update creators table
    const { data: creators, error: fetchCreatorsError } = await supabase
      .from("creators")
      .select("id, model_profile")
      .not("model_profile->personalInfo", "is", null);

    if (fetchCreatorsError) {
      throw new Error(`Failed to fetch creators: ${fetchCreatorsError.message}`);
    }

    let creatorsUpdated = 0;
    for (const creator of creators || []) {
      const personalInfo = creator.model_profile?.personalInfo;
      if (!personalInfo) continue;

      // Only update if modelAge or modelBirthday is not set and we have data to copy
      const needsUpdate = 
        (personalInfo.modelAge === null || personalInfo.modelAge === undefined) ||
        (personalInfo.modelBirthday === null || personalInfo.modelBirthday === undefined || personalInfo.modelBirthday === "");

      if (needsUpdate) {
        const updatedProfile = {
          ...creator.model_profile,
          personalInfo: {
            ...personalInfo,
            modelAge: personalInfo.modelAge ?? personalInfo.age ?? null,
            modelBirthday: personalInfo.modelBirthday || personalInfo.dateOfBirth || "",
          },
        };

        const { error: updateError } = await supabase
          .from("creators")
          .update({ model_profile: updatedProfile })
          .eq("id", creator.id);

        if (updateError) {
          console.error(`Failed to update creator ${creator.id}:`, updateError);
        } else {
          creatorsUpdated++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${submissionsUpdated} submissions and ${creatorsUpdated} creators`,
        submissionsUpdated,
        creatorsUpdated,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
