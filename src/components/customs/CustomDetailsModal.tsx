
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, DollarSign, User, Paperclip, Edit2, Save, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Custom {
  id: string;
  model_name: string;
  fan_display_name: string;
  fan_username: string | null;
  description: string;
  sale_date: string;
  due_date: string | null;
  downpayment: number;
  full_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  sale_by: string;
  custom_type: string | null;
  endorsed_by?: string;
  sent_by?: string;
  attachments?: string[] | null;
}

interface CustomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  custom: Custom | null;
}

const CustomDetailsModal: React.FC<CustomDetailsModalProps> = ({ isOpen, onClose, custom }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  React.useEffect(() => {
    if (custom) {
      setEditedDescription(custom.description);
    }
  }, [custom]);

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

  if (!custom) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const canEditDescription = custom.status === 'partially_paid' || custom.status === 'fully_paid';

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Custom Details</span>
            <Badge variant="outline" className="text-brand-yellow border-brand-yellow">
              {custom.model_name}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Fan Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fan Display Name</label>
              <div className="flex items-center mt-1">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-white">{custom.fan_display_name}</span>
              </div>
            </div>
            
            {custom.fan_username && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fan Username</label>
                <div className="mt-1">
                  <span className="text-white">@{custom.fan_username}</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              {canEditDescription && !isEditing && (
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

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sale Date</label>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-white">{format(parseISO(custom.sale_date), 'MMM dd, yyyy')}</span>
              </div>
            </div>
            
            {custom.due_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-white">{format(parseISO(custom.due_date), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Downpayment</label>
              <div className="flex items-center mt-1">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-white">{formatCurrency(custom.downpayment)}</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Price</label>
              <div className="flex items-center mt-1">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-white">{formatCurrency(custom.full_price)}</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">
                <Badge variant="outline" className="capitalize">
                  {custom.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sale Made By</label>
              <div className="mt-1">
                <span className="text-white">{custom.sale_by}</span>
              </div>
            </div>
            
            {custom.custom_type && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Custom Type</label>
                <div className="mt-1">
                  <span className="text-white">{custom.custom_type}</span>
                </div>
              </div>
            )}
          </div>

          {/* Team Info */}
          {(custom.endorsed_by || custom.sent_by) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {custom.endorsed_by && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Endorsed By</label>
                  <div className="mt-1">
                    <span className="text-white">{custom.endorsed_by}</span>
                  </div>
                </div>
              )}
              
              {custom.sent_by && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sent By</label>
                  <div className="mt-1">
                    <span className="text-white">{custom.sent_by}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attachments */}
          {custom.attachments && custom.attachments.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Attachments</label>
              <div className="flex items-center mt-1">
                <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-white">{custom.attachments.length} file(s)</span>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground border-t border-border pt-4">
            <div>
              <span>Created: {format(parseISO(custom.created_at), 'MMM dd, yyyy HH:mm')}</span>
            </div>
            <div>
              <span>Updated: {format(parseISO(custom.updated_at), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDetailsModal;
