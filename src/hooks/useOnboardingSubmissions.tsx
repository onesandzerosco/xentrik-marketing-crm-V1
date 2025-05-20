
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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
      console.log("Fetching submissions from bucket...");
      // Get a list of all files in the onboard_submissions bucket
      const { data: files, error } = await supabase
        .storage
        .from('onboard_submissions')
        .list();
      
      if (error) {
        console.error("Error listing files:", error);
        throw error;
      }
      
      console.log("Files found:", files?.length || 0);
      
      if (!files || files.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }
      
      // Process each file to get its content
      const submissionsData = await Promise.all(
        files.filter(file => file.name.endsWith('.json')).map(async (file) => {
          try {
            console.log("Processing file:", file.name);
            // Get the file download URL
            const { data: fileData, error: downloadError } = await supabase
              .storage
              .from('onboard_submissions')
              .download(file.name);
            
            if (downloadError) {
              console.error(`Error downloading ${file.name}:`, downloadError);
              return null;
            }
            
            // Parse the JSON content from the file
            const text = await fileData.text();
            const jsonData = JSON.parse(text);
            
            // Extract token from the filename (remove .json extension)
            const token = file.name.replace('.json', '');
            
            return {
              token,
              email: jsonData.personalInfo?.email || 'No email provided',
              name: jsonData.personalInfo?.fullName || 'No name provided',
              submittedAt: file.created_at || new Date().toISOString(),
              data: jsonData,
              showPreview: false
            };
          } catch (parseError) {
            console.error(`Error processing ${file.name}:`, parseError);
            return null;
          }
        })
      );
      
      // Filter out any null entries and sort by submission date (newest first)
      const validSubmissions = submissionsData
        .filter(submission => submission !== null) as OnboardSubmission[];
      
      validSubmissions.sort((a, b) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      
      console.log("Valid submissions:", validSubmissions.length);
      setSubmissions(validSubmissions);
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
      const { error } = await supabase
        .storage
        .from('onboard_submissions')
        .remove([`${token}.json`]);
      
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
