
import { IncomeEntry } from './types';

export interface InvoiceSettings {
  xentrikPercentage: number;
  invoiceDate: Date;
  dueDate: Date;
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
