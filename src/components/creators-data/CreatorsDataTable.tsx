import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import CreatorDataModal from './CreatorDataModal';
import { supabase } from '@/integrations/supabase/client';
import { filterCreatorsByGeographicRestrictions } from '@/utils/geographicUtils';
import { useAuth } from '@/context/AuthContext';

interface CreatorSubmission {
  id: string;
  name: string;
  email: string;
  submitted_at: string;
  data: any;
  token: string;
  timezone?: string;
}

const CreatorsDataTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<CreatorSubmission | null>(null);
  const [submissions, setSubmissions] = useState<CreatorSubmission[] | null>(null);
  const { user } = useAuth();

  const { isLoading, error, data } = useQuery({
    queryKey: ['onboarding-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching onboarding submissions:', error);
        throw error;
      }

      return data as CreatorSubmission[];
    },
  });

  useEffect(() => {
    if (data) {
      setSubmissions(data);
    }
  }, [data]);

  const handleOpenModal = (submission: CreatorSubmission) => {
    setSelectedSubmission(submission);
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedSubmission(null);
  };

  const handleDataUpdate = (updatedSubmission: CreatorSubmission) => {
    // Optimistically update the submissions state
    setSubmissions((prevSubmissions) => {
      if (!prevSubmissions) return [updatedSubmission]; // If no previous submissions, start with the updated one
      return prevSubmissions.map((sub) =>
        sub.id === updatedSubmission.id ? updatedSubmission : sub
      );
    });
  };

  // Filter creators based on user's geographic restrictions
  const filteredSubmissions = React.useMemo(() => {
    if (!submissions) return [];
    
    // Get current user's geographic restrictions from their profile
    // You'll need to fetch this from the user's profile data
    const userRestrictions = user?.geographicRestrictions; // Assuming this is available in auth context
    
    return filterCreatorsByGeographicRestrictions(submissions, userRestrictions);
  }, [submissions, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading submissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading submissions: {error.message}</p>
      </div>
    );
  }

  const displaySubmissions = filteredSubmissions || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <h2 className="text-2xl font-bold">
          {displaySubmissions?.length} Model Profile Submissions
        </h2>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displaySubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No submissions found
                </TableCell>
              </TableRow>
            ) : (
              displaySubmissions
                .filter(submission => 
                  searchTerm === '' || 
                  submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  submission.email.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(submission)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreatorDataModal
        submission={selectedSubmission}
        open={open}
        onOpenChange={setOpen}
        onDataUpdate={handleDataUpdate}
      />
    </div>
  );
};

export default CreatorsDataTable;
