
import { IncomeEntry } from './types';
import { DateRange } from 'react-day-picker';

export interface InvoiceSettings {
  xentrikPercentage: number;
  invoiceDate: Date; // We'll keep this but auto-set it to today
  dueDate: Date;
  dateRange: DateRange | undefined;
}

export interface InvoiceSummary {
  totalIncome: number;
  xentrikAmount: number;
  creatorAmount: number;
  breakdown: {
    source: string;
    amount: number;
    xentrikAmount: number;
    creatorAmount: number;
  }[];
}
