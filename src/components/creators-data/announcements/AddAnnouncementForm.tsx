
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

interface AddAnnouncementFormProps {
  creatorId: string;
  onCancel?: () => void;
}

const AddAnnouncementForm: React.FC<AddAnnouncementFormProps> = ({
  creatorId,
  onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAnnouncementMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const { data, error } = await supabase
        .from('model_announcements')
        .insert({
          creator_id: creatorId,
          title,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating announcement:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-announcements', creatorId] });
      setTitle('');
      setContent('');
      toast({
        title: "Announcement Created",
        description: "The announcement has been added successfully.",
      });
      onCancel?.();
    },
    onError: (error) => {
      console.error('Failed to create announcement:', error);
      toast({
        title: "Error",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }
    createAnnouncementMutation.mutate({ title: title.trim(), content: content.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-card/50">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Add New Announcement</h4>
        {onCancel && (
          <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter announcement title..."
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter announcement content..."
          className="mt-1 min-h-[100px]"
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={createAnnouncementMutation.isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          {createAnnouncementMutation.isPending ? 'Adding...' : 'Add Announcement'}
        </Button>
      </div>
    </form>
  );
};

export default AddAnnouncementForm;
