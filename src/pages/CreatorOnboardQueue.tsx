
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
import { Eye, Trash, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import CreatorService from "@/components/admin/users/CreatorService";

interface OnboardSubmission {
  token: string;
  email: string;
  submittedAt: string;
  data: any;
  showPreview: boolean;
}

const CreatorOnboardQueue: React.FC = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<OnboardSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  
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
      // Get a list of all files in the onboard_submissions bucket
      const { data: files, error } = await supabase
        .storage
        .from('onboard_submissions')
        .list();
      
      if (error) {
        throw error;
      }
      
      if (!files || files.length === 0) {
        setSubmissions([]);
        setLoading(false);
        return;
      }
      
      // Process each file to get its content
      const submissionsData = await Promise.all(
        files.filter(file => file.name.endsWith('.json')).map(async (file) => {
          // Get the file download URL
          const { data: fileData, error: downloadError } = await supabase
            .storage
            .from('onboard_submissions')
            .download(file.name);
          
          if (downloadError) {
            console.error(`Error downloading ${file.name}:`, downloadError);
            return null;
          }
          
          try {
            // Parse the JSON content from the file
            const text = await fileData.text();
            const jsonData = JSON.parse(text);
            
            // Extract token from the filename (remove .json extension)
            const token = file.name.replace('.json', '');
            
            return {
              token,
              email: jsonData.personalInfo?.email || 'No email provided',
              submittedAt: file.created_at || new Date().toISOString(),
              data: jsonData,
              showPreview: false
            };
          } catch (parseError) {
            console.error(`Error parsing ${file.name}:`, parseError);
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
      fetchSubmissions();
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast({
        title: "Error deleting submission",
        description: "Failed to delete the onboarding submission.",
        variant: "destructive"
      });
    }
  };
  
  const approveSubmission = async (submission: OnboardSubmission) => {
    try {
      // Create a basic user account using the submission data
      const email = submission.data.personalInfo?.email;
      const fullName = submission.data.personalInfo?.fullName;
      
      if (!email || !fullName) {
        throw new Error("Missing required information (email or name)");
      }
      
      // Generate a secure random password for the initial account
      const password = Math.random().toString(36).slice(2) + 
                      Math.random().toString(36).toUpperCase().slice(2);
      
      // Create user account with creator role
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
            role: 'Creator',
          }
        }
      });
      
      if (error || !data.user) {
        throw error || new Error("Failed to create user account");
      }
      
      // Ensure creator record exists and is active
      const creatorSetupResult = await CreatorService.ensureCreatorRecordExists(data.user.id);
      
      if (!creatorSetupResult) {
        throw new Error("Failed to set up creator record");
      }
      
      // Delete the submission file after successful approval
      await deleteSubmission(submission.token);
      
      toast({
        title: "Creator approved",
        description: `${fullName} has been approved and added as a creator.`,
      });
      
    } catch (error) {
      console.error("Error approving submission:", error);
      toast({
        title: "Error approving submission",
        description: error instanceof Error ? error.message : "Failed to approve the creator.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creator Onboarding Queue</h1>
        <p className="text-muted-foreground">
          Review and approve creator onboarding submissions.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Pending Submissions</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSubmissions}
              disabled={loading}
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending submissions found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <React.Fragment key={submission.token}>
                    <TableRow>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.data.personalInfo?.fullName || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(submission.submittedAt).toLocaleString()}
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
                            title="Delete submission"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => approveSubmission(submission)}
                            title="Approve creator"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {submission.showPreview && (
                      <TableRow>
                        <TableCell colSpan={4} className="bg-muted/30">
                          <div className="p-2 rounded overflow-auto max-h-96">
                            <pre className="text-xs">
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
