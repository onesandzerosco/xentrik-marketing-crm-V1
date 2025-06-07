
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Trash2, RefreshCw, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface CreatorInvitation {
  id: string;
  token: string;
  model_name: string;
  stage_name: string;
  status: string;
  created_at: string;
  expires_at: string;
}

interface PendingLinksCardProps {
  refreshTrigger: number;
}

const PendingLinksCard: React.FC<PendingLinksCardProps> = ({ refreshTrigger }) => {
  const [invitations, setInvitations] = useState<CreatorInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('creator_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, [refreshTrigger]);

  const copyInviteLink = async (token: string) => {
    const inviteLink = `${window.location.origin}/creator-onboard-form?token=${token}`;
    await navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copied",
      description: "Invitation link has been copied to clipboard",
    });
  };

  const deleteInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('creator_invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Invitation Deleted",
        description: "The invitation has been removed",
      });

      fetchInvitations();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to delete invitation",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Expired
      </Badge>;
    }

    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case 'completed':
        return <Badge variant="default" className="flex items-center gap-1 bg-green-500">
          <CheckCircle className="h-3 w-3" />
          Completed
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading invitations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Invitations ({invitations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Pending Invitations</h3>
            <p className="text-muted-foreground">
              Create an invitation link to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <div 
                key={invitation.id} 
                className="bg-card/50 backdrop-blur-sm border border-border/50 p-4 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{invitation.model_name}</h4>
                    <p className="text-sm text-muted-foreground">Stage: {invitation.stage_name}</p>
                  </div>
                  {getStatusBadge(invitation.status, invitation.expires_at)}
                </div>
                
                <div className="text-xs text-muted-foreground mb-3">
                  <p>Created: {format(new Date(invitation.created_at), 'MMM d, yyyy h:mm a')}</p>
                  <p>Expires: {format(new Date(invitation.expires_at), 'MMM d, yyyy h:mm a')}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteLink(invitation.token)}
                    disabled={isExpired(invitation.expires_at)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteInvitation(invitation.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingLinksCard;
