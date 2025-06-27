
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';

interface CreateCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCustomModal: React.FC<CreateCustomModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    model_name: '',
    fan_display_name: '',
    fan_username: '',
    description: '',
    sale_date: '',
    due_date: '',
    downpayment: '',
    full_price: '',
    status: 'partially_paid',
    sale_by: '',
    custom_type: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch active creators for the dropdown
  const { data: creators = [], isLoading: creatorsLoading } = useQuery({
    queryKey: ['active-creators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creators')
        .select('id, name')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachments(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (): Promise<string[]> => {
    if (attachments.length === 0) return [];
    
    setUploadingAttachments(true);
    const uploadedIds: string[] = [];
    
    try {
      for (const file of attachments) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('custom_attachments')
          .upload(fileName, file);
        
        if (error) throw error;
        uploadedIds.push(data.path);
      }
    } catch (error) {
      console.error('Error uploading attachments:', error);
      throw new Error('Failed to upload attachments');
    } finally {
      setUploadingAttachments(false);
    }
    
    return uploadedIds;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload attachments first
      const attachmentIds = await uploadAttachments();
      
      const { error } = await supabase
        .from('customs')
        .insert([{
          model_name: formData.model_name,
          fan_display_name: formData.fan_display_name,
          fan_username: formData.fan_username || null,
          description: formData.description,
          sale_date: formData.sale_date,
          due_date: formData.due_date || null,
          downpayment: parseFloat(formData.downpayment),
          full_price: parseFloat(formData.full_price),
          status: formData.status,
          sale_by: formData.sale_by,
          custom_type: formData.custom_type || null,
          attachments: attachmentIds
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Custom created successfully",
      });

      // Reset form
      setFormData({
        model_name: '',
        fan_display_name: '',
        fan_username: '',
        description: '',
        sale_date: '',
        due_date: '',
        downpayment: '',
        full_price: '',
        status: 'partially_paid',
        sale_by: '',
        custom_type: ''
      });
      setAttachments([]);

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create custom",
        variant: "destructive",
      });
      console.error('Error creating custom:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        model_name: '',
        fan_display_name: '',
        fan_username: '',
        description: '',
        sale_date: '',
        due_date: '',
        downpayment: '',
        full_price: '',
        status: 'partially_paid',
        sale_by: '',
        custom_type: ''
      });
      setAttachments([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Custom</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model_name">Model Name *</Label>
              <Select value={formData.model_name} onValueChange={(value) => handleInputChange('model_name', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder={creatorsLoading ? "Loading creators..." : "Select a model"} />
                </SelectTrigger>
                <SelectContent>
                  {creators.map((creator) => (
                    <SelectItem key={creator.id} value={creator.name}>
                      {creator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="custom_type">Custom Type</Label>
              <Input
                id="custom_type"
                value={formData.custom_type}
                onChange={(e) => handleInputChange('custom_type', e.target.value)}
                placeholder="e.g., Video, Photo, Audio"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fan_display_name">Fan Display Name *</Label>
              <Input
                id="fan_display_name"
                value={formData.fan_display_name}
                onChange={(e) => handleInputChange('fan_display_name', e.target.value)}
                placeholder="Fan's display name (emojis supported 🎉)"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="fan_username">Fan Username</Label>
              <Input
                id="fan_username"
                value={formData.fan_username}
                onChange={(e) => handleInputChange('fan_username', e.target.value)}
                placeholder="@username (emojis supported 😊)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sale_by">Sale Made By *</Label>
              <Input
                id="sale_by"
                value={formData.sale_by}
                onChange={(e) => handleInputChange('sale_by', e.target.value)}
                placeholder="Who made this sale?"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="fully_paid">Fully Paid</SelectItem>
                  <SelectItem value="endorsed">Endorsed</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Custom description (emojis supported 💝)"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sale_date">Sale Date *</Label>
              <Input
                id="sale_date"
                type="date"
                value={formData.sale_date}
                onChange={(e) => handleInputChange('sale_date', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="due_date">Due Date (Optional)</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty if no specific due date is required
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="downpayment">Downpayment *</Label>
              <Input
                id="downpayment"
                type="number"
                step="0.01"
                min="0"
                value={formData.downpayment}
                onChange={(e) => handleInputChange('downpayment', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="full_price">Full Price *</Label>
              <Input
                id="full_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.full_price}
                onChange={(e) => handleInputChange('full_price', e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Attachments Section */}
          <div>
            <Label htmlFor="attachments">Attachments (Optional)</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('attachments')?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Add Files
                </Button>
              </div>
              
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {attachments.length} file(s) selected:
                  </p>
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || creatorsLoading || uploadingAttachments}>
              {isSubmitting ? 'Creating...' : uploadingAttachments ? 'Uploading...' : 'Create Custom'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomModal;
