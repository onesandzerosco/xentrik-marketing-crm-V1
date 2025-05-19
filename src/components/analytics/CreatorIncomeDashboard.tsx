
import React from 'react';
import { useIncomeData } from './income/useIncomeData';
import { IncomeHeader } from './income/IncomeHeader';
import { SummaryCards } from './income/SummaryCards';
import { IncomeChart } from './income/IncomeChart';
import { SourcesBreakdownChart } from './income/SourcesBreakdownChart';

interface CreatorIncomeDashboardProps {
  creatorId: string;
  creatorName: string;
}

export const CreatorIncomeDashboard = ({ creatorId, creatorName }: CreatorIncomeDashboardProps) => {
  const {
    date,
    setDate,
    incomeSource,
    setIncomeSource,
    filteredData,
    summaryStats
  } = useIncomeData();

  return (
    <div className="space-y-6">
      <IncomeHeader 
        creatorName={creatorName}
        date={date}
        setDate={setDate}
        incomeSource={incomeSource}
        setIncomeSource={setIncomeSource}
      />
      
      {/* Summary cards */}
      <SummaryCards 
        total={summaryStats.total}
        average={summaryStats.average}
        highest={summaryStats.highest}
        incomeSource={incomeSource}
      />
      
      {/* Income chart */}
      <IncomeChart 
        data={filteredData}
        incomeSource={incomeSource}
      />
      
      {/* Detailed breakdown by income source */}
      <SourcesBreakdownChart data={filteredData} />
    </div>
  );
};
