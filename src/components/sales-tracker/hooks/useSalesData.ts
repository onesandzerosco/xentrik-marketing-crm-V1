import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SalesEntry {
  id: string;
  week_start_date: string;
  model_name: string;
  day_of_week: number;
  earnings: number;
  chatter_id: string | null;
  working_day: boolean;
}

interface SalesModel {
  model_name: string;
  created_at: string;
  week_start_date: string;
}

export const useSalesData = (selectedWeekStart?: string, chatterId?: string) => {
  const [salesData, setSalesData] = useState<SalesEntry[]>([]);
  const [models, setModels] = useState<SalesModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch sales data for selected week or current week
      const weekStartDate = selectedWeekStart || getWeekStartDate();
      
      let query = supabase
        .from('sales_tracker')
        .select('*')
        .eq('week_start_date', weekStartDate);

      // If chatterId is provided, filter by it
      if (chatterId) {
        query = query.eq('chatter_id', chatterId);
      }

      const { data: salesData, error: salesError } = await query;

      if (salesError) {
        console.error('Error fetching sales data:', salesError);
        return;
      }

      // Extract unique models from sales_tracker data
      const uniqueModels: SalesModel[] = [];
      const modelNamesSet = new Set<string>();
      
      salesData?.forEach(entry => {
        if (!modelNamesSet.has(entry.model_name)) {
          modelNamesSet.add(entry.model_name);
          uniqueModels.push({
            model_name: entry.model_name,
            created_at: entry.created_at,
            week_start_date: entry.week_start_date
          });
        }
      });

      // Sort models by name
      uniqueModels.sort((a, b) => a.model_name.localeCompare(b.model_name));

      setModels(uniqueModels);
      setSalesData(salesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWeekStart, chatterId]);

  return {
    salesData,
    models,
    isLoading,
    refetch: fetchData,
  };
};