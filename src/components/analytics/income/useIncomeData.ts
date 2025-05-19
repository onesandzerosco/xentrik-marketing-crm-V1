
import { useMemo, useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { IncomeEntry, IncomeSource } from './types';

export const useIncomeData = () => {
  // State for date range filter
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  // State for selected income source
  const [incomeSource, setIncomeSource] = useState<string>('total');

  // Generate sample data
  const sampleIncomeData: IncomeEntry[] = useMemo(() => {
    // Generate 30 days of sample data
    return Array.from({ length: 30 }, (_, i) => {
      const currentDate = subDays(new Date(), i);
      const dateString = format(currentDate, 'yyyy-MM-dd');
      
      // Generate random values for each income source
      const subscriptions = Math.floor(Math.random() * 200) + 100;
      const tips = Math.floor(Math.random() * 150);
      const posts = Math.floor(Math.random() * 180);
      const messages = Math.floor(Math.random() * 90);
      const referrals = Math.floor(Math.random() * 50);
      const streams = Math.floor(Math.random() * 250);
      
      return {
        date: dateString,
        subscriptions,
        tips,
        posts,
        messages,
        referrals,
        streams,
        total: subscriptions + tips + posts + messages + referrals + streams
      };
    }).reverse(); // Reverse to get chronological order
  }, []);

  // Filter data based on selected date range
  const filteredData = useMemo(() => {
    if (!date?.from) return sampleIncomeData;
    
    return sampleIncomeData.filter(entry => {
      const entryDate = parseISO(entry.date);
      if (date.from && date.to) {
        return entryDate >= date.from && entryDate <= date.to;
      }
      return entryDate >= date.from;
    });
  }, [sampleIncomeData, date]);

  // Calculate summary statistics
  const summaryStats = useMemo<IncomeSource>(() => {
    if (filteredData.length === 0) return { total: 0, average: 0, highest: 0 };
    
    const totals = {
      subscriptions: 0,
      tips: 0,
      posts: 0,
      messages: 0,
      referrals: 0,
      streams: 0,
      total: 0
    };
    
    let highest = 0;
    
    filteredData.forEach(entry => {
      totals.subscriptions += entry.subscriptions;
      totals.tips += entry.tips;
      totals.posts += entry.posts;
      totals.messages += entry.messages;
      totals.referrals += entry.referrals;
      totals.streams += entry.streams;
      totals.total += entry.total;
      
      highest = Math.max(highest, entry[incomeSource as keyof IncomeEntry] as number);
    });
    
    return {
      total: totals[incomeSource as keyof typeof totals] as number,
      average: Math.round(totals[incomeSource as keyof typeof totals] as number / filteredData.length),
      highest
    };
  }, [filteredData, incomeSource]);

  return {
    date,
    setDate,
    incomeSource,
    setIncomeSource,
    filteredData,
    summaryStats
  };
};
