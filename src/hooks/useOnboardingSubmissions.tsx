
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export interface OnboardSubmission {
  token: string;
  email: string;
  name: string;
  submittedAt: string;
  data: any;
  showPreview: boolean;
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
      // Get submissions from the database table
      const { data: dbSubmissions, error } = await supabase
        .from('onboarding_submissions')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching submissions:", error);
        throw error;
      }
      
      console.log("Submissions found:", dbSubmissions?.length || 0);
      
      if (!dbSubmissions || dbSubmissions.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }
      
      // Map database records to OnboardSubmission format
      const formattedSubmissions = dbSubmissions.map(submission => ({
        token: submission.token,
        email: submission.email,
        name: submission.name,
        submittedAt: submission.submitted_at,
        data: submission.data,
        showPreview: false
      }));
      
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

  const deleteSubmission = async (token: string) => {
    try {
      setProcessingTokens(prev => [...prev, token]);
      
      // Delete from the database table instead of storage
      const { error } = await supabase
        .from('onboarding_submissions')
        .delete()
        .eq('token', token);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Submission deleted",
        description: "The onboarding submission has been deleted.",
      });
      
      // Update the local state by removing the deleted submission
      setSubmissions(prev => prev.filter(sub => sub.token !== token));
      
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast({
        title: "Error deleting submission",
        description: "Failed to delete the onboarding submission.",
        variant: "destructive"
      });
    } finally {
      setProcessingTokens(prev => prev.filter(t => t !== token));
    }
  };

  // Format date utility
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return {
    submissions,
    loading,
    processingTokens,
    fetchSubmissions,
    togglePreview,
    deleteSubmission,
    setProcessingTokens,
    formatDate
  };
};
