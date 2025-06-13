
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Plus } from 'lucide-react';
import AnnouncementsList from './AnnouncementsList';
import AddAnnouncementForm from './AddAnnouncementForm';
import EditAnnouncementModal from './EditAnnouncementModal';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface AnnouncementsTabProps {
  creatorId: string;
}

const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({ creatorId }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userRole, userRoles } = useAuth();
  
  const canEdit = userRole === 'Admin' || userRoles?.includes('Admin');

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const { error } = await supabase
        .from('model_announcements')
        .update({ is_active: false })
        .eq('id', announcementId);

      if (error) {
        console.error('Error deleting announcement:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-announcements', creatorId] });
      toast({
        title: "Announcement Deleted",
        description: "The announcement has been removed successfully.",
      });
    },
    onError: (error) => {
      console.error('Failed to delete announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setEditModalOpen(true);
  };

  const handleDelete = (announcementId: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncementMutation.mutate(announcementId);
    }
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Model Announcements</h3>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Announcement
          </Button>
        </div>
      )}

      {!canEdit && (
        <h3 className="text-lg font-semibold mb-4">Model Announcements</h3>
      )}

      {showAddForm && canEdit && (
        <AddAnnouncementForm
          creatorId={creatorId}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <AnnouncementsList
        creatorId={creatorId}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canEdit ? handleDelete : undefined}
      />

      <EditAnnouncementModal
        announcement={editingAnnouncement}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        creatorId={creatorId}
      />
    </div>
  );
};

export default AnnouncementsTab;
