
import { supabase } from "@/integrations/supabase/client";
import { CreatorOnboardingFormValues } from "@/schemas/creatorOnboardingSchema";

/**
 * Validate if a token exists and is still valid (not used and not expired)
 */
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('creator_invitations')
      .select('expires_at, status')
      .eq('token', token)
      .single();
    
    if (error || !data) {
      console.error('Token not found:', error);
      return false;
    }
    
    // Check if token is still pending and not expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);
    
    return data.status === 'pending' && expiresAt > now;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Save the creator onboarding data to the onboarding_submissions table
 * @param data The form data to save
 * @param token Optional token from invitation link
 * @returns Success status and submission ID or error message
 */
export const saveOnboardingData = async (
  data: CreatorOnboardingFormValues, 
  token?: string
): Promise<{ success: boolean; submissionId?: string; error?: string }> => {
  try {
    console.log("Starting saveOnboardingData with form data and token:", token);
    
    // Extract basic required fields
    const name = data.personalInfo?.fullName || "New Creator";
    const email = data.personalInfo?.email || "noemail@example.com";
    
    // If token is provided, validate it first
    if (token) {
      const isValid = await validateToken(token);
      if (!isValid) {
        return { 
          success: false, 
          error: "Invalid or expired invitation link" 
        };
      }
    }
    
    // Save to onboarding_submissions table
    const { data: submission, error: submissionError } = await supabase
      .from('onboarding_submissions')
      .insert({
        token: token || `manual-${Date.now()}`, // Generate token if not provided
        name,
        email,
        data: data,
        status: 'pending'
      })
      .select('id')
      .single();
    
    if (submissionError) {
      console.error("Error saving submission:", submissionError);
      throw submissionError;
    }
    
    // If token was provided, mark the invitation as used
    if (token) {
      const { error: updateError } = await supabase
        .from('creator_invitations')
        .update({ status: 'used' })
        .eq('token', token);
      
      if (updateError) {
        console.error("Error updating invitation status:", updateError);
        // Don't fail the submission if we can't update the invitation
      }
    }
    
    console.log("Submission successful with ID:", submission?.id);
    return { success: true, submissionId: submission?.id };
  } catch (error) {
    console.error('Error in saveOnboardingData:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

/**
 * Generate a new invitation token
 */
export const generateInvitationToken = async (stageName?: string): Promise<{ success: boolean; token?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('creator_invitations')
      .insert({
        email: 'noemail@example.com', // Not used anymore but required by schema
        stage_name: stageName || null,
        status: 'pending'
      })
      .select('token')
      .single();
    
    if (error) {
      throw error;
    }
    
    return { success: true, token: data.token };
  } catch (error) {
    console.error('Error generating invitation token:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate token' 
    };
  }
};

/**
 * Get all pending invitation tokens
 */
export const getPendingInvitations = async () => {
  try {
    const { data, error } = await supabase
      .from('creator_invitations')
      .select('token, stage_name, created_at, expires_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { success: true, invitations: data || [] };
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch invitations',
      invitations: []
    };
  }
};
