
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, RefreshCw, Database } from 'lucide-react';
import { format } from 'date-fns';
import CreatorDataModal from './CreatorDataModal';

interface CreatorSubmission {
  id: string;
  name: string;
  email: string;
  submitted_at: string;
  data: any;
  token: string;
}

const CreatorsDataTable: React.FC = () => {
  const [submissions, setSubmissions] = useState<CreatorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<CreatorSubmission | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchAcceptedCreators = async () => {
    try {
      setLoading(true);
      console.log('Fetching accepted creator submissions with active creators only...');
      
      // Join onboarding_submissions with creators table to filter out inactive creators
      const { data, error } = await supabase
        .from('onboarding_submissions')
        .select(`
          *,
          creators!inner(active)
        `)
        .eq('status', 'accepted')
        .eq('creators.active', true)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching accepted creators:', error);
        throw error;
      }

      console.log('Active accepted creators found:', data?.length || 0);
      
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        id: item.id,
        name: item.name,
        email: item.email,
        submitted_at: item.submitted_at,
        data: item.data,
        token: item.token
      })) || [];
      
      setSubmissions(transformedData);
    } catch (error) {
      console.error('Error loading accepted creators:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load accepted creator submissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcceptedCreators();
  }, []);

  const handleViewData = (submission: CreatorSubmission) => {
    setSelectedSubmission(submission);
    setModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading accepted creators...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Model Profiles ({submissions.length})
          </CardTitle>
          <Button onClick={fetchAcceptedCreators} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Model Profiles</h3>
              <p className="text-muted-foreground">
                No active accepted creator submissions found in the database.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {submission.name}
                      </TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {submission.token.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleViewData(submission)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View JSON
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreatorDataModal
        submission={selectedSubmission}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
};

export default CreatorsDataTable;
