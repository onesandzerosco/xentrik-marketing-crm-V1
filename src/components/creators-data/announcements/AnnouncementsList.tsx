
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  profiles?: {
    name: string;
  };
}

interface AnnouncementsListProps {
  creatorId: string;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcementId: string) => void;
}

const AnnouncementsList: React.FC<AnnouncementsListProps> = ({
  creatorId,
  onEdit,
  onDelete,
}) => {
  const { userRole, userRoles } = useAuth();
  
  const canEdit = userRole === 'Admin' || userRoles?.includes('Admin');

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['model-announcements', creatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('model_announcements')
        .select(`
          *,
          profiles:created_by (
            name
          )
        `)
        .eq('creator_id', creatorId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        throw error;
      }

      return data as Announcement[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading announcements...</div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No announcements yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <div key={announcement.id} className="border rounded-lg p-4 bg-card/50">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-foreground">{announcement.title}</h4>
            {canEdit && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit?.(announcement)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete?.(announcement.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
            {announcement.content}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              By {announcement.profiles?.name || 'Unknown'} on{' '}
              {format(new Date(announcement.created_at), 'MMM d, yyyy h:mm a')}
            </span>
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementsList;
