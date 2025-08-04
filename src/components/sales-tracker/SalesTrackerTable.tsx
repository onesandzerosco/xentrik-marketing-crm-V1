import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { AddModelDialog } from './AddModelDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface SalesEntry {
  id: string;
  model_name: string;
  day_of_week: number;
  earnings: number;
  working_day?: boolean;
}

interface SalesModel {
  model_name: string;
}

interface SalesTrackerTableProps {
  chatterId?: string;
  selectedWeek?: Date;
}

const DAYS_OF_WEEK = [
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
];

export const SalesTrackerTable: React.FC<SalesTrackerTableProps> = ({
  chatterId,
  selectedWeek = new Date()
}) => {
  const { user, userRole, userRoles } = useAuth();
  const { toast } = useToast();
  const [salesData, setSalesData] = useState<SalesEntry[]>([]);
  const [models, setModels] = useState<SalesModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModel, setShowAddModel] = useState(false);

  const effectiveChatterId = chatterId || user?.id;
  const isAdmin = userRole === 'Admin' || userRoles?.includes('Admin');
  const canEdit = isAdmin || effectiveChatterId === user?.id;

  // Calculate week start (Thursday)
  const getWeekStart = (date: Date) => {
    const day = date.getDay();
    const thursday = new Date(date);
    
    if (day === 0) { // Sunday
      thursday.setDate(date.getDate() - 3);
    } else if (day < 4) { // Monday, Tuesday, Wednesday
      thursday.setDate(date.getDate() - day - 3);
    } else { // Thursday, Friday, Saturday
      thursday.setDate(date.getDate() - day + 4);
    }
    
    return thursday;
  };

  const weekStart = getWeekStart(selectedWeek);
  const currentWeekStart = getWeekStart(new Date());
  const isCurrentWeek = weekStart.getTime() === currentWeekStart.getTime();
  const isFutureWeek = weekStart.getTime() > currentWeekStart.getTime();
  
  // Week is editable if it's current week or future, and user has edit permissions
  const isWeekEditable = canEdit && (isCurrentWeek || isFutureWeek);

  useEffect(() => {
    if (effectiveChatterId) {
      fetchData();
    }
  }, [effectiveChatterId, selectedWeek]);

  const fetchData = async () => {
    if (!effectiveChatterId) return;
    
    setIsLoading(true);
    try {
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      
      // Fetch sales data for the week
      const { data: salesData, error: salesError } = await supabase
        .from('sales_tracker')
        .select('*')
        .eq('chatter_id', effectiveChatterId)
        .eq('week_start_date', weekStartStr);

      if (salesError) throw salesError;

      // Fetch unique models for this chatter
      const { data: modelsData, error: modelsError } = await supabase
        .from('sales_tracker')
        .select('model_name')
        .eq('chatter_id', effectiveChatterId)
        .eq('week_start_date', weekStartStr);

      if (modelsError) throw modelsError;

      const uniqueModels = Array.from(
        new Set(modelsData?.map(m => m.model_name) || [])
      ).map(name => ({ model_name: name }));

      setSalesData(salesData || []);
      setModels(uniqueModels);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast({
        title: "Error",
        description: "Failed to load sales data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEarnings = (modelName: string, dayOfWeek: number) => {
    const entry = salesData.find(
      s => s.model_name === modelName && s.day_of_week === dayOfWeek
    );
    return entry?.earnings || 0;
  };

  const updateEarnings = async (modelName: string, dayOfWeek: number, earnings: number) => {
    if (!effectiveChatterId || !isWeekEditable) return;

    try {
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('sales_tracker')
        .upsert({
          model_name: modelName,
          day_of_week: dayOfWeek,
          earnings,
          week_start_date: weekStartStr,
          chatter_id: effectiveChatterId,
          working_day: true
        }, {
          onConflict: 'chatter_id,model_name,day_of_week,week_start_date'
        });

      if (error) throw error;

      // Update local state
      setSalesData(prev => {
        const existing = prev.find(
          s => s.model_name === modelName && s.day_of_week === dayOfWeek
        );
        
        if (existing) {
          return prev.map(s =>
            s.model_name === modelName && s.day_of_week === dayOfWeek
              ? { ...s, earnings }
              : s
          );
        } else {
          return [...prev, {
            id: `temp-${Date.now()}`,
            model_name: modelName,
            day_of_week: dayOfWeek,
            earnings,
            working_day: true
          }];
        }
      });
    } catch (error) {
      console.error('Error updating earnings:', error);
      toast({
        title: "Error",
        description: "Failed to update earnings",
        variant: "destructive",
      });
    }
  };

  const removeModel = async (modelName: string) => {
    if (!effectiveChatterId || !isAdmin) return;

    try {
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('sales_tracker')
        .delete()
        .eq('chatter_id', effectiveChatterId)
        .eq('model_name', modelName)
        .eq('week_start_date', weekStartStr);

      if (error) throw error;

      setModels(prev => prev.filter(m => m.model_name !== modelName));
      setSalesData(prev => prev.filter(s => s.model_name !== modelName));
      
      toast({
        title: "Success",
        description: "Model removed successfully",
      });
    } catch (error) {
      console.error('Error removing model:', error);
      toast({
        title: "Error",
        description: "Failed to remove model",
        variant: "destructive",
      });
    }
  };

  const getDayTotal = (dayOfWeek: number) => {
    return salesData
      .filter(s => s.day_of_week === dayOfWeek)
      .reduce((sum, s) => sum + s.earnings, 0);
  };

  const getModelTotal = (modelName: string) => {
    return salesData
      .filter(s => s.model_name === modelName)
      .reduce((sum, s) => sum + s.earnings, 0);
  };

  const getWeekTotal = () => {
    return salesData.reduce((sum, s) => sum + s.earnings, 0);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse"></div>
        <div className="h-32 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isWeekEditable && (
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setShowAddModel(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Model
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Model</TableHead>
              {DAYS_OF_WEEK.map(day => (
                <TableHead key={day.value} className="text-center min-w-[80px]">
                  {day.label}
                </TableHead>
              ))}
              <TableHead className="text-center min-w-[80px]">Total</TableHead>
              {isAdmin && isWeekEditable && (
                <TableHead className="w-[50px]"></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model.model_name}>
                <TableCell className="font-medium">{model.model_name}</TableCell>
                {DAYS_OF_WEEK.map(day => (
                  <TableCell key={day.value} className="text-center">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={getEarnings(model.model_name, day.value)}
                      onChange={(e) => updateEarnings(
                        model.model_name, 
                        day.value, 
                        parseFloat(e.target.value) || 0
                      )}
                      className="w-full text-center"
                      disabled={!isWeekEditable}
                    />
                  </TableCell>
                ))}
                <TableCell className="text-center font-semibold">
                  ${getModelTotal(model.model_name).toFixed(2)}
                </TableCell>
                {isAdmin && isWeekEditable && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeModel(model.model_name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {models.length > 0 && (
              <TableRow className="border-t-2">
                <TableCell className="font-bold">Daily Total</TableCell>
                {DAYS_OF_WEEK.map(day => (
                  <TableCell key={day.value} className="text-center font-bold">
                    ${getDayTotal(day.value).toFixed(2)}
                  </TableCell>
                ))}
                <TableCell className="text-center font-bold text-primary">
                  ${getWeekTotal().toFixed(2)}
                </TableCell>
                {isAdmin && isWeekEditable && (
                  <TableCell></TableCell>
                )}
              </TableRow>
            )}
            {models.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={DAYS_OF_WEEK.length + 2 + (isAdmin && isWeekEditable ? 1 : 0)} 
                  className="text-center text-muted-foreground py-8"
                >
                  No models added yet. Click "Add Model" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddModelDialog
        open={showAddModel}
        onOpenChange={setShowAddModel}
        chatterId={effectiveChatterId}
        weekStart={weekStart}
        onModelAdded={fetchData}
      />
    </div>
  );
};