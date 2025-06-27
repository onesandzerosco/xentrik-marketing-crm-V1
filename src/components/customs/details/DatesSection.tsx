
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Edit, Save, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Custom } from '@/types/custom';

interface DatesSectionProps {
  custom: Custom;
}

const DatesSection: React.FC<DatesSectionProps> = ({ custom }) => {
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [editedDueDate, setEditedDueDate] = useState(custom.due_date || '');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  React.useEffect(() => {
    setEditedDueDate(custom.due_date || '');
  }, [custom.due_date]);

  const updateDueDateMutation = useMutation({
    mutationFn: async ({ customId, dueDate }: { customId: string; dueDate: string | null }) => {
      const { error } = await supabase
        .from('customs')
        .update({ 
          due_date: dueDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', customId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customs'] });
      setIsEditingDueDate(false);
      toast({
        title: "Success",
        description: "Due date updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update due date",
        variant: "destructive",
      });
      console.error('Error updating due date:', error);
    }
  });

  const handleSaveDueDate = () => {
    updateDueDateMutation.mutate({
      customId: custom.id,
      dueDate: editedDueDate || null
    });
  };

  const handleCancelDueDate = () => {
    setEditedDueDate(custom.due_date || '');
    setIsEditingDueDate(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground">Sale Date</label>
        <div className="flex items-center mt-1">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-white">{format(parseISO(custom.sale_date), 'MMM dd, yyyy')}</span>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-muted-foreground">Due Date</label>
          {!isEditingDueDate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingDueDate(true)}
              disabled={updateDueDateMutation.isPending}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-white"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {isEditingDueDate ? (
          <div className="space-y-2">
            <Input
              type="date"
              value={editedDueDate}
              onChange={(e) => setEditedDueDate(e.target.value)}
              className="w-full"
              disabled={updateDueDateMutation.isPending}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveDueDate}
                disabled={updateDueDateMutation.isPending}
                className="h-8 w-8 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelDueDate}
                disabled={updateDueDateMutation.isPending}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center mt-1">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-white">
              {custom.due_date ? format(parseISO(custom.due_date), 'MMM dd, yyyy') : 'No due date set'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatesSection;
