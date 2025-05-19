
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IncomeSourceSelectorProps {
  incomeSource: string;
  setIncomeSource: (value: string) => void;
}

export const IncomeSourceSelector = ({ incomeSource, setIncomeSource }: IncomeSourceSelectorProps) => {
  return (
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
  );
};
