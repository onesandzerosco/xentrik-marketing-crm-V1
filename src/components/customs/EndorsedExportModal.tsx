
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Custom } from '@/types/custom';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckboxGroup } from '@/components/ui/checkbox-group';

interface EndorsedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EndorsedExportModal: React.FC<EndorsedExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Available columns for export
  const availableColumns = [
    { key: 'id', label: 'Custom ID' },
    { key: 'model_name', label: 'Model Name' },
    { key: 'fan_display_name', label: 'Fan Display Name' },
    { key: 'fan_username', label: 'Fan Username' },
    { key: 'custom_type', label: 'Custom Type' },
    { key: 'description', label: 'Description' },
    { key: 'sale_date', label: 'Sale Date' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'downpayment', label: 'Downpayment' },
    { key: 'full_price', label: 'Full Price' },
    { key: 'status', label: 'Status' },
    { key: 'sale_by', label: 'Sold By' },
    { key: 'endorsed_by', label: 'Endorsed By' },
    { key: 'sent_by', label: 'Sent By' },
    { key: 'created_at', label: 'Created At' },
    { key: 'updated_at', label: 'Updated At' },
    { key: 'attachment_urls', label: 'Attachment URLs' },
  ];

  // Default to having "Endorsed By" selected
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['endorsed_by']);

  // Fetch all endorsed customs
  const { data: endorsedCustoms = [], isLoading } = useQuery({
    queryKey: ['endorsed-customs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customs')
        .select('*')
        .eq('status', 'endorsed')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Custom[];
    },
    enabled: isOpen,
  });

  // Get unique model names
  const modelNames = Array.from(new Set(endorsedCustoms.map(custom => custom.model_name)));

  const getAttachmentUrls = async (attachments: string[]): Promise<string> => {
    if (!attachments || attachments.length === 0) return '';
    
    const urls: string[] = [];
    for (const attachmentPath of attachments) {
      try {
        const { data } = await supabase.storage
          .from('custom_attachments')
          .getPublicUrl(attachmentPath);
        urls.push(data.publicUrl);
      } catch (error) {
        console.error('Error getting attachment URL:', error);
        urls.push(`Error loading: ${attachmentPath}`);
      }
    }
    return urls.join('\n');
  };

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleSelectAll = () => {
    if (selectedColumns.length === availableColumns.length) {
      setSelectedColumns(['endorsed_by']); // Reset to default
    } else {
      setSelectedColumns(availableColumns.map(col => col.key));
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Filter customs based on selected model
      const filteredCustoms = selectedModel === 'all' 
        ? endorsedCustoms 
        : endorsedCustoms.filter(custom => custom.model_name === selectedModel);

      if (filteredCustoms.length === 0) {
        toast({
          title: "No Data",
          description: "No endorsed customs found for the selected criteria",
          variant: "destructive",
        });
        return;
      }

      if (selectedColumns.length === 0) {
        toast({
          title: "No Columns Selected",
          description: "Please select at least one column to export",
          variant: "destructive",
        });
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const modelFilter = selectedModel === 'all' ? 'All-Models' : selectedModel.replace(/\s+/g, '-');

      // Process all customs with their data
      const excelDataPromises = filteredCustoms.map(async (custom) => {
        const attachmentUrls = custom.attachments 
          ? await getAttachmentUrls(custom.attachments)
          : '';

        const fullData: Record<string, any> = {
          'id': custom.id,
          'model_name': custom.model_name,
          'fan_display_name': custom.fan_display_name,
          'fan_username': custom.fan_username,
          'custom_type': custom.custom_type || 'Not specified',
          'description': custom.description,
          'sale_date': new Date(custom.sale_date).toLocaleDateString(),
          'due_date': custom.due_date ? new Date(custom.due_date).toLocaleDateString() : 'Not specified',
          'downpayment': `$${custom.downpayment.toFixed(2)}`,
          'full_price': `$${custom.full_price.toFixed(2)}`,
          'status': custom.status,
          'sale_by': custom.sale_by,
          'endorsed_by': custom.endorsed_by || 'Not specified',
          'sent_by': custom.sent_by || 'Not specified',
          'created_at': new Date(custom.created_at).toLocaleString(),
          'updated_at': new Date(custom.updated_at).toLocaleString(),
          'attachment_urls': attachmentUrls,
        };

        // Filter to only include selected columns
        const filteredData: Record<string, any> = {};
        selectedColumns.forEach(columnKey => {
          const column = availableColumns.find(col => col.key === columnKey);
          if (column) {
            filteredData[column.label] = fullData[columnKey];
          }
        });

        return filteredData;
      });

      const excelData = await Promise.all(excelDataPromises);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths - make attachment URLs column wider if selected
      const colWidths = Object.keys(excelData[0] || {}).map(key => {
        if (key === 'Attachment URLs') {
          return { wch: 50 }; // Wider column for URLs
        }
        return { wch: Math.max(key.length, 15) };
      });
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, 'Endorsed Customs');
      const excelFilename = `Endorsed-Customs-${modelFilter}-${timestamp}.xlsx`;
      XLSX.writeFile(wb, excelFilename);

      toast({
        title: "Export Successful",
        description: `Downloaded ${filteredCustoms.length} endorsed customs with ${selectedColumns.length} columns`,
      });

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export endorsed customs",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Endorsed Customs (Excel)
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models ({endorsedCustoms.length} customs)</SelectItem>
                {modelNames.map(modelName => {
                  const count = endorsedCustoms.filter(c => c.model_name === modelName).length;
                  return (
                    <SelectItem key={modelName} value={modelName}>
                      {modelName} ({count} customs)
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Select Columns to Export</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectedColumns.length === availableColumns.length ? 'Reset to Default' : 'Select All'}
              </Button>
            </div>
            
            <CheckboxGroup className="max-h-48 overflow-y-auto border rounded-md p-3">
              {availableColumns.map(column => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={column.key}
                    checked={selectedColumns.includes(column.key)}
                    onCheckedChange={() => handleColumnToggle(column.key)}
                  />
                  <label
                    htmlFor={column.key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {column.label}
                  </label>
                </div>
              ))}
            </CheckboxGroup>
            
            <div className="text-xs text-muted-foreground mt-2">
              {selectedColumns.length} of {availableColumns.length} columns selected
            </div>
          </div>

          {isLoading && (
            <div className="text-center text-sm text-muted-foreground">
              Loading endorsed customs...
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isLoading || isExporting || endorsedCustoms.length === 0 || selectedColumns.length === 0}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EndorsedExportModal;
