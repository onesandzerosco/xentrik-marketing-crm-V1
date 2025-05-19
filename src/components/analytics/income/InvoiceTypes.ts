
import { IncomeEntry } from './types';
import { DateRange } from 'react-day-picker';

export interface InvoiceSettings {
  xentrikPercentage: number;
  invoiceDate: Date;
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
