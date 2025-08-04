import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, User, Plus, CalendarIcon, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SalesTrackerTable } from './SalesTrackerTable';
import { SalesTrackerHeader } from './SalesTrackerHeader';
import { useParams, useNavigate } from 'react-router-dom';

interface Chatter {
  id: string;
  name: string;
  email: string;
  sales_tracker_link?: string;
}

interface ModelOption {
  model_name: string;
}

export const AdminSalesView: React.FC = () => {
  const { id: selectedChatterId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chatters, setChatters] = useState<Chatter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [selectedModelName, setSelectedModelName] = useState('');
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date>(() => {
    // Initialize with the current Thursday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const thursday = new Date(today);
    
    if (dayOfWeek <= 4) {
      // If date is Thursday or before, go to this week's Thursday
      const daysToThursday = 4 - dayOfWeek;
      thursday.setDate(today.getDate() + daysToThursday);
    } else {
      // If date is Friday/Saturday/Sunday, go to next week's Thursday
      const daysToNextThursday = (4 + 7 - dayOfWeek) % 7;
      thursday.setDate(today.getDate() + daysToNextThursday);
    }
    
    return thursday;
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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
    fetchAvailableModels();
  }, []);

  const fetchAvailableModels = async () => {
    setIsModelsLoading(true);
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('model_name')
        .not('model_name', 'is', null)
        .order('model_name');

      if (error) {
        console.error('Error fetching models:', error);
        return;
      }

      setAvailableModels(data || []);
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setIsModelsLoading(false);
    }
  };

  const fetchChatters = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, sales_tracker_link')
        .or('role.eq.Chatter,roles.cs.{"Chatter"},role.eq.VA,roles.cs.{"VA"},role.eq.Admin,roles.cs.{"Admin"}')
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
    if (!selectedModelName.trim()) return;
    
    const selectedWeekStart = getWeekStartFromDate(selectedWeekDate);
    
    try {
      // Check if model already exists for this week
      const { data: existingModel } = await supabase
        .from('sales_models')
        .select('model_name')
        .eq('model_name', selectedModelName.trim())
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
          model_name: selectedModelName.trim(),
          created_by: user?.id,
          week_start_date: selectedWeekStart
        });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Model "${selectedModelName}" has been added.`
      });
      
      setSelectedModelName('');
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

  // Function to get the Thursday from any date (ensures we always land on Thursday)
  const getThursdayFromDate = (date: Date): Date => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const thursday = new Date(date);
    
    if (dayOfWeek <= 4) {
      // If date is Thursday or before, go to this week's Thursday
      const daysToThursday = 4 - dayOfWeek;
      thursday.setDate(date.getDate() + daysToThursday);
    } else {
      // If date is Friday/Saturday/Sunday, go to next week's Thursday
      const daysToNextThursday = (4 + 7 - dayOfWeek) % 7;
      thursday.setDate(date.getDate() + daysToNextThursday);
    }
    
    return thursday;
  };

  // Function to get week start date (Thursday) from any date
  const getWeekStartFromDate = (date: Date): string => {
    const thursday = getThursdayFromDate(date);
    return thursday.toISOString().split('T')[0];
  };

  const formatWeekRange = (date: Date): string => {
    const thursday = getThursdayFromDate(date);
    const weekStart = new Date(thursday);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Thursday + 6 days = Wednesday
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  if (selectedChatterId) {
    const selectedChatter = chatters.find(c => c.id === selectedChatterId);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/sales-tracker')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Team
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {selectedChatter?.id === user?.id ? 'My Sales Tracker' : `${selectedChatter?.name}'s Sales Tracker`}
            </h2>
            <p className="text-muted-foreground">{selectedChatter?.email}</p>
          </div>
        </div>
        
        <SalesTrackerHeader />
        
        {/* Chatter's Sales Tracker Link */}
        {selectedChatter?.sales_tracker_link && (
          <Card className="bg-card/50 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Chatter's Sales Tracker</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedChatter.sales_tracker_link, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Link
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 break-all">
                {selectedChatter.sales_tracker_link}
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card className="bg-secondary/10 border-muted">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-foreground flex items-center gap-2">
                  Weekly Sales Tracker
                  <span className="text-sm text-muted-foreground font-normal">
                    (Thursday to Wednesday)
                  </span>
                </CardTitle>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {formatWeekRange(selectedWeekDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={selectedWeekDate}
                      onSelect={(date) => {
                        if (date) {
                          // Ensure we always get the Thursday of the selected week
                          const thursday = getThursdayFromDate(date);
                          setSelectedWeekDate(thursday);
                          setIsCalendarOpen(false);
                        }
                      }}
                      disabled={(date) => {
                        // Only allow Thursdays to be selected
                        return date.getDay() !== 4; // 4 = Thursday
                      }}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
                      <Label htmlFor="model-select">Select Model</Label>
                      <Select value={selectedModelName} onValueChange={setSelectedModelName}>
                        <SelectTrigger>
                          <SelectValue placeholder={isModelsLoading ? "Loading models..." : "Select a model"} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border border-border z-50">
                          {availableModels.map((model) => (
                            <SelectItem key={model.model_name} value={model.model_name}>
                              {model.model_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddModelOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={addModel} disabled={!selectedModelName.trim() || isModelsLoading}>
                        Add Model
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <SalesTrackerTable chatterId={selectedChatterId} />
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
          <CardTitle className="text-foreground">Select Team Member</CardTitle>
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
                  onClick={() => navigate(`/sales-tracker/${chatter.id}`)}
                >
                  <CardContent className="p-4">
                     <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                         <User className="h-5 w-5 text-primary" />
                       </div>
                       <div className="flex-1">
                         <div className="flex items-center gap-2">
                           <h3 className="font-semibold text-foreground">
                             {chatter.id === user?.id ? 'Me' : chatter.name}
                           </h3>
                           {chatter.id === user?.id && (
                             <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                               You
                             </span>
                           )}
                         </div>
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