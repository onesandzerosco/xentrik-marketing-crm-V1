
import React from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';

interface DateRangeSelectorProps {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export const DateRangeSelector = ({ date, setDate }: DateRangeSelectorProps) => {
  // Format date range for display
  const formatDateRange = () => {
    if (!date?.from) return "Select date range";
    if (!date.to) return format(date.from, "PPP");
    return `${format(date.from, "PPP")} - ${format(date.to, "PPP")}`;
  };

  return (
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
  );
};
