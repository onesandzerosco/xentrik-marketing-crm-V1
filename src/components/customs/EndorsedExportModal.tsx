
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

interface EndorsedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EndorsedExportModal: React.FC<EndorsedExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('endorsed');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Status options
  const statusOptions = [
    { value: 'partially_paid', label: 'Partially Paid' },
    { value: 'fully_paid', label: 'Fully Paid' },
    { value: 'endorsed', label: 'Endorsed' },
    { value: 'done', label: 'Done' },
    { value: 'refunded', label: 'Refunded' },
  ];

  // Fetch customs based on selected status
  const { data: customs = [], isLoading } = useQuery({
    queryKey: ['customs-export', selectedStatus],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customs')
        .select('*')
        .eq('status', selectedStatus)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Custom[];
    },
    enabled: isOpen,
  });

  // Get unique model names
  const modelNames = Array.from(new Set(customs.map(custom => custom.model_name)));

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

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Filter customs based on selected model
      const filteredCustoms = selectedModel === 'all' 
        ? customs 
        : customs.filter(custom => custom.model_name === selectedModel);

      if (filteredCustoms.length === 0) {
        toast({
          title: "No Data",
          description: "No customs found for the selected criteria",
          variant: "destructive",
        });
        return;
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const modelFilter = selectedModel === 'all' ? 'All-Models' : selectedModel.replace(/\s+/g, '-');
      const statusLabel = statusOptions.find(opt => opt.value === selectedStatus)?.label || selectedStatus;

      // Process all customs with their attachment URLs
      const excelDataPromises = filteredCustoms.map(async (custom) => {
        const attachmentUrls = custom.attachments 
          ? await getAttachmentUrls(custom.attachments)
          : '';

        return {
          'Custom ID': custom.id,
          'Model Name': custom.model_name,
          'Fan Display Name': custom.fan_display_name,
          'Fan Username': custom.fan_username,
          'Custom Type': custom.custom_type || 'Not specified',
          'Description': custom.description,
          'Sale Date': new Date(custom.sale_date).toLocaleDateString(),
          'Due Date': custom.due_date ? new Date(custom.due_date).toLocaleDateString() : 'Not specified',
          'Downpayment': `$${custom.downpayment.toFixed(2)}`,
          'Full Price': `$${custom.full_price.toFixed(2)}`,
          'Status': custom.status,
          'Sold By': custom.sale_by,
          'Endorsed By': custom.endorsed_by || 'Not specified',
          'Sent By': custom.sent_by || 'Not specified',
          'Created At': new Date(custom.created_at).toLocaleString(),
          'Updated At': new Date(custom.updated_at).toLocaleString(),
          'Attachment URLs': attachmentUrls,
        };
      });

      const excelData = await Promise.all(excelDataPromises);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths - make attachment URLs column wider
      const colWidths = Object.keys(excelData[0] || {}).map(key => {
        if (key === 'Attachment URLs') {
          return { wch: 50 }; // Wider column for URLs
        }
        return { wch: Math.max(key.length, 15) };
      });
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, `${statusLabel} Customs`);
      const excelFilename = `${statusLabel}-Customs-${modelFilter}-${timestamp}.xlsx`;
      XLSX.writeFile(wb, excelFilename);

      toast({
        title: "Export Successful",
        description: `Downloaded ${filteredCustoms.length} ${statusLabel.toLowerCase()} customs`,
      });

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export customs",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const selectedStatusLabel = statusOptions.find(opt => opt.value === selectedStatus)?.label || 'Customs';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export {selectedStatusLabel} Customs
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Choose status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => {
                  const count = customs.length; // This will update based on the selected status
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Select Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models ({customs.length} customs)</SelectItem>
                {modelNames.map(modelName => {
                  const count = customs.filter(c => c.model_name === modelName).length;
                  return (
                    <SelectItem key={modelName} value={modelName}>
                      {modelName} ({count} customs)
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {isLoading && (
            <div className="text-center text-sm text-muted-foreground">
              Loading {selectedStatusLabel.toLowerCase()} customs...
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isLoading || isExporting || customs.length === 0}
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
