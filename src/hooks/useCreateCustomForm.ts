
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomFormData {
  model_name: string;
  fan_display_name: string;
  fan_username: string;
  description: string;
  sale_date: string;
  due_date: string;
  downpayment: string;
  full_price: string;
  status: string;
  sale_by: string;
  custom_type: string;
}

const initialFormData: CustomFormData = {
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
};

export const useCreateCustomForm = (onSuccess: () => void) => {
  const [formData, setFormData] = useState<CustomFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    // Automatically remove @ character from fan_username field
    if (field === 'fan_username') {
      value = value.replace('@', '');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const submitForm = async (attachmentIds: string[]) => {
    setIsSubmitting(true);

    try {
      // Ensure fan_username doesn't have @ character before saving
      const cleanUsername = formData.fan_username.replace('@', '');

      const { error } = await supabase
        .from('customs')
        .insert([{
          model_name: formData.model_name,
          fan_display_name: formData.fan_display_name,
          fan_username: cleanUsername || null,
          description: formData.description,
          sale_date: formData.sale_date,
          due_date: formData.due_date || null,
          downpayment: parseFloat(formData.downpayment),
          full_price: parseFloat(formData.full_price),
          status: formData.status,
          sale_by: formData.sale_by,
          custom_type: formData.custom_type,
          attachments: attachmentIds
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Custom created successfully",
      });

      resetForm();
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

  return {
    formData,
    isSubmitting,
    handleInputChange,
    resetForm,
    submitForm
  };
};
