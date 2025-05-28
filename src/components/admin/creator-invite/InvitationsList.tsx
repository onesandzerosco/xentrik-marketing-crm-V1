
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, File, Eye, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/utils/fileUtils";

interface Invitation {
  id: string;
  model_name: string | null;
  stage_name: string | null;
  status: string;
  created_at: string;
  expires_at: string;
  submission_path: string | null;
}

const InvitationsList: React.FC = () => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("creator_invitations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setInvitations(data || []);
    } catch (error: any) {
      console.error("Error fetching invitations:", error);
      toast({
        variant: "destructive",
        title: "Failed to load invitations",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    
    if (now > expiry && status === "pending") {
      return <Badge variant="outline" className="bg-gray-100 text-gray-500">Expired</Badge>;
    }
    
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-blue-100 text-blue-700">Pending</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-700">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const viewSubmission = async (submissionPath: string) => {
    if (!submissionPath) return;
    
    try {
      // Get the file from storage
      const { data, error } = await supabase.storage
        .from("onboard_submissions")
        .download(submissionPath);
        
      if (error) {
        throw error;
      }
      
      // Convert to JSON
      const jsonContent = await data.text();
      const submission = JSON.parse(jsonContent);
      
      // Here you would typically open a modal to display the submission
      console.log("Submission data:", submission);
      
      // For now, we'll just alert with basic info
      alert(`Submission from: ${submission.name || 'Unknown'}\nView the console for full details.`);
      
    } catch (error: any) {
      console.error("Error fetching submission:", error);
      toast({
        variant: "destructive",
        title: "Failed to load submission",
        description: error.message || "An unexpected error occurred",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            Track and manage creator invitations
          </CardDescription>
        </div>
        <Users className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <p>Loading invitations...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>No invitations found. Invite your first creator above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invitations.map((invitation) => (
              <div 
                key={invitation.id} 
                className="flex items-center justify-between border rounded-md p-3"
              >
                <div className="flex flex-col">
                  <div className="font-medium">{invitation.model_name || 'Unnamed Model'}</div>
                  {invitation.stage_name && (
                    <div className="text-sm text-muted-foreground">
                      Stage: {invitation.stage_name}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(invitation.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(invitation.status, invitation.expires_at)}
                  
                  {invitation.submission_path && (
                    <button
                      onClick={() => viewSubmission(invitation.submission_path!)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      title="View submission"
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvitationsList;
