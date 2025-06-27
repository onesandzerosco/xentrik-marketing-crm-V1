
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Custom, CreateCustomData, CustomStatus } from '@/types/customs';

export const useCustomsTracker = () => {
  const [customs, setCustoms] = useState<Custom[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const { toast } = useToast();

  // Fetch all customs
  const fetchCustoms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustoms(data || []);
    } catch (error) {
      console.error('Error fetching customs:', error);
      toast({
        title: 'Error fetching customs',
        description: 'Failed to load customs data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new custom
  const createCustom = async (customData: CreateCustomData) => {
    try {
      const { data, error } = await supabase
        .from('customs')
        .insert([customData])
        .select()
        .single();

      if (error) throw error;

      setCustoms(prev => [data, ...prev]);
      toast({
        title: 'Custom created',
        description: 'New custom has been added successfully.',
      });
      
      return data;
    } catch (error) {
      console.error('Error creating custom:', error);
      toast({
        title: 'Error creating custom',
        description: 'Failed to create new custom.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update custom status
  const updateCustomStatus = async (
    customId: string, 
    newStatus: CustomStatus, 
    chatterName?: string
  ) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'endorsed' && chatterName) {
        updateData.endorsed_by = chatterName;
      } else if (newStatus === 'done' && chatterName) {
        updateData.sent_by = chatterName;
      }

      const { error } = await supabase
        .from('customs')
        .update(updateData)
        .eq('id', customId);

      if (error) throw error;

      // Update local state
      setCustoms(prev => 
        prev.map(custom => 
          custom.id === customId 
            ? { ...custom, ...updateData }
            : custom
        )
      );

      // Log status change in history if chatter name provided
      if (chatterName) {
        await supabase
          .from('custom_status_history')
          .insert([{
            custom_id: customId,
            new_status: newStatus,
            chatter_name: chatterName
          }]);
      }

      toast({
        title: 'Status updated',
        description: `Custom moved to ${newStatus.replace('_', ' ')}.`,
      });

    } catch (error) {
      console.error('Error updating custom status:', error);
      toast({
        title: 'Error updating status',
        description: 'Failed to update custom status.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Get filtered customs based on selected model
  const filteredCustoms = selectedModel 
    ? customs.filter(custom => custom.model_name.toLowerCase().includes(selectedModel.toLowerCase()))
    : customs;

  // Get unique model names for filtering
  const modelNames = Array.from(new Set(customs.map(custom => custom.model_name))).sort();

  // Check if custom is overdue
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  useEffect(() => {
    fetchCustoms();
  }, []);

  return {
    customs: filteredCustoms,
    loading,
    selectedModel,
    setSelectedModel,
    modelNames,
    createCustom,
    updateCustomStatus,
    isOverdue,
    refetch: fetchCustoms
  };
};
