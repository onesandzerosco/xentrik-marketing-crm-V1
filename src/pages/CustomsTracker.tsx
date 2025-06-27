
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PremiumCard } from '@/components/ui/premium-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import KanbanBoard from '@/components/customs/KanbanBoard';
import CreateCustomModal from '@/components/customs/CreateCustomModal';
import { useToast } from '@/hooks/use-toast';

interface Custom {
  id: string;
  model_name: string;
  fan_display_name: string;
  fan_username: string;
  description: string;
  sale_date: string;
  due_date: string;
  downpayment: number;
  full_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  sale_by: string;
  endorsed_by?: string;
  sent_by?: string;
}

const CustomsTracker = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modelFilter, setModelFilter] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch customs data
  const { data: customs = [], isLoading, error } = useQuery({
    queryKey: ['customs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Custom[];
    }
  });

  // Update custom status mutation
  const updateCustomMutation = useMutation({
    mutationFn: async ({ customId, newStatus, chatterName }: { customId: string; newStatus: string; chatterName?: string }) => {
      const { error } = await supabase
        .from('customs')
        .update({ 
          status: newStatus,
          sent_by: chatterName || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', customId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customs'] });
      toast({
        title: "Success",
        description: "Custom status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update custom status",
        variant: "destructive",
      });
      console.error('Error updating custom:', error);
    }
  });

  // Filter customs by model name
  const filteredCustoms = customs.filter(custom =>
    modelFilter === '' || custom.model_name.toLowerCase().includes(modelFilter.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-premium-border border-t-brand-yellow mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading customs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading customs</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['customs'] })}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customs Tracker</h1>
          <p className="text-muted-foreground">Manage custom orders with drag-and-drop kanban board</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Custom
        </Button>
      </div>

      {/* Filter */}
      <PremiumCard className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by model name..."
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredCustoms.length} of {customs.length} customs
          </div>
        </div>
      </PremiumCard>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard 
          customs={filteredCustoms} 
          onUpdateStatus={updateCustomMutation.mutate}
          isUpdating={updateCustomMutation.isPending}
        />
      </div>

      {/* Create Custom Modal */}
      <CreateCustomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['customs'] });
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default CustomsTracker;
