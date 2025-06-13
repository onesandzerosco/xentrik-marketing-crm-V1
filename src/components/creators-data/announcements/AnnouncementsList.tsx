
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Clock } from 'lucide-react';
import { format, isAfter, subHours } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface AnnouncementsListProps {
  creatorId: string;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcementId: string) => void;
}

const AnnouncementsList: React.FC<AnnouncementsListProps> = ({ 
  creatorId, 
  onEdit, 
  onDelete 
}) => {
  const { data: announcements, isLoading, error } = useQuery({
    queryKey: ['model-announcements', creatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_announcements')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        throw error;
      }

      return data as Announcement[];
    },
    enabled: !!creatorId,
  });

  // Helper function to check if announcement is less than 24 hours old
  const isRecent = (createdAt: string) => {
    const announcementDate = new Date(createdAt);
    const twentyFourHoursAgo = subHours(new Date(), 24);
    return isAfter(announcementDate, twentyFourHoursAgo);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error loading announcements. Please try again.
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No announcements yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => {
        const recent = isRecent(announcement.created_at);
        
        return (
          <Card 
            key={announcement.id} 
            className={recent ? "border-brand-yellow shadow-md" : ""}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    {recent && (
                      <Badge variant="secondary" className="text-xs bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20">
                        <Clock className="h-3 w-3 mr-1" />
                        New
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    Posted {format(new Date(announcement.created_at), 'MMM d, yyyy h:mm a')}
                  </CardDescription>
                </div>
                
                {(onEdit || onDelete) && (
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {announcement.content}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AnnouncementsList;
