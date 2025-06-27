
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Save, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Custom } from '@/types/custom';

interface DescriptionSectionProps {
  custom: Custom;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({ custom }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(custom.description);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  React.useEffect(() => {
    setEditedDescription(custom.description);
  }, [custom.description]);

  const updateDescriptionMutation = useMutation({
    mutationFn: async ({ customId, description }: { customId: string; description: string }) => {
      const { error } = await supabase
        .from('customs')
        .update({ 
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', customId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customs'] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Description updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update description",
        variant: "destructive",
      });
      console.error('Error updating description:', error);
    }
  });

  const canEdit = custom.status === 'partially_paid' || custom.status === 'fully_paid';

  const handleSave = () => {
    updateDescriptionMutation.mutate({
      customId: custom.id,
      description: editedDescription
    });
  };

  const handleCancel = () => {
    setEditedDescription(custom.description);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-muted-foreground">Description</label>
        {canEdit && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            rows={4}
            className="w-full"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateDescriptionMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="h-3 w-3" />
              {updateDescriptionMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={updateDescriptionMutation.isPending}
              className="flex items-center gap-2"
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-300 leading-relaxed bg-secondary/20 p-3 rounded">
          {custom.description}
        </p>
      )}
    </div>
  );
};

export default DescriptionSection;
