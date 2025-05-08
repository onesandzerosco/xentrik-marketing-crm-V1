
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import CreatorService from "@/services/CreatorService";
import { format } from "date-fns";

interface OnboardSubmission {
  token: string;
  email: string;
  name: string;
  submittedAt: string;
  data: any;
  showPreview: boolean;
}

const CreatorOnboardQueue: React.FC = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<OnboardSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingTokens, setProcessingTokens] = useState<string[]>([]);
  
  // Only allow admins to access this page
  if (userRole !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }
  
  useEffect(() => {
    fetchSubmissions();
  }, []);
  
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
      
      // Refresh the list
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
  
  const approveSubmission = async (submission: OnboardSubmission) => {
    try {
      setProcessingTokens(prev => [...prev, submission.token]);
      // Extract necessary data for creator
      const formData = submission.data;
      const personalInfo = formData.personalInfo;
      
      if (!personalInfo?.email || !personalInfo?.fullName) {
        throw new Error("Missing required information (email or name)");
      }
      
      // Create basic creator data
      const creatorData = {
        name: personalInfo.fullName,
        email: personalInfo.email,
        gender: personalInfo.sex === "Male" ? "Male" : 
                personalInfo.sex === "Female" ? "Female" : 
                personalInfo.sex === "Non-binary" ? "Trans" : "Female",
        team: "A Team", // Default team
        creatorType: "Real", // Default type
        notes: JSON.stringify(formData), // Store full data as notes for now
        telegramUsername: "", // Can be updated later
        whatsappNumber: "", // Can be updated later
      };
      
      console.log("Creating creator with data:", creatorData);
      
      // Add creator to database
      const creatorId = await CreatorService.addCreator(creatorData);
      
      if (!creatorId) {
        throw new Error("Failed to create creator record");
      }
      
      console.log("Creator created with ID:", creatorId);
      
      // Delete the submission file after successful approval
      await deleteSubmission(submission.token);
      
      toast({
        title: "Creator approved",
        description: `${personalInfo.fullName} has been approved and added as a creator.`,
      });
      
    } catch (error) {
      console.error("Error approving submission:", error);
      toast({
        title: "Error approving submission",
        description: error instanceof Error ? error.message : "Failed to approve the creator.",
        variant: "destructive"
      });
      setProcessingTokens(prev => prev.filter(t => t !== submission.token));
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Creator Onboarding Queue</h1>
        <p className="text-muted-foreground">
          Review and approve creator onboarding submissions.
        </p>
      </div>
      
      <Card className="bg-[#1a1a33]/50 backdrop-blur-sm border border-[#252538]/50">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Pending Submissions</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSubmissions}
              disabled={loading}
              className="text-white border-white/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-white">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-white" />
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending submissions found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <React.Fragment key={submission.token}>
                    <TableRow>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.name}</TableCell>
                      <TableCell>
                        {formatDate(submission.submittedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePreview(submission.token)}
                            title="Toggle preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSubmission(submission.token)}
                            disabled={processingTokens.includes(submission.token)}
                            title="Delete submission"
                          >
                            {processingTokens.includes(submission.token) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => approveSubmission(submission)}
                            disabled={processingTokens.includes(submission.token)}
                            title="Approve creator"
                          >
                            {processingTokens.includes(submission.token) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {submission.showPreview && (
                      <TableRow>
                        <TableCell colSpan={4} className="bg-muted/10">
                          <div className="p-2 rounded overflow-auto max-h-96">
                            <pre className="text-xs text-white/80">
                              {JSON.stringify(submission.data, null, 2)}
                            </pre>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorOnboardQueue;
