
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { IncomeEntry } from './types';

interface SourcesBreakdownChartProps {
  data: IncomeEntry[];
}

export const SourcesBreakdownChart = ({ data }: SourcesBreakdownChartProps) => {
  // Colors for the pie chart segments
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];
  
  // Process data for the pie chart
  const pieData = useMemo(() => {
    if (!data.length) return [];
    
    // Calculate totals for each income source
    const totals = {
      subscriptions: 0,
      tips: 0,
      posts: 0,
      messages: 0,
      referrals: 0,
      streams: 0
    };
    
    data.forEach(entry => {
      totals.subscriptions += entry.subscriptions;
      totals.tips += entry.tips;
      totals.posts += entry.posts;
      totals.messages += entry.messages;
      totals.referrals += entry.referrals;
      totals.streams += entry.streams;
    });
    
    // Convert to array format for PieChart
    return [
      { name: 'Subscriptions', value: totals.subscriptions },
      { name: 'Tips', value: totals.tips },
      { name: 'Posts', value: totals.posts },
      { name: 'Messages', value: totals.messages },
      { name: 'Referrals', value: totals.referrals },
      { name: 'Streams', value: totals.streams }
    ];
  }, [data]);
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string) => {
    return [`$${value}`, name];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Sources Breakdown</CardTitle>
        <CardDescription>Compare different income sources</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Ring Chart</TabsTrigger>
            <TabsTrigger value="percentage">Detailed View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={140}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="percentage" className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center p-3 border rounded">
                  <div 
                    className="w-4 h-4 mr-3 rounded-sm" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{entry.name}</span>
                    <div className="flex justify-between space-x-4">
                      <span className="text-sm text-muted-foreground">
                        ${entry.value}
                      </span>
                      <span className="text-sm">
                        {(entry.value / pieData.reduce((acc, curr) => acc + curr.value, 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
