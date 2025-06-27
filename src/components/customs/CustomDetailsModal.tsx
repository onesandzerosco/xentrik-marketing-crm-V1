
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, User, Paperclip, Edit2, Save, X, Download, Eye } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Custom } from '@/types/custom';

interface CustomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  custom: Custom | null;
}

const CustomDetailsModal: React.FC<CustomDetailsModalProps> = ({ isOpen, onClose, custom }) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  React.useEffect(() => {
    if (custom) {
      setEditedDescription(custom.description);
      setEditedDueDate(custom.due_date || '');
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
      setIsEditingDescription(false);
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

  if (!custom) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const canEditDescription = custom.status === 'partially_paid' || custom.status === 'fully_paid';
  const isOverdue = custom.due_date ? isAfter(new Date(), parseISO(custom.due_date)) : false;

  const handleSaveDescription = () => {
    updateDescriptionMutation.mutate({
      customId: custom.id,
      description: editedDescription
    });
  };

  const handleCancelDescription = () => {
    setEditedDescription(custom.description);
    setIsEditingDescription(false);
  };

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

  const handleDownloadAttachment = async (attachmentPath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('custom_attachments')
        .download(attachmentPath);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachmentPath.split('/').pop() || 'attachment';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download attachment",
        variant: "destructive",
      });
      console.error('Error downloading attachment:', error);
    }
  };

  const handleViewAttachment = async (attachmentPath: string) => {
    try {
      const { data } = await supabase.storage
        .from('custom_attachments')
        .getPublicUrl(attachmentPath);
      
      window.open(data.publicUrl, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to view attachment",
        variant: "destructive",
      });
      console.error('Error viewing attachment:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Custom Details</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-brand-yellow border-brand-yellow">
                {custom.model_name}
              </Badge>
              {isOverdue && (
                <Badge variant="destructive" className="text-red-400 border-red-400">
                  Overdue
                </Badge>
              )}
            </div>
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
              {canEditDescription && !isEditingDescription && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingDescription(true)}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Button>
              )}
            </div>
            
            {isEditingDescription ? (
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
                    onClick={handleSaveDescription}
                    disabled={updateDescriptionMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-3 w-3" />
                    {updateDescriptionMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelDescription}
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

          {/* Dates and Pricing - Reorganized Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Dates */}
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
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDueDate(true)}
                      className="flex items-center gap-2 h-6 px-2"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
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
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveDueDate}
                        disabled={updateDueDateMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-3 w-3" />
                        {updateDueDateMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelDueDate}
                        disabled={updateDueDateMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <X className="h-3 w-3" />
                        Cancel
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

            {/* Right Column - Pricing and Status */}
            <div className="space-y-4">
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

          {/* Attachments - Enhanced with View/Download */}
          {custom.attachments && custom.attachments.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Attachments</label>
              <div className="mt-2 space-y-2">
                {custom.attachments.map((attachmentPath, index) => (
                  <div key={index} className="flex items-center justify-between bg-secondary/20 p-3 rounded">
                    <div className="flex items-center">
                      <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-white text-sm">
                        {attachmentPath.split('/').pop() || `Attachment ${index + 1}`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewAttachment(attachmentPath)}
                        className="flex items-center gap-1 h-8 px-2"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadAttachment(attachmentPath)}
                        className="flex items-center gap-1 h-8 px-2"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
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
