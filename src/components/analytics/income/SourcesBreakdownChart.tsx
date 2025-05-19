
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IncomeEntry } from './types';

interface SourcesBreakdownChartProps {
  data: IncomeEntry[];
}

export const SourcesBreakdownChart = ({ data }: SourcesBreakdownChartProps) => {
  return (
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
                data={data}
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
                data={data}
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
  );
};
