
import React from 'react';
import { DateRangeSelector } from './DateRangeSelector';
import { IncomeSourceSelector } from './IncomeSourceSelector';
import { DateRange } from 'react-day-picker';

interface IncomeHeaderProps {
  creatorName: string;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  incomeSource: string;
  setIncomeSource: (value: string) => void;
}

export const IncomeHeader = ({ 
  creatorName, 
  date, 
  setDate, 
  incomeSource, 
  setIncomeSource 
}: IncomeHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold">{creatorName}'s Income</h2>
        <p className="text-muted-foreground">Review earnings and performance metrics</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <DateRangeSelector date={date} setDate={setDate} />
        <IncomeSourceSelector incomeSource={incomeSource} setIncomeSource={setIncomeSource} />
      </div>
    </div>
  );
};
