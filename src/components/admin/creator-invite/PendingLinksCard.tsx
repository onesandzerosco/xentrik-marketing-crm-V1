
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Copy, ExternalLink, Trash2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PendingInvite {
  id: string;
  token: string;
  model_name: string | null;
  stage_name: string | null;
  status: string;
  created_at: string;
  expires_at: string | null;
}

const PendingLinksCard: React.FC = () => {
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPendingInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('creator_invitations')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingInvites(data || []);
    } catch (error: any) {
      console.error('Error fetching pending invites:', error);
      toast({
        title: "Error",
        description: "Failed to load pending invites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingInvites();
  }, []);

  const copyInviteLink = async (token: string) => {
    const inviteUrl = `${window.location.origin}/creator-onboarding/${token}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const openInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/creator-onboarding/${token}`;
    window.open(inviteUrl, '_blank');
  };

  const deleteInvite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('creator_invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPendingInvites(prev => prev.filter(invite => invite.id !== id));
      toast({
        title: "Deleted",
        description: "Invite link has been deleted",
      });
    } catch (error: any) {
      console.error('Error deleting invite:', error);
      toast({
        title: "Error",
        description: "Failed to delete invite link",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            Pending Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm sm:text-base">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-fit">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          Pending Links ({pendingInvites.length})
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Manage pending creator invitation links
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingInvites.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <Clock className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-4 opacity-50" />
            <p className="text-sm sm:text-base">No pending invites</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium text-sm sm:text-base">
                        {invite.model_name || 'Unknown Model'}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {invite.stage_name || 'No Stage'}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Created {formatDistanceToNow(new Date(invite.created_at))} ago
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteLink(invite.token)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <Copy className="h-3 w-3 mr-1 sm:mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInviteLink(invite.token)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
                  >
                    <ExternalLink className="h-3 w-3 mr-1 sm:mr-2" />
                    Open
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteInvite(invite.id)}
                    className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1 sm:mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 sm:mt-6">
          <Button 
            variant="outline" 
            onClick={fetchPendingInvites}
            className="w-full text-sm sm:text-base h-9 sm:h-10"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingLinksCard;
