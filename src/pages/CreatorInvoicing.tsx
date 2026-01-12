import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, ClipboardCheck } from 'lucide-react';
import { WeekPicker } from '@/components/creator-invoicing/WeekPicker';
import { InvoiceComputationTable } from '@/components/creator-invoicing/InvoiceComputationTable';
import { InvoiceChecklist } from '@/components/creator-invoicing/InvoiceChecklist';
import { useCreatorInvoicing } from '@/components/creator-invoicing/hooks/useCreatorInvoicing';

const CreatorInvoicing = () => {
  const [activeTab, setActiveTab] = useState('computation');
  const {
    invoicingData,
    creators,
    loading,
    selectedWeekStart,
    setSelectedWeekStart,
    getOrCreateEntry,
    updateEntry,
    updatePercentageForward,
    fetchInvoicingDataRange,
    generateWeekCutoffs,
  } = useCreatorInvoicing();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Creator Invoicing</h1>
            <p className="text-muted-foreground mt-1">
              Manage creator invoices with Thursday-Wednesday weekly cutoffs
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="computation" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Invoice Computation
              </TabsTrigger>
              <TabsTrigger value="checklist" className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Invoice Checklist
              </TabsTrigger>
            </TabsList>

            {/* Invoice Computation Tab */}
            <TabsContent value="computation" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-lg">Weekly Invoice Data</CardTitle>
                    <CardDescription>
                      Click on cells to edit. Changes are saved automatically.
                    </CardDescription>
                  </div>
                  <WeekPicker
                    selectedWeekStart={selectedWeekStart}
                    onWeekChange={setSelectedWeekStart}
                  />
                </CardHeader>
                <CardContent>
                  <InvoiceComputationTable
                    creators={creators}
                    invoicingData={invoicingData}
                    selectedWeekStart={selectedWeekStart}
                    loading={loading}
                    onGetOrCreateEntry={getOrCreateEntry}
                    onUpdateEntry={updateEntry}
                    onUpdatePercentageForward={updatePercentageForward}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoice Checklist Tab */}
            <TabsContent value="checklist" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Status Overview</CardTitle>
                  <CardDescription>
                    Read-only view of payment status across weeks. Due dates are the day after each cutoff ends.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InvoiceChecklist
                    creators={creators}
                    generateWeekCutoffs={generateWeekCutoffs}
                    fetchInvoicingDataRange={fetchInvoicingDataRange}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CreatorInvoicing;
