import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Creator {
  id: string;
  name: string;
  model_name: string;
}

interface AddModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddModelDialog: React.FC<AddModelDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [selectedCreator, setSelectedCreator] = useState<string>('');
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCreators, setIsLoadingCreators] = useState(false);

  // Fetch creators when dialog opens
  useEffect(() => {
    if (open) {
      fetchCreators();
    }
  }, [open]);

  const fetchCreators = async () => {
    setIsLoadingCreators(true);
    try {
      const { data: creatorsData, error } = await supabase
        .from('creators')
        .select('id, name, model_name')
        .eq('active', true)
        .order('name');

      if (error) throw error;

      // Filter out creators that are already added as models
      const { data: existingModels, error: modelsError } = await supabase
        .from('sales_models')
        .select('model_name');

      if (modelsError) throw modelsError;

      const existingModelNames = existingModels?.map(m => m.model_name) || [];
      const availableCreators = creatorsData?.filter(creator => 
        creator.model_name && !existingModelNames.includes(creator.model_name)
      ) || [];

      setCreators(availableCreators);
    } catch (error) {
      console.error('Error fetching creators:', error);
      toast({
        title: "Error",
        description: "Failed to load creators. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCreators(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCreator) {
      toast({
        title: "Error",
        description: "Please select a creator.",
        variant: "destructive"
      });
      return;
    }

    const creator = creators.find(c => c.id === selectedCreator);
    if (!creator) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('sales_models')
        .insert({
          model_name: creator.model_name,
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Error",
            description: "This model name already exists.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success",
        description: `${creator.model_name} has been added to the tracker.`
      });

      setSelectedCreator('');
      onOpenChange(false);
      
      // Refresh the page to reload data
      window.location.reload();
    } catch (error) {
      console.error('Error adding model:', error);
      toast({
        title: "Error",
        description: "Failed to add model. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setSelectedCreator('');
      setCreators([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Creator to Sales Tracker</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="creator">Select Creator</Label>
            {isLoadingCreators ? (
              <div className="text-sm text-muted-foreground">Loading creators...</div>
            ) : creators.length === 0 ? (
              <div className="text-sm text-muted-foreground">No available creators to add</div>
            ) : (
              <Select
                value={selectedCreator}
                onValueChange={setSelectedCreator}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a creator" />
                </SelectTrigger>
                <SelectContent>
                  {creators.map((creator) => (
                    <SelectItem key={creator.id} value={creator.id}>
                      {creator.model_name} ({creator.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedCreator || creators.length === 0}
              className="bg-gradient-premium-yellow hover:bg-gradient-premium-yellow/90 text-black"
            >
              {isLoading ? 'Adding...' : 'Add Creator'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};