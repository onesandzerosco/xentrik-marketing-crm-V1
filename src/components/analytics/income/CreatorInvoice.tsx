
import React, { useState } from 'react';
import { addDays } from 'date-fns';
import { useIncomeData } from './useIncomeData';
import { InvoiceHeader } from './invoice/InvoiceHeader';
import { InvoiceSummary } from './invoice/InvoiceSummary';
import { InvoiceBreakdown } from './invoice/InvoiceBreakdown';
import { useInvoiceCalculations } from './useInvoiceCalculations';
import { InvoiceSettings } from './InvoiceTypes';

interface CreatorInvoiceProps {
  creatorId: string;
  creatorName: string;
}

export const CreatorInvoice = ({ creatorId, creatorName }: CreatorInvoiceProps) => {
  // Get income data from the existing hook
  const { filteredData } = useIncomeData();
  
  // Initial invoice settings
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    xentrikPercentage: 20, // Default percentage
    invoiceDate: new Date(), // Today
    dueDate: addDays(new Date(), 30), // 30 days from today
  });
  
  // Calculate invoice summary based on data and settings
  const invoiceSummary = useInvoiceCalculations(filteredData, invoiceSettings);
  
  return (
    <div className="space-y-6">
      {/* Header with settings */}
      <InvoiceHeader 
        settings={invoiceSettings}
        onSettingsChange={setInvoiceSettings}
        creatorName={creatorName}
      />
      
      {/* Summary card with totals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvoiceSummary 
          summary={invoiceSummary} 
          xentrikPercentage={invoiceSettings.xentrikPercentage} 
        />
        
        {/* Additional card could go here in the future */}
        <Card className="flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-medium">Invoice Actions</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                onClick={() => window.print()}
                className="flex items-center gap-2"
              >
                <PrinterIcon className="h-4 w-4" />
                Print Invoice
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileTextIcon className="h-4 w-4" />
                Save as PDF
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Detailed breakdown */}
      <InvoiceBreakdown 
        summary={invoiceSummary} 
        xentrikPercentage={invoiceSettings.xentrikPercentage} 
      />
    </div>
  );
};

// Import needed icons
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileTextIcon, PrinterIcon } from "lucide-react";
