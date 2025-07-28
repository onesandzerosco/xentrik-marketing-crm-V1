
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreateCustomForm } from '@/hooks/useCreateCustomForm';
import { useCustomAttachments } from '@/hooks/useCustomAttachments';
import BasicInfoSection from './form/BasicInfoSection';
import FanInfoSection from './form/FanInfoSection';
import DatesPricingSection from './form/DatesPricingSection';
import AttachmentsSection from './form/AttachmentsSection';

interface CreateCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCustomModal: React.FC<CreateCustomModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { formData, isSubmitting, handleInputChange, resetForm, submitForm } = useCreateCustomForm(onSuccess);
  const {
    attachments,
    uploadingAttachments,
    handleFileChange,
    removeAttachment,
    uploadAttachments,
    resetAttachments
  } = useCustomAttachments();

  // Fetch active creators for the dropdown
  const { data: creators = [], isLoading: creatorsLoading } = useQuery({
    queryKey: ['active-creators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creators')
        .select('id, name, model_name')
        .eq('active', true)
        .not('model_name', 'is', null)
        .order('model_name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Upload attachments first
      const attachmentIds = await uploadAttachments();
      
      // Submit form with attachment IDs
      await submitForm(attachmentIds);
      
      // Reset everything on success
      resetAttachments();
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      resetAttachments();
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
          <BasicInfoSection
            formData={formData}
            creators={creators}
            creatorsLoading={creatorsLoading}
            onInputChange={handleInputChange}
          />

          <FanInfoSection
            formData={formData}
            onInputChange={handleInputChange}
          />

          <DatesPricingSection
            formData={formData}
            onInputChange={handleInputChange}
          />

          <AttachmentsSection
            attachments={attachments}
            onFileChange={handleFileChange}
            onRemoveAttachment={removeAttachment}
          />

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
