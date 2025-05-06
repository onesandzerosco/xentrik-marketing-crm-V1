
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Mail } from "lucide-react";
import { format } from "date-fns";
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

// Define the status type to fix the TypeScript error
type InvitationStatus = "pending" | "completed" | "expired";

// Define the Invitation type with the correct status type
interface Invitation {
  id: string;
  email: string;
  stage_name: string | null;
  token: string;
  status: InvitationStatus;
  created_at: string;
  expires_at: string;
  submission_path: string | null;
}

const InvitationsList: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('creator_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Ensure the data conforms to our expected Invitation type
      if (data) {
        // Type assertion to ensure the status is of type InvitationStatus
        const typedInvitations: Invitation[] = data.map(item => ({
          ...item,
          status: item.status as InvitationStatus
        }));
        
        setInvitations(typedInvitations);
      }
      
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: InvitationStatus) => {
    switch(status) {
      case 'pending':
        return 'outline';
      case 'completed':
        return 'default';
      case 'expired':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Invitations</CardTitle>
        <CardDescription>
          History of creator invitations sent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px]">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[160px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : invitations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Stage Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium flex items-center">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      {invitation.email}
                    </TableCell>
                    <TableCell>{invitation.stage_name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(invitation.status)}>
                        {invitation.status}
                      </Badge>
                    </TableCell>
                    <TableCell title={invitation.created_at}>
                      {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell title={invitation.expires_at}>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No invitations sent yet
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default InvitationsList;
