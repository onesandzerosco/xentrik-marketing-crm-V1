
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, Search, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { getTimezoneFromLocationName, getTimezoneInfo } from '@/utils/timezoneUtils';
import CreatorDataModal from './CreatorDataModal';

interface CreatorSubmission {
  id: string;
  name: string;
  email: string;
  submitted_at: string;
  data: any;
  token: string;
}

interface SubmissionWithTimezone extends CreatorSubmission {
  timezoneInfo?: {
    timezone: string | null;
    observesDST: boolean;
    currentlyInDST: boolean;
    formattedTime: string;
  } | null;
}

const CreatorsDataTable: React.FC = () => {
  const { userRole, userRoles } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionWithTimezone[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<SubmissionWithTimezone[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithTimezone | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Check if user has access
  const hasAccess = userRole === 'Admin' || 
                   userRoles?.includes('Admin') ||
                   userRole === 'VA' || 
                   userRoles?.includes('VA') ||
                   userRole === 'Chatter' || 
                   userRoles?.includes('Chatter');

  useEffect(() => {
    if (hasAccess) {
      fetchSubmissions();
    }
  }, [hasAccess]);

  useEffect(() => {
    filterSubmissions();
  }, [searchTerm, submissions]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('onboarding_submissions')
        .select('*')
        .eq('status', 'accepted')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        return;
      }

      if (data) {
        // Preload timezone data for all submissions
        const submissionsWithTimezone = data.map((submission): SubmissionWithTimezone => {
          const location = submission.data?.personalInfo?.location;
          
          if (location) {
            const timezone = getTimezoneFromLocationName(location);
            if (timezone) {
              const timezoneInfo = getTimezoneInfo(timezone);
              return {
                ...submission,
                timezoneInfo: {
                  timezone,
                  ...timezoneInfo
                }
              };
            }
          }
          
          return {
            ...submission,
            timezoneInfo: null
          };
        });

        setSubmissions(submissionsWithTimezone);
        
        console.log('Preloaded timezone data for', submissionsWithTimezone.length, 'submissions');
      }
    } catch (error) {
      console.error('Error in fetchSubmissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    if (!searchTerm.trim()) {
      setFilteredSubmissions(submissions);
      return;
    }

    const filtered = submissions.filter(submission => {
      const searchLower = searchTerm.toLowerCase();
      const name = submission.name?.toLowerCase() || '';
      const email = submission.email?.toLowerCase() || '';
      const location = submission.data?.personalInfo?.location?.toLowerCase() || '';
      
      return name.includes(searchLower) || 
             email.includes(searchLower) || 
             location.includes(searchLower);
    });

    setFilteredSubmissions(filtered);
  };

  const handleViewSubmission = (submission: SubmissionWithTimezone) => {
    setSelectedSubmission(submission);
    setModalOpen(true);
  };

  const handleDataUpdate = (updatedSubmission: CreatorSubmission) => {
    // Preserve timezone info when updating
    const submissionWithTimezone = submissions.find(s => s.id === updatedSubmission.id);
    const updatedWithTimezone: SubmissionWithTimezone = {
      ...updatedSubmission,
      timezoneInfo: submissionWithTimezone?.timezoneInfo || null
    };

    setSubmissions(prev => 
      prev.map(s => s.id === updatedSubmission.id ? updatedWithTimezone : s)
    );
    setSelectedSubmission(updatedWithTimezone);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getDSTLabel = (timezoneInfo: SubmissionWithTimezone['timezoneInfo']) => {
    if (!timezoneInfo) return '';
    
    if (!timezoneInfo.observesDST) {
      return ''; // No DST label for regions that don't observe DST
    }
    
    if (timezoneInfo.currentlyInDST) {
      return ' (DST)'; // Currently in daylight saving time
    }
    
    return ' (Standard)'; // Observes DST but currently in standard time
  };

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view this data.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading model profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredSubmissions.length} model profile{filteredSubmissions.length !== 1 ? 's' : ''} found
      </div>

      {/* Submissions Grid */}
      <div className="grid gap-4">
        {filteredSubmissions.map((submission) => (
          <Card key={submission.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{submission.name}</CardTitle>
                <Badge variant="secondary">Accepted</Badge>
              </div>
              <CardDescription className="space-y-1">
                <div>{submission.email}</div>
                <div className="text-xs text-muted-foreground">
                  Submitted: {formatDate(submission.submitted_at)}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">Location:</span>{' '}
                    {submission.data?.personalInfo?.location || 'Not provided'}
                  </div>
                  {submission.timezoneInfo?.timezone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Local time: {submission.timezoneInfo.formattedTime}
                        {getDSTLabel(submission.timezoneInfo)}
                      </span>
                    </div>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewSubmission(submission)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubmissions.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No model profiles found matching your search.</p>
        </div>
      )}

      {/* Modal */}
      <CreatorDataModal
        submission={selectedSubmission}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onDataUpdate={handleDataUpdate}
        preloadedTimezoneInfo={selectedSubmission?.timezoneInfo}
      />
    </div>
  );
};

export default CreatorsDataTable;
