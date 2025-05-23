
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export interface OnboardSubmission {
  id: string;
  token: string;
  email: string;
  name: string;
  submittedAt: string;
  data: any;
  showPreview: boolean;
  status: string;
}

export const useOnboardingSubmissions = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<OnboardSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTokens, setProcessingTokens] = useState<string[]>([]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      console.log("Fetching submissions from database...");
      // Get all pending submissions from the onboarding_submissions table
      const { data, error } = await supabase
        .from('onboarding_submissions')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching submissions:", error);
        throw error;
      }
      
      console.log("Submissions found:", data?.length || 0);
      
      if (!data || data.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }
      
      // Map the database records to our component's data structure
      const formattedSubmissions = data.map(record => ({
        id: record.id,
        token: record.token,
        email: record.email || 'No email provided',
        name: record.name || 'No name provided',
        submittedAt: record.submitted_at,
        data: record.data,
        showPreview: false,
        status: record.status
      }));
      
      console.log("Valid submissions:", formattedSubmissions.length);
      setSubmissions(formattedSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error loading submissions",
        description: "Failed to load creator onboarding submissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePreview = (token: string) => {
    setSubmissions(prev => prev.map(sub => 
      sub.token === token ? { ...sub, showPreview: !sub.showPreview } : sub
    ));
  };

  // New function to specifically decline a submission
  const declineSubmission = async (token: string) => {
    // If token is already being processed, don't try to decline it again
    if (processingTokens.includes(token)) {
      console.log("Token already being processed, skipping declineSubmission:", token);
      return;
    }
    
    try {
      console.log("Processing declineSubmission for token:", token);
      setProcessingTokens(prev => [...prev, token]);
      
      // Update the status to 'declined' in the database
      const { error } = await supabase
        .from('onboarding_submissions')
        .update({ status: 'declined' })
        .eq('token', token);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Submission declined",
        description: "The onboarding submission has been declined.",
      });
      
      // Refresh the list by removing the declined submission from the view
      setSubmissions(prev => prev.filter(sub => sub.token !== token));
    } catch (error) {
      console.error("Error declining submission:", error);
      toast({
        title: "Error declining submission",
        description: "Failed to decline the onboarding submission.",
        variant: "destructive"
      });
    } finally {
      setProcessingTokens(prev => prev.filter(t => t !== token));
    }
  };

  // Modified function to remove a submission from the view only without changing its status
  const removeSubmissionFromView = (token: string) => {
    console.log("Removing submission from view:", token);
    setSubmissions(prev => prev.filter(sub => sub.token !== token));
  };

  // Format date utility
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      console.error("Invalid date format:", dateString, e);
      return 'Invalid date';
    }
  };

  useEffect(() => {
    console.log("useEffect in useOnboardingSubmissions is running, fetching submissions...");
    fetchSubmissions();
  }, []);

  return {
    submissions,
    loading,
    processingTokens,
    fetchSubmissions,
    togglePreview,
    declineSubmission,
    removeSubmissionFromView,
    setProcessingTokens,
    formatDate
  };
};
