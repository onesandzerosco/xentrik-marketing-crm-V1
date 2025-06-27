
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCustomAttachments = () => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);

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

  const resetAttachments = () => {
    setAttachments([]);
  };

  return {
    attachments,
    uploadingAttachments,
    handleFileChange,
    removeAttachment,
    uploadAttachments,
    resetAttachments
  };
};
