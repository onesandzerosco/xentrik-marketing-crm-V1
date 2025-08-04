import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { SalesTrackerTable } from './SalesTrackerTable';
import { SalesTrackerHeader } from './SalesTrackerHeader';
import { Calendar as CalendarIcon, Plus, Link, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useParams } from 'react-router-dom';

interface ModelOption {
  model_name: string;
}

export const ChatterSalesView: React.FC = () => {
  const { user } = useAuth();
  const { id: viewingUserId } = useParams<{ id: string }>();
  const chatterId = viewingUserId || user?.id;
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [selectedModelName, setSelectedModelName] = useState('');
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key to force table update
  const [salesTrackerLink, setSalesTrackerLink] = useState('');
  const [isLinkSaving, setIsLinkSaving] = useState(false);

  // Initialize selectedWeekDate to current Thursday
  useEffect(() => {
    const currentThursday = getThursdayFromDate(new Date());
    setSelectedWeekDate(currentThursday);
  }, []);

  // Fetch available models (creators)
  useEffect(() => {
    fetchAvailableModels();
    fetchSalesTrackerLink();
  }, [user?.id]);

  const fetchAvailableModels = async () => {
    setIsModelsLoading(true);
    try {
      const { data, error } = await supabase
        .from('creators')
        .select('model_name')
        .not('model_name', 'is', null)
        .order('model_name');

      if (error) throw error;

      const uniqueModels = Array.from(
        new Set(data?.map(item => item.model_name).filter(Boolean))
      ).map(model_name => ({ model_name }));

      setAvailableModels(uniqueModels);
    } catch (error) {
      console.error('Error fetching models:', error);
      toast({
        title: "Error",
        description: "Failed to load available models.",
        variant: "destructive"
      });
    } finally {
      setIsModelsLoading(false);
    }
  };

  const addModel = async () => {
    if (!selectedModelName.trim()) return;
    
    try {
      const selectedWeekStart = getWeekStartFromDate(selectedWeekDate);
      
      // Check if model already exists for this week by checking sales_tracker
      const { data: existingEntries } = await supabase
        .from('sales_tracker')
        .select('model_name')
        .eq('model_name', selectedModelName.trim())
        .eq('week_start_date', selectedWeekStart)
        .eq('chatter_id', chatterId)
        .limit(1);
      
      if (existingEntries && existingEntries.length > 0) {
        toast({
          title: "Model Exists",
          description: "This model already exists for this week.",
          variant: "destructive"
        });
        return;
      }
      
      // Create initial sales_tracker entries for all 7 days of the week
      const salesTrackerEntries = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        salesTrackerEntries.push({
          week_start_date: selectedWeekStart,
          model_name: selectedModelName.trim(),
          day_of_week: dayOfWeek,
          earnings: 0,
          chatter_id: chatterId,
          working_day: true // Default to working day
        });
      }
      
      const { error } = await supabase
        .from('sales_tracker')
        .insert(salesTrackerEntries);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Model "${selectedModelName}" has been added.`
      });
      
      setSelectedModelName('');
      setIsAddModelOpen(false);
      
      // Force table refresh by updating refresh key
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error adding model:', error);
      toast({
        title: "Error",
        description: "Failed to add model. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchSalesTrackerLink = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('sales_tracker_link')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setSalesTrackerLink(data?.sales_tracker_link || '');
    } catch (error) {
      console.error('Error fetching sales tracker link:', error);
    }
  };

  const saveSalesTrackerLink = async () => {
    if (!user?.id) return;
    
    setIsLinkSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ sales_tracker_link: salesTrackerLink })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sales tracker link saved successfully."
      });
    } catch (error) {
      console.error('Error saving sales tracker link:', error);
      toast({
        title: "Error",
        description: "Failed to save sales tracker link.",
        variant: "destructive"
      });
    } finally {
      setIsLinkSaving(false);
    }
  };

  // Function to get the Thursday from any date (ensures we always land on Thursday)
  const getThursdayFromDate = (date: Date): Date => {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const thursday = new Date(date);
    
    // Calculate days to subtract to get to the Thursday of the current week
    const daysToSubtract = (dayOfWeek + 3) % 7;
    thursday.setDate(date.getDate() - daysToSubtract);
    
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

  return (
    <div className="space-y-6">
      <SalesTrackerHeader />
      
      <Card className="bg-secondary/10 border-muted">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-foreground flex items-center gap-2">
                My Sales Tracker
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
          {/* Sales Tracker Link Section */}
          <div className="mb-6 p-4 bg-card border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Link className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">My Sales Tracker Link</Label>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your sales tracker link here..."
                value={salesTrackerLink}
                onChange={(e) => setSalesTrackerLink(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={saveSalesTrackerLink}
                disabled={isLinkSaving}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLinkSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
          
          <SalesTrackerTable
            key={refreshKey} // Force remount when refreshKey changes
            selectedWeekStart={getWeekStartFromDate(selectedWeekDate)}
            chatterId={chatterId}
            onWeekChange={(weekStart) => {
              const newDate = new Date(weekStart);
              setSelectedWeekDate(newDate);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};