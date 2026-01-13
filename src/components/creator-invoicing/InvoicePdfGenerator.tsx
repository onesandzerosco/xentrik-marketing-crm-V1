import jsPDF from 'jspdf';
import { format, addDays } from 'date-fns';
import { CreatorInvoicingEntry, Creator } from './types';
import { getWeekEnd } from '@/utils/weekCalculations';
import { supabase } from '@/integrations/supabase/client';

interface GeneratePdfParams {
  creator: Creator;
  entry: CreatorInvoicingEntry;
  weekStart: Date;
  invoiceAmount: number | null;
  previousBalance: number;
}

// Helper to format invoice number as DueDate-ModelNumber
export function formatInvoiceNumber(dueDate: Date, modelNumber: number | null): string {
  if (modelNumber === null) return '-';
  const month = String(dueDate.getMonth() + 1).padStart(2, '0');
  const day = String(dueDate.getDate()).padStart(2, '0');
  const modelNum = String(modelNumber).padStart(2, '0');
  return `${month}${day}-${modelNum}`;
}

export async function generateInvoicePdf({
  creator,
  entry,
  weekStart,
  invoiceAmount,
  previousBalance,
}: GeneratePdfParams): Promise<void> {
  const pdf = new jsPDF();
  const weekEnd = getWeekEnd(weekStart);
  const dueDate = addDays(weekEnd, 1);

  // Invoice Number
  const invoiceNumber = formatInvoiceNumber(dueDate, creator.default_invoice_number);

  // Header
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE', 105, 25, { align: 'center' });

  // Invoice details
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Invoice #: ${invoiceNumber}`, 20, 45);
  pdf.text(`Model: ${creator.model_name || creator.name}`, 20, 52);
  pdf.text(`Week: ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`, 20, 59);
  pdf.text(`Due Date: ${format(dueDate, 'MMM d, yyyy')}`, 20, 66);

  // Line
  pdf.setLineWidth(0.5);
  pdf.line(20, 75, 190, 75);

  // Table header
  let y = 85;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Description', 20, y);
  pdf.text('Amount', 160, y, { align: 'right' });

  // Table content
  y += 10;
  pdf.setFont('helvetica', 'normal');

  pdf.text('Net Sales', 20, y);
  pdf.text(entry.net_sales !== null ? `$${entry.net_sales.toFixed(2)}` : '-', 160, y, { align: 'right' });

  y += 8;
  pdf.text(`Commission Rate (${entry.percentage}%)`, 20, y);
  const baseAmount = entry.net_sales !== null ? entry.net_sales * (entry.percentage / 100) : 0;
  pdf.text(`$${baseAmount.toFixed(2)}`, 160, y, { align: 'right' });

  if (previousBalance !== 0) {
    y += 8;
    if (previousBalance > 0) {
      pdf.text('Previous Week Credit', 20, y);
      pdf.text(`-$${previousBalance.toFixed(2)}`, 160, y, { align: 'right' });
    } else {
      pdf.text('Previous Week Balance Owed', 20, y);
      pdf.text(`+$${Math.abs(previousBalance).toFixed(2)}`, 160, y, { align: 'right' });
    }
  }

  // Total line
  y += 15;
  pdf.setLineWidth(0.3);
  pdf.line(20, y - 5, 190, y - 5);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Invoice Amount', 20, y);
  pdf.text(invoiceAmount !== null ? `$${invoiceAmount.toFixed(2)}` : '-', 160, y, { align: 'right' });

  // Payment status
  y += 15;
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Payment Status: ${entry.invoice_payment ? 'PAID' : 'UNPAID'}`, 20, y);

  if (entry.paid !== null) {
    y += 8;
    pdf.text(`Amount Paid: $${entry.paid.toFixed(2)}`, 20, y);
  }

  // Images section
  y += 20;

  // Load and add statements image if exists
  if (entry.statements_image_key) {
    try {
      const { data } = supabase.storage.from('invoicing_documents').getPublicUrl(entry.statements_image_key);
      if (data?.publicUrl) {
        pdf.setFont('helvetica', 'bold');
        pdf.text("Week's Statements:", 20, y);
        y += 5;
        
        // Note: jsPDF addImage requires base64 or data URL, we'll add a link instead
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 255);
        pdf.textWithLink('View Statements Image', 20, y, { url: data.publicUrl });
        pdf.setTextColor(0, 0, 0);
        y += 15;
      }
    } catch (e) {
      console.error('Error adding statements image:', e);
    }
  }

  // Add conversion image link if exists
  if (entry.conversion_image_key) {
    try {
      const { data } = supabase.storage.from('invoicing_documents').getPublicUrl(entry.conversion_image_key);
      if (data?.publicUrl) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('USD to AUD Conversion:', 20, y);
        y += 5;
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 255);
        pdf.textWithLink('View Conversion Image', 20, y, { url: data.publicUrl });
        pdf.setTextColor(0, 0, 0);
      }
    } catch (e) {
      console.error('Error adding conversion image:', e);
    }
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(`Generated on ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 105, 285, { align: 'center' });

  // Save the PDF
  const fileName = `Invoice_${invoiceNumber}_${creator.model_name || creator.name}.pdf`;
  pdf.save(fileName);
}
