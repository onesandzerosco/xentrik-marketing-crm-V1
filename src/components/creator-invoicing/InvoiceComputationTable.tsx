import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2 } from 'lucide-react';
import { CreatorInvoicingEntry } from './types';
import { cn } from '@/lib/utils';

interface InvoiceComputationTableProps {
  creators: { id: string; name: string; model_name: string | null }[];
  invoicingData: CreatorInvoicingEntry[];
  selectedWeekStart: Date;
  loading: boolean;
  onGetOrCreateEntry: (creatorId: string, modelName: string, weekStart: Date) => Promise<CreatorInvoicingEntry | null>;
  onUpdateEntry: (creatorId: string, weekStartStr: string, field: keyof CreatorInvoicingEntry, value: any) => Promise<boolean>;
  onUpdatePercentageForward: (creatorId: string, fromWeekStartStr: string, newPercentage: number) => Promise<boolean>;
}

interface EditingCell {
  creatorId: string;
  field: string;
}

export function InvoiceComputationTable({
  creators,
  invoicingData,
  selectedWeekStart,
  loading,
  onGetOrCreateEntry,
  onUpdateEntry,
  onUpdatePercentageForward,
}: InvoiceComputationTableProps) {
  const [entries, setEntries] = useState<Map<string, CreatorInvoicingEntry>>(new Map());
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [initializingCreators, setInitializingCreators] = useState<Set<string>>(new Set());

  const weekStartStr = format(selectedWeekStart, 'yyyy-MM-dd');

  // Build entries map from invoicingData
  useEffect(() => {
    const map = new Map<string, CreatorInvoicingEntry>();
    invoicingData
      .filter(entry => entry.week_start_date === weekStartStr)
      .forEach(entry => {
        map.set(entry.creator_id, entry);
      });
    setEntries(map);
  }, [invoicingData, weekStartStr]);

  // Initialize entries for creators that don't have one
  const initializeEntry = async (creator: { id: string; name: string; model_name: string | null }) => {
    if (entries.has(creator.id) || initializingCreators.has(creator.id)) return;
    
    setInitializingCreators(prev => new Set(prev).add(creator.id));
    await onGetOrCreateEntry(creator.id, creator.model_name || creator.name, selectedWeekStart);
    setInitializingCreators(prev => {
      const next = new Set(prev);
      next.delete(creator.id);
      return next;
    });
  };

  // Get entry for a creator
  const getEntry = (creatorId: string): CreatorInvoicingEntry | undefined => {
    return entries.get(creatorId);
  };

  // Handle checkbox change
  const handleCheckboxChange = async (creatorId: string, checked: boolean) => {
    const entry = getEntry(creatorId);
    if (!entry) {
      const creator = creators.find(c => c.id === creatorId);
      if (creator) {
        await initializeEntry(creator);
      }
      return;
    }
    await onUpdateEntry(creatorId, weekStartStr, 'invoice_payment', checked);
  };

  // Handle starting edit
  const handleStartEdit = async (creatorId: string, field: string, currentValue: any) => {
    const entry = getEntry(creatorId);
    if (!entry) {
      const creator = creators.find(c => c.id === creatorId);
      if (creator) {
        await initializeEntry(creator);
      }
      return;
    }
    setEditingCell({ creatorId, field });
    setEditValue(currentValue?.toString() || '');
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingCell) return;

    const { creatorId, field } = editingCell;
    let value: any = editValue;

    // Convert to appropriate type
    if (field === 'paid' || field === 'net_sales' || field === 'percentage') {
      value = editValue === '' ? null : parseFloat(editValue);
      if (value !== null && isNaN(value)) {
        setEditingCell(null);
        return;
      }
    } else if (field === 'invoice_number') {
      value = editValue === '' ? null : parseInt(editValue, 10);
      if (value !== null && isNaN(value)) {
        setEditingCell(null);
        return;
      }
    }

    // Handle percentage update (forwards only)
    if (field === 'percentage' && value !== null) {
      await onUpdatePercentageForward(creatorId, weekStartStr, value);
    } else {
      await onUpdateEntry(creatorId, weekStartStr, field as keyof CreatorInvoicingEntry, value);
    }

    setEditingCell(null);
    setEditValue('');
  };

  // Handle key press in edit input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  // Calculate invoice amount from net_sales and percentage
  const calculateInvoiceAmount = (entry: CreatorInvoicingEntry | undefined): number | null => {
    if (!entry || entry.net_sales === null) return null;
    return (entry.net_sales * (entry.percentage / 100));
  };

  // Sort creators by invoice_number (nulls last)
  const sortedCreators = [...creators].sort((a, b) => {
    const entryA = getEntry(a.id);
    const entryB = getEntry(b.id);
    const numA = entryA?.invoice_number ?? Infinity;
    const numB = entryB?.invoice_number ?? Infinity;
    return numA - numB;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead className="min-w-[150px]">Model Name</TableHead>
            <TableHead className="w-[100px] text-center">Invoice Payment</TableHead>
            <TableHead className="w-[120px]">Paid ($)</TableHead>
            <TableHead className="w-[100px]">Percentage (%)</TableHead>
            <TableHead className="w-[120px]">Net Sales ($)</TableHead>
            <TableHead className="w-[120px]">Invoice Amount ($)</TableHead>
            <TableHead className="w-[200px]">Invoice Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCreators.map((creator) => {
            const entry = getEntry(creator.id);
            const isInitializing = initializingCreators.has(creator.id);
            const invoiceAmount = calculateInvoiceAmount(entry);

            return (
              <TableRow 
                key={creator.id}
                className="hover:bg-muted/30"
              >
                {/* Invoice Number */}
                <TableCell
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleStartEdit(creator.id, 'invoice_number', entry?.invoice_number)}
                >
                  {editingCell?.creatorId === creator.id && editingCell.field === 'invoice_number' ? (
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={handleKeyPress}
                      autoFocus
                      className="h-8 w-12"
                    />
                  ) : (
                    <span className="text-muted-foreground">
                      {entry?.invoice_number ?? '-'}
                    </span>
                  )}
                </TableCell>

                {/* Model Name */}
                <TableCell className="font-medium">
                  {creator.model_name || creator.name}
                  {isInitializing && <Loader2 className="h-3 w-3 animate-spin inline ml-2" />}
                </TableCell>

                {/* Invoice Payment Checkbox */}
                <TableCell className="text-center">
                  <Checkbox
                    checked={entry?.invoice_payment ?? false}
                    onCheckedChange={(checked) => handleCheckboxChange(creator.id, checked as boolean)}
                    disabled={isInitializing}
                  />
                </TableCell>

                {/* Paid Amount */}
                <TableCell
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleStartEdit(creator.id, 'paid', entry?.paid)}
                >
                  {editingCell?.creatorId === creator.id && editingCell.field === 'paid' ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={handleKeyPress}
                      autoFocus
                      className="h-8 w-24"
                    />
                  ) : (
                    <span className={cn(entry?.paid != null && "text-foreground")}>
                      {entry?.paid != null ? `$${entry.paid.toFixed(2)}` : '-'}
                    </span>
                  )}
                </TableCell>

                {/* Percentage */}
                <TableCell
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleStartEdit(creator.id, 'percentage', entry?.percentage)}
                >
                  {editingCell?.creatorId === creator.id && editingCell.field === 'percentage' ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={handleKeyPress}
                      autoFocus
                      className="h-8 w-20"
                    />
                  ) : (
                    <span>{entry?.percentage ?? 50}%</span>
                  )}
                </TableCell>

                {/* Net Sales */}
                <TableCell
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleStartEdit(creator.id, 'net_sales', entry?.net_sales)}
                >
                  {editingCell?.creatorId === creator.id && editingCell.field === 'net_sales' ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={handleKeyPress}
                      autoFocus
                      className="h-8 w-24"
                    />
                  ) : (
                    <span className={cn(entry?.net_sales != null && "text-foreground")}>
                      {entry?.net_sales != null ? `$${entry.net_sales.toFixed(2)}` : '-'}
                    </span>
                  )}
                </TableCell>

                {/* Invoice Amount (calculated) */}
                <TableCell>
                  <span className={cn(
                    "font-medium",
                    invoiceAmount != null && "text-brand-yellow"
                  )}>
                    {invoiceAmount != null ? `$${invoiceAmount.toFixed(2)}` : '-'}
                  </span>
                </TableCell>

                {/* Invoice Link */}
                <TableCell
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleStartEdit(creator.id, 'invoice_link', entry?.invoice_link)}
                >
                  {editingCell?.creatorId === creator.id && editingCell.field === 'invoice_link' ? (
                    <Input
                      type="url"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={handleKeyPress}
                      autoFocus
                      placeholder="https://..."
                      className="h-8"
                    />
                  ) : entry?.invoice_link ? (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(entry.invoice_link!, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Invoice
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">Click to add</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {creators.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No creators found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
