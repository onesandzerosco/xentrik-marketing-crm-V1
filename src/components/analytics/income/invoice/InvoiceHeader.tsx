
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InvoiceSettings } from '../InvoiceTypes';
import { DatePicker } from './DatePicker';
import { DateRangeSelector } from '../DateRangeSelector';

interface InvoiceHeaderProps {
  settings: InvoiceSettings;
  onSettingsChange: (settings: InvoiceSettings) => void;
  creatorName: string;
}

export const InvoiceHeader = ({ settings, onSettingsChange, creatorName }: InvoiceHeaderProps) => {
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      onSettingsChange({
        ...settings,
        xentrikPercentage: value
      });
    }
  };

  const handleDueDateChange = (date: Date | undefined) => {
    if (date) {
      onSettingsChange({
        ...settings,
        dueDate: date
      });
    }
  };

  const handleDateRangeChange = (dateRange: any) => {
    onSettingsChange({
      ...settings,
      dateRange
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold">{creatorName}'s Invoice</h2>
            <div className="text-sm text-muted-foreground">
              Invoice Date: {settings.invoiceDate.toLocaleDateString()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Invoice Period</Label>
              <DateRangeSelector date={settings.dateRange} setDate={handleDateRangeChange} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="xentrikPercentage">Xentrik Percentage (%)</Label>
              <Input 
                id="xentrikPercentage"
                type="number"
                min={0}
                max={100}
                step={1}
                value={settings.xentrikPercentage}
                onChange={handlePercentageChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Due Date</Label>
              <DatePicker date={settings.dueDate} onDateChange={handleDueDateChange} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
