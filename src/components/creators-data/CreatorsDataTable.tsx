
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import CreatorDataModal from './CreatorDataModal';
import { getTimezoneFromLocationName } from '@/utils/timezoneUtils';

interface CreatorSubmission {
  id: string;
  name: string;
  email: string;
  submitted_at: string;
  data: any;
  token: string;
}

interface CreatorWithTimezone extends CreatorSubmission {
  timezone?: string;
}

const CreatorsDataTable: React.FC = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<CreatorWithTimezone | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [creatorsWithTimezones, setCreatorsWithTimezones] = useState<CreatorWithTimezone[]>([]);

  const { data: submissions = [], isLoading, refetch } = useQuery({
    queryKey: ['accepted-creator-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_submissions')
        .select('*')
        .eq('status', 'accepted')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching accepted submissions:', error);
        throw error;
      }

      return data as CreatorSubmission[];
    },
  });

  // Preload timezone data for all creators
  useEffect(() => {
    if (submissions.length > 0) {
      const processTimezones = async () => {
        const processedCreators = submissions.map((submission) => {
          const location = submission.data?.personalInfo?.location;
          let timezone = null;
          
          if (location) {
            timezone = getTimezoneFromLocationName(location);
            console.log('Preloaded timezone for', submission.name, ':', timezone);
          }
          
          return {
            ...submission,
            timezone
          };
        });
        
        setCreatorsWithTimezones(processedCreators);
      };

      processTimezones();
    }
  }, [submissions]);

  const handleDataUpdate = (updatedSubmission: CreatorSubmission) => {
    // Refresh the table data after successful update
    refetch();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleViewData = (submission: CreatorWithTimezone) => {
    setSelectedSubmission(submission);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading creator data...</div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No Data Available</h3>
          <p className="text-sm text-muted-foreground">No accepted creator submissions found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creatorsWithTimezones.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">{submission.name}</TableCell>
                <TableCell>{submission.email}</TableCell>
                <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">Accepted</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewData(submission)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Data
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreatorDataModal
        submission={selectedSubmission}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onDataUpdate={handleDataUpdate}
      />
    </>
  );
};

export default CreatorsDataTable;
