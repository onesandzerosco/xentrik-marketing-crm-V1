import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { SalesTrackerTable } from './SalesTrackerTable';
import { SalesTrackerHeader } from './SalesTrackerHeader';

interface Chatter {
  id: string;
  name: string;
  email: string;
}

interface AdminSalesViewProps {
  selectedChatterId?: string;
  onSelectChatter: (chatterId: string | null) => void;
}

export const AdminSalesView: React.FC<AdminSalesViewProps> = ({ 
  selectedChatterId, 
  onSelectChatter 
}) => {
  const [chatters, setChatters] = useState<Chatter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const { user } = useAuth();

  // Function to get current week start date (Thursday)
  const getWeekStartDate = (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilThursday = (4 - dayOfWeek + 7) % 7; // 4 = Thursday
    const thursday = new Date(today);
    
    if (dayOfWeek < 4) {
      // If today is before Thursday, go to last Thursday
      thursday.setDate(today.getDate() - (7 - daysUntilThursday));
    } else {
      // If today is Thursday or after, go to this Thursday
      thursday.setDate(today.getDate() - daysUntilThursday);
    }
    
    return thursday.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchChatters();
  }, []);

  const fetchChatters = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .or('role.eq.Chatter,roles.cs.{"Chatter"}')
        .order('name');

      if (error) {
        console.error('Error fetching chatters:', error);
        return;
      }

      setChatters(data || []);
    } catch (error) {
      console.error('Error fetching chatters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addModel = async () => {
    if (!newModelName.trim()) return;
    
    const selectedWeekStart = getWeekStartDate();
    
    try {
      // Check if model already exists for this week
      const { data: existingModel } = await supabase
        .from('sales_models')
        .select('model_name')
        .eq('model_name', newModelName.trim())
        .eq('week_start_date', selectedWeekStart)
        .maybeSingle();
      
      if (existingModel) {
        toast({
          title: "Model Exists",
          description: "This model already exists for this week.",
          variant: "destructive"
        });
        return;
      }
      
      // Add to sales_models table for this specific week
      const { error } = await supabase
        .from('sales_models')
        .insert({
          model_name: newModelName.trim(),
          created_by: user?.id,
          week_start_date: selectedWeekStart
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Model "${newModelName}" has been added.`
      });
      
      setNewModelName('');
      setIsAddModelOpen(false);
      // Refresh the page to show the new model
      window.location.reload();
    } catch (error) {
      console.error('Error adding model:', error);
      toast({
        title: "Error",
        description: "Failed to add model. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (selectedChatterId) {
    const selectedChatter = chatters.find(c => c.id === selectedChatterId);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => onSelectChatter(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chatters
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {selectedChatter?.name}'s Sales Tracker
            </h2>
            <p className="text-muted-foreground">{selectedChatter?.email}</p>
          </div>
        </div>
        
        <SalesTrackerHeader />
        
        <Card className="bg-secondary/10 border-muted">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                Weekly Sales Tracker
                <span className="text-sm text-muted-foreground font-normal">
                  (Thursday to Wednesday)
                </span>
              </CardTitle>
              <Dialog open={isAddModelOpen} onOpenChange={setIsAddModelOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Model
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Model</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="model-name">Model Name</Label>
                      <Input
                        id="model-name"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        placeholder="Enter model name"
                        onKeyDown={(e) => e.key === 'Enter' && addModel()}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddModelOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addModel} disabled={!newModelName.trim()}>
                        Add Model
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <SalesTrackerTable />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SalesTrackerHeader />
      
      <Card className="bg-secondary/10 border-muted">
        <CardHeader>
          <CardTitle className="text-foreground">Select a Chatter</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading chatters...
            </div>
          ) : chatters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No chatters found.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {chatters.map((chatter) => (
                <Card 
                  key={chatter.id} 
                  className="cursor-pointer hover:bg-secondary/20 transition-colors border-muted"
                  onClick={() => onSelectChatter(chatter.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{chatter.name}</h3>
                        <p className="text-sm text-muted-foreground">{chatter.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};