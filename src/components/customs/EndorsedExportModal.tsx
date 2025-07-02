import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Loader2, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Custom } from '@/types/custom';

interface EndorsedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EndorsedExportModal: React.FC<EndorsedExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf' | 'both'>('both');
  const { toast } = useToast();

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

  const loadImageAsBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      return '';
    }
  };

  const generatePDF = async (customs: Custom[]) => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.text('Endorsed Customs Report', 20, yPosition);
    yPosition += 20;

    for (let i = 0; i < customs.length; i++) {
      const custom = customs[i];
      
      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = 20;
      }

      // Custom details
      pdf.setFontSize(16);
      pdf.text(`Custom ${i + 1}`, 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      const details = [
        `Model: ${custom.model_name}`,
        `Fan: ${custom.fan_display_name} (@${custom.fan_username})`,
        `Type: ${custom.custom_type || 'Not specified'}`,
        `Price: $${custom.downpayment.toFixed(2)} / $${custom.full_price.toFixed(2)}`,
        `Sale Date: ${new Date(custom.sale_date).toLocaleDateString()}`,
        `Due Date: ${custom.due_date ? new Date(custom.due_date).toLocaleDateString() : 'Not specified'}`,
        `Sold by: ${custom.sale_by}`,
        `Endorsed by: ${custom.endorsed_by || 'Not specified'}`
      ];

      details.forEach(detail => {
        pdf.text(detail, 20, yPosition);
        yPosition += 6;
      });

      // Description
      if (custom.description) {
        pdf.text('Description:', 20, yPosition);
        yPosition += 6;
        const splitDescription = pdf.splitTextToSize(custom.description, 170);
        pdf.text(splitDescription, 20, yPosition);
        yPosition += splitDescription.length * 6;
      }

      // Attachments
      if (custom.attachments && custom.attachments.length > 0) {
        pdf.text(`Attachments (${custom.attachments.length}):`, 20, yPosition);
        yPosition += 10;

        for (const attachmentPath of custom.attachments) {
          try {
            const { data } = await supabase.storage
              .from('custom_attachments')
              .getPublicUrl(attachmentPath);
            
            // Check if it's an image
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachmentPath);
            
            if (isImage) {
              const base64Image = await loadImageAsBase64(data.publicUrl);
              if (base64Image) {
                // Add image to PDF
                const imgWidth = 80;
                const imgHeight = 60;
                
                // Check if image fits on current page
                if (yPosition + imgHeight > pageHeight - 20) {
                  pdf.addPage();
                  yPosition = 20;
                }
                
                pdf.addImage(base64Image, 'JPEG', 20, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 5;
              }
            } else {
              // For non-image files, just show the filename
              pdf.text(`- ${attachmentPath.split('/').pop() || 'Attachment'}`, 25, yPosition);
              yPosition += 6;
            }
          } catch (error) {
            console.error('Error processing attachment:', error);
            pdf.text(`- ${attachmentPath.split('/').pop() || 'Attachment'} (Error loading)`, 25, yPosition);
            yPosition += 6;
          }
        }
      }

      yPosition += 15; // Space between customs
    }

    return pdf;
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

      const timestamp = new Date().toISOString().split('T')[0];
      const modelFilter = selectedModel === 'all' ? 'All-Models' : selectedModel.replace(/\s+/g, '-');

      // Generate Excel if needed
      if (exportType === 'excel' || exportType === 'both') {
        const excelData = filteredCustoms.map(custom => ({
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
          'Attachments Count': custom.attachments ? custom.attachments.length : 0,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        const colWidths = Object.keys(excelData[0] || {}).map(key => ({
          wch: Math.max(key.length, 15)
        }));
        ws['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, ws, 'Endorsed Customs');
        const excelFilename = `Endorsed-Customs-${modelFilter}-${timestamp}.xlsx`;
        XLSX.writeFile(wb, excelFilename);
      }

      // Generate PDF if needed
      if (exportType === 'pdf' || exportType === 'both') {
        const pdf = await generatePDF(filteredCustoms);
        const pdfFilename = `Endorsed-Customs-${modelFilter}-${timestamp}.pdf`;
        pdf.save(pdfFilename);
      }

      toast({
        title: "Export Successful",
        description: `Downloaded ${filteredCustoms.length} endorsed customs`,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Endorsed Customs
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
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
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={exportType} onValueChange={(value) => setExportType(value as 'excel' | 'pdf' | 'both')}>
              <SelectTrigger>
                <SelectValue placeholder="Choose export format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel Only</SelectItem>
                <SelectItem value="pdf">PDF with Images</SelectItem>
                <SelectItem value="both">Both Excel & PDF</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={isLoading || isExporting || endorsedCustoms.length === 0}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  {exportType === 'pdf' ? <FileText className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                  Export {exportType === 'both' ? 'Files' : exportType === 'pdf' ? 'PDF' : 'Excel'}
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
