
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IncomeEntry } from './types';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

interface IncomeChartProps {
  data: IncomeEntry[];
  incomeSource: string;
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
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

export const IncomeChart = ({ data, incomeSource }: IncomeChartProps) => {
  return (
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
  );
};
