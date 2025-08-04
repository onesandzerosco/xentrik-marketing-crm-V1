import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentWeekStart } from '@/lib/utils';

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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch sales data for selected week or current week
      const weekStartDate = selectedWeekStart || getCurrentWeekStart();
      console.log('useSalesData: Fetching data for week:', weekStartDate, 'chatterId:', chatterId);
      
      let query = supabase
        .from('sales_tracker')
        .select('*')
        .eq('week_start_date', weekStartDate);

      // If chatterId is provided, filter by it
      if (chatterId) {
        query = query.eq('chatter_id', chatterId);
      }

      const { data: salesData, error: salesError } = await query;
      console.log('useSalesData: Query result:', salesData);

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
    // Only fetch if we have a chatterId when it's required
    if (chatterId) {
      fetchData();
    }
  }, [selectedWeekStart, chatterId]);

  return {
    salesData,
    models,
    isLoading,
    refetch: fetchData,
  };
};