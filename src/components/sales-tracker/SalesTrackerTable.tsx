import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PremiumInput } from '@/components/ui/premium-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSalesData } from './hooks/useSalesData';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS_OF_WEEK = [
  { label: 'Thursday', value: 0, isWorkingDay: true },
  { label: 'Friday', value: 1, isWorkingDay: true },
  { label: 'Saturday', value: 2, isWorkingDay: true },
  { label: 'Sunday', value: 3, isWorkingDay: true },
  { label: 'Monday', value: 4, isWorkingDay: true },
  { label: 'Tuesday', value: 5, isWorkingDay: false },
  { label: 'Wednesday', value: 6, isWorkingDay: false },
];

// Move getWeekStartDate outside component to avoid temporal dead zone
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

export const SalesTrackerTable: React.FC = () => {
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(getWeekStartDate());
  const { salesData, models, isLoading, refetch } = useSalesData(selectedWeekStart);
  const { user, userRole, userRoles } = useAuth();
  const [localData, setLocalData] = useState<Record<string, string>>({});
  const [dayTypes, setDayTypes] = useState<Record<number, boolean>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const isAdmin = userRole === 'Admin' || userRoles?.includes('Admin');
  const isChatter = userRole === 'Chatter' || userRoles?.includes('Chatter');
  const isVA = userRole === 'VA' || userRoles?.includes('VA');

  // Initialize local data and day types when sales data loads
  useEffect(() => {
    const initialData: Record<string, string> = {};
    const initialDayTypes: Record<number, boolean> = {};
    
    salesData.forEach(entry => {
      const key = `${entry.model_name}-${entry.day_of_week}`;
      initialData[key] = entry.earnings?.toString() || '0';
    });
    
    // Initialize day types from DAYS_OF_WEEK default values
    DAYS_OF_WEEK.forEach(day => {
      initialDayTypes[day.value] = dayTypes[day.value] !== undefined ? dayTypes[day.value] : day.isWorkingDay;
    });
    
    setLocalData(initialData);
    setDayTypes(initialDayTypes);
  }, [salesData]);

  const getEarnings = (modelName: string, dayOfWeek: number): string => {
    const key = `${modelName}-${dayOfWeek}`;
    return localData[key] || '0';
  };

  const updateEarnings = async (modelName: string, dayOfWeek: number, value: string) => {
    if (isVA) return; // VAs can only view

    const key = `${modelName}-${dayOfWeek}`;
    setLocalData(prev => ({ ...prev, [key]: value }));

    // Save immediately without debouncing to ensure data integrity
    await saveEarnings(modelName, dayOfWeek, value);
  };

  const saveEarnings = async (modelName: string, dayOfWeek: number, value: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const earnings = parseFloat(value) || 0;

      // For Chatters, include chatter_id in the upsert conflict resolution
      // For Admins/VAs, use null chatter_id (they manage all records)
      const chatter_id = isChatter ? user?.id : null;

      const { error } = await supabase
        .from('sales_tracker')
        .upsert({
          week_start_date: selectedWeekStart,
          model_name: modelName,
          day_of_week: dayOfWeek,
          earnings,
          chatter_id,
        }, {
          onConflict: chatter_id ? 'week_start_date,model_name,day_of_week,chatter_id' : 'week_start_date,model_name,day_of_week'
        });

      if (error) {
        console.error('Error saving earnings:', error);
        toast({
          title: "Error",
          description: "Failed to save earnings. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log(`Successfully saved: ${modelName} - Day ${dayOfWeek} - $${earnings}`);
      }
    } catch (error) {
      console.error('Error saving earnings:', error);
      toast({
        title: "Error",
        description: "Failed to save earnings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const removeModel = async (modelName: string) => {
    if (!isAdmin) return;

    try {
      // Remove from sales_models table
      const { error: modelsError } = await supabase
        .from('sales_models')
        .delete()
        .eq('model_name', modelName);

      if (modelsError) throw modelsError;

      // Remove from sales_tracker table for selected week
      const { error: salesError } = await supabase
        .from('sales_tracker')
        .delete()
        .eq('model_name', modelName)
        .eq('week_start_date', selectedWeekStart);

      if (salesError) throw salesError;

      toast({
        title: "Success",
        description: `${modelName} has been removed from the tracker.`
      });

      refetch();
    } catch (error) {
      console.error('Error removing model:', error);
      toast({
        title: "Error",
        description: "Failed to remove model. Please try again.",
        variant: "destructive"
      });
    }
  };


  const updateDayType = (dayValue: number, isWorkingDay: boolean) => {
    setDayTypes(prev => ({ ...prev, [dayValue]: isWorkingDay }));
  };

  const calculateDayTotal = (dayOfWeek: number): number => {
    return models.reduce((total, model) => {
      const earnings = parseFloat(getEarnings(model.model_name, dayOfWeek)) || 0;
      return total + earnings;
    }, 0);
  };

  const calculateModelTotal = (modelName: string): number => {
    return DAYS_OF_WEEK.reduce((total, day) => {
      const earnings = parseFloat(getEarnings(modelName, day.value)) || 0;
      return total + earnings;
    }, 0);
  };

  const calculateWeeklyTotal = (): number => {
    return models.reduce((total, model) => {
      return total + calculateModelTotal(model.model_name);
    }, 0);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading sales data...</div>;
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No models added yet. Click "Add Model" to get started.
      </div>
    );
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentWeek = new Date(selectedWeekStart);
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setSelectedWeekStart(newWeek.toISOString().split('T')[0]);
  };

  const getDateForDay = (dayValue: number): string => {
    const weekStart = new Date(selectedWeekStart);
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + dayValue);
    return dayDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  const formatWeekRange = (): string => {
    const weekStart = new Date(selectedWeekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="w-full overflow-x-auto">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4 p-4 bg-card border rounded-lg">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek('prev')}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Week
        </Button>
        
        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold">Week of {formatWeekRange()}</span>
          {selectedWeekStart === getWeekStartDate() && (
            <span className="text-sm text-muted-foreground">(Current Week)</span>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateWeek('next')}
          className="flex items-center gap-2"
        >
          Next Week
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left font-semibold min-w-[120px]">Day Type</TableHead>
            <TableHead className="text-left font-semibold min-w-[120px]">Date</TableHead>
            {models.map(model => (
              <TableHead key={model.model_name} className="text-center font-semibold min-w-[120px]">
                {model.model_name}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeModel(model.model_name)}
                    className="ml-2 h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </TableHead>
            ))}
            <TableHead className="text-center font-semibold bg-primary/10 min-w-[120px]">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DAYS_OF_WEEK.map(day => (
            <TableRow key={day.value}>
              <TableCell className="font-medium">
                <Select
                  value={dayTypes[day.value] ? "working" : "non-working"}
                  onValueChange={(value) => updateDayType(day.value, value === "working")}
                  disabled={isVA}
                >
                  <SelectTrigger className="w-full bg-background border border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    <SelectItem value="working">Working Days</SelectItem>
                    <SelectItem value="non-working">Non-Working Days</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="font-medium">
                {getDateForDay(day.value)}
              </TableCell>
              {models.map(model => (
                <TableCell key={model.model_name} className="text-center">
                  <PremiumInput
                    type="number"
                    step="0.01"
                    min="0"
                    value={getEarnings(model.model_name, day.value)}
                    onChange={(e) => updateEarnings(model.model_name, day.value, e.target.value)}
                    className="w-full text-center"
                    placeholder="$0.00"
                    disabled={isVA}
                  />
                </TableCell>
              ))}
              <TableCell className="text-center font-semibold bg-primary/5">
                ${calculateDayTotal(day.value).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
          
          {/* Total Net Sales Row */}
          <TableRow className="bg-primary/10 border-t-2 border-primary">
            <TableCell className="font-bold text-lg" colSpan={2}>
              TOTAL NET SALES:
            </TableCell>
            {models.map(model => (
              <TableCell key={model.model_name} className="text-center font-bold text-lg">
                ${calculateModelTotal(model.model_name).toFixed(2)}
              </TableCell>
            ))}
            <TableCell className="text-center font-bold text-lg bg-primary/20">
              ${calculateWeeklyTotal().toFixed(2)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};