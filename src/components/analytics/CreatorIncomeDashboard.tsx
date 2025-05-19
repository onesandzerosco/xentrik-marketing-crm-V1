
import React, { useState, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for the income data
interface IncomeEntry {
  date: string;
  subscriptions: number;
  tips: number;
  posts: number;
  messages: number;
  referrals: number;
  streams: number;
  total: number;
}

interface CreatorIncomeDashboardProps {
  creatorId: string;
  creatorName: string;
}

export const CreatorIncomeDashboard = ({ creatorId, creatorName }: CreatorIncomeDashboardProps) => {
  // State for date range filter
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  // State for selected income source
  const [incomeSource, setIncomeSource] = useState<string>('total');

  // Sample data for demonstration - in a real app, this would come from an API
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
  const summaryStats = useMemo(() => {
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

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{`Date: ${label}`}</p>
          <p className="text-sm text-primary">
            {`${payload[0].name}: $${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!date?.from) return "Select date range";
    if (!date.to) return format(date.from, "PPP");
    return `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">{creatorName}'s Income</h2>
          <p className="text-muted-foreground">Review earnings and performance metrics</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Date range picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          {/* Income source selector */}
          <Select value={incomeSource} onValueChange={setIncomeSource}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select income source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total">Total Income</SelectItem>
              <SelectItem value="subscriptions">Subscriptions</SelectItem>
              <SelectItem value="tips">Tips</SelectItem>
              <SelectItem value="posts">Posts</SelectItem>
              <SelectItem value="messages">Messages</SelectItem>
              <SelectItem value="referrals">Referrals</SelectItem>
              <SelectItem value="streams">Streams</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <CardDescription>
              {incomeSource !== 'total' ? `From ${incomeSource}` : 'All sources'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Income</CardTitle>
            <CardDescription>For selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryStats.average}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Highest Daily Income</CardTitle>
            <CardDescription>Peak earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summaryStats.highest}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Income chart */}
      <Card>
        <CardHeader>
          <CardTitle>Income Breakdown</CardTitle>
          <CardDescription>
            {incomeSource === 'total' ? 'Total income over time' : `Income from ${incomeSource} over time`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end"
                  tick={{ fontSize: 12 }}
                  height={70}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {incomeSource === 'total' ? (
                  <Bar 
                    dataKey="total" 
                    name="Total Income" 
                    fill="#8884d8" 
                    radius={[4, 4, 0, 0]}
                  />
                ) : (
                  <Bar 
                    dataKey={incomeSource} 
                    name={incomeSource.charAt(0).toUpperCase() + incomeSource.slice(1)} 
                    fill="#82ca9d" 
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Detailed breakdown by income source */}
      <Card>
        <CardHeader>
          <CardTitle>Income Sources Breakdown</CardTitle>
          <CardDescription>Compare different income sources</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="percentage">Percentage View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end"
                    tick={{ fontSize: 12 }}
                    height={70}
                  />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="subscriptions" name="Subscriptions" fill="#8884d8" stackId="stack" />
                  <Bar dataKey="tips" name="Tips" fill="#82ca9d" stackId="stack" />
                  <Bar dataKey="posts" name="Posts" fill="#ffc658" stackId="stack" />
                  <Bar dataKey="messages" name="Messages" fill="#ff8042" stackId="stack" />
                  <Bar dataKey="referrals" name="Referrals" fill="#0088fe" stackId="stack" />
                  <Bar dataKey="streams" name="Streams" fill="#00C49F" stackId="stack" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="percentage" className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  stackOffset="expand"
                  layout="vertical"
                >
                  <XAxis type="number" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <YAxis 
                    type="category" 
                    dataKey="date" 
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`} />
                  <Legend />
                  <Bar dataKey="subscriptions" name="Subscriptions" fill="#8884d8" stackId="stack" />
                  <Bar dataKey="tips" name="Tips" fill="#82ca9d" stackId="stack" />
                  <Bar dataKey="posts" name="Posts" fill="#ffc658" stackId="stack" />
                  <Bar dataKey="messages" name="Messages" fill="#ff8042" stackId="stack" />
                  <Bar dataKey="referrals" name="Referrals" fill="#0088fe" stackId="stack" />
                  <Bar dataKey="streams" name="Streams" fill="#00C49F" stackId="stack" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
