
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, MailOpen, RefreshCw, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Invitation {
  id: string;
  email: string;
  stage_name: string | null;
  status: 'pending' | 'completed' | 'expired';
  created_at: string;
  expires_at: string;
  token: string;
}

const InvitationsList: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('creator_invitations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      setInvitations(data || []);
    } catch (error: any) {
      console.error("Error fetching invitations:", error);
      toast({
        variant: "destructive",
        title: "Failed to load invitations",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resendInvitation = async (invitation: Invitation) => {
    try {
      // Send invitation email again
      const appUrl = window.location.origin;
      const { error, data } = await supabase.functions.invoke("send-invite-email", {
        body: {
          email: invitation.email,
          stageName: invitation.stage_name || undefined,
          token: invitation.token,
          appUrl,
        },
      });
      
      if (error || data?.error) {
        throw new Error(error?.message || data?.error || "Failed to resend invitation");
      }
      
      toast({
        title: "Invitation resent",
        description: `A new email has been sent to ${invitation.email}`,
      });
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      toast({
        variant: "destructive",
        title: "Failed to resend invitation",
        description: error.message,
      });
    }
  };
  
  useEffect(() => {
    fetchInvitations();
    
    // Set up a subscription for real-time updates
    const channel = supabase
      .channel('creator_invitations_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'creator_invitations' 
      }, () => {
        fetchInvitations();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (status === 'completed') {
      return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" /> Completed</Badge>;
    }
    
    if (isExpired) {
      return <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" /> Expired</Badge>;
    }
    
    return <Badge variant="outline" className="border-amber-500 text-amber-500"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Recent Invitations</CardTitle>
          <CardDescription>
            Track status of creator invitations
          </CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchInvitations} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            <MailOpen className="mx-auto h-10 w-10 mb-3 text-muted-foreground/50" />
            <p>No invitations sent yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => {
              const isExpired = new Date(invitation.expires_at) < new Date();
              const isPending = invitation.status === 'pending' && !isExpired;
              
              return (
                <div 
                  key={invitation.id} 
                  className="flex items-center justify-between p-3 rounded-md border border-muted/30 bg-muted/10"
                >
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      {invitation.stage_name && <span>as {invitation.stage_name}</span>}
                      <span className="text-xs">
                        {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invitation.status, invitation.expires_at)}
                    
                    {isPending && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => resendInvitation(invitation)} 
                        title="Resend invitation"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvitationsList;
