import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PremiumInput } from '@/components/ui/premium-input';
import { useSalesData } from './hooks/useSalesData';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const DAYS_OF_WEEK = [
  { label: 'Thursday', value: 0, isWorkingDay: true },
  { label: 'Friday', value: 1, isWorkingDay: true },
  { label: 'Saturday', value: 2, isWorkingDay: true },
  { label: 'Sunday', value: 3, isWorkingDay: true },
  { label: 'Monday', value: 4, isWorkingDay: true },
  { label: 'Tuesday', value: 5, isWorkingDay: false },
  { label: 'Wednesday', value: 6, isWorkingDay: false },
];

const WORKING_DAYS = DAYS_OF_WEEK.filter(day => day.isWorkingDay);
const NON_WORKING_DAYS = DAYS_OF_WEEK.filter(day => !day.isWorkingDay);

export const SalesTrackerTable: React.FC = () => {
  const { salesData, models, isLoading, refetch } = useSalesData();
  const { user, userRole, userRoles } = useAuth();
  const [localData, setLocalData] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const isAdmin = userRole === 'Admin' || userRoles?.includes('Admin');
  const isChatter = userRole === 'Chatter' || userRoles?.includes('Chatter');
  const isVA = userRole === 'VA' || userRoles?.includes('VA');

  // Initialize local data when sales data loads
  useEffect(() => {
    const initialData: Record<string, string> = {};
    salesData.forEach(entry => {
      const key = `${entry.model_name}-${entry.day_of_week}`;
      initialData[key] = entry.earnings?.toString() || '0';
    });
    setLocalData(initialData);
  }, [salesData]);

  const getEarnings = (modelName: string, dayOfWeek: number): string => {
    const key = `${modelName}-${dayOfWeek}`;
    return localData[key] || '0';
  };

  const updateEarnings = async (modelName: string, dayOfWeek: number, value: string) => {
    if (isVA) return; // VAs can only view

    const key = `${modelName}-${dayOfWeek}`;
    setLocalData(prev => ({ ...prev, [key]: value }));

    // Debounce the API call
    setTimeout(async () => {
      if (localData[key] === value) { // Only update if value hasn't changed
        await saveEarnings(modelName, dayOfWeek, value);
      }
    }, 1000);
  };

  const saveEarnings = async (modelName: string, dayOfWeek: number, value: string) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const earnings = parseFloat(value) || 0;
      const weekStartDate = getWeekStartDate();

      const { error } = await supabase
        .from('sales_tracker')
        .upsert({
          week_start_date: weekStartDate,
          model_name: modelName,
          day_of_week: dayOfWeek,
          earnings,
          chatter_id: isChatter ? user?.id : null,
        }, {
          onConflict: 'week_start_date,model_name,day_of_week'
        });

      if (error) {
        console.error('Error saving earnings:', error);
        toast({
          title: "Error",
          description: "Failed to save earnings. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving earnings:', error);
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

      // Remove from sales_tracker table for current week
      const weekStartDate = getWeekStartDate();
      const { error: salesError } = await supabase
        .from('sales_tracker')
        .delete()
        .eq('model_name', modelName)
        .eq('week_start_date', weekStartDate);

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

  const renderDaySection = (days: typeof DAYS_OF_WEEK, sectionTitle: string) => (
    <div className="mb-6">
      <div className="bg-secondary/20 p-3 mb-2">
        <h3 className="font-semibold text-foreground">{sectionTitle}:</h3>
      </div>
      {days.map(day => {
        const date = new Date();
        const weekStart = new Date(getWeekStartDate());
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + day.value);
        
        return (
          <div key={day.value} className="border-b border-muted">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left font-semibold bg-muted/50 min-w-[150px]">
                    DATE | MODEL<br />
                    <span className="text-sm font-normal">
                      {dayDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                    </span>
                  </TableHead>
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
                  <TableHead className="text-center font-semibold bg-primary/10 min-w-[120px]">
                    TOTAL
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium bg-muted/30">
                    {day.label}
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
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {renderDaySection(WORKING_DAYS, "Working Days")}
      {renderDaySection(NON_WORKING_DAYS, "Non-Working Days")}
      
      {/* Total Net Sales Row */}
      <div className="border-2 border-primary bg-primary/5">
        <Table>
          <TableBody>
            <TableRow className="bg-primary/10">
              <TableCell className="font-bold text-lg bg-primary/20 min-w-[150px]">
                TOTAL NET SALES:
              </TableCell>
              {models.map(model => (
                <TableCell key={model.model_name} className="text-center font-bold text-lg min-w-[120px]">
                  ${calculateModelTotal(model.model_name).toFixed(2)}
                </TableCell>
              ))}
              <TableCell className="text-center font-bold text-lg bg-primary/20 min-w-[120px]">
                ${calculateWeeklyTotal().toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};