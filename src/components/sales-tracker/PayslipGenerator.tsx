import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface SalesEntry {
  model_name: string;
  day_of_week: number;
  earnings: number;
}

interface PayslipData {
  chatterName: string;
  weekStart: Date;
  weekEnd: Date;
  salesData: SalesEntry[];
  totalSales: number;
  hoursWorked: number;
  hourlyRate: number;
  commissionRate: number;
  commissionAmount: number;
  totalPayout: number;
}

const DAYS_OF_WEEK = [
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
];

export const generatePayslipPDF = (data: PayslipData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  let yPosition = 20;

  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Weekly Payslip - ${data.chatterName}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Date range
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  const dateRange = `${format(data.weekStart, 'MMM dd, yyyy')} - ${format(data.weekEnd, 'MMM dd, yyyy')}`;
  pdf.text(dateRange, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  // Sales breakdown table
  pdf.setFont('helvetica', 'bold');
  pdf.text('Daily Sales Breakdown', 20, yPosition);
  yPosition += 10;

  // Table headers
  pdf.setFontSize(10);
  pdf.text('Day', 20, yPosition);
  pdf.text('Model', 60, yPosition);
  pdf.text('Earnings', 140, yPosition);
  yPosition += 5;

  // Draw line under headers
  pdf.line(20, yPosition, 180, yPosition);
  yPosition += 5;

  // Group sales by day
  const salesByDay: Record<number, SalesEntry[]> = {};
  data.salesData.forEach(entry => {
    if (!salesByDay[entry.day_of_week]) {
      salesByDay[entry.day_of_week] = [];
    }
    salesByDay[entry.day_of_week].push(entry);
  });

  // Add sales data
  pdf.setFont('helvetica', 'normal');
  DAYS_OF_WEEK.forEach(day => {
    const dayEntries = salesByDay[day.value] || [];
    if (dayEntries.length > 0) {
      dayEntries.forEach((entry, index) => {
        pdf.text(index === 0 ? day.label : '', 20, yPosition);
        pdf.text(entry.model_name, 60, yPosition);
        pdf.text(`$${entry.earnings.toFixed(2)}`, 140, yPosition);
        yPosition += 5;
      });
    } else {
      pdf.text(day.label, 20, yPosition);
      pdf.text('No sales', 60, yPosition);
      pdf.text('$0.00', 140, yPosition);
      yPosition += 5;
    }
  });

  yPosition += 10;

  // Summary section
  pdf.setFont('helvetica', 'bold');
  pdf.text('Payment Summary', 20, yPosition);
  yPosition += 10;

  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Weekly Sales: $${data.totalSales.toFixed(2)}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Hours Worked: ${data.hoursWorked}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Hourly Rate: $${data.hourlyRate.toFixed(2)}/hr`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Hours Pay: $${(data.hoursWorked * data.hourlyRate).toFixed(2)}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Commission Rate: ${data.commissionRate}%`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Commission Amount: $${data.commissionAmount.toFixed(2)}`, 20, yPosition);
  yPosition += 10;

  // Total payout
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(`Total Payout: $${data.totalPayout.toFixed(2)}`, 20, yPosition);
  yPosition += 20;

  // Payslip paragraph
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const startDate = format(data.weekStart, 'MMM dd, yyyy');
  const endDate = format(data.weekEnd, 'MMM dd, yyyy');
  
  const payslipText = `This payslip covers the sales period from ${startDate} to ${endDate}. During this week, your total earnings amounted to $${data.totalSales.toFixed(2)}. Based on your performance, you qualify for a ${data.commissionRate}% commission, earning you an additional $${data.commissionAmount.toFixed(2)} in commission. You worked ${data.hoursWorked} hours this week. Your total payout for the week is $${data.totalPayout.toFixed(2)}. Thank you for your consistent work and dedication.`;

  const splitText = pdf.splitTextToSize(payslipText, pageWidth - 40);
  pdf.text(splitText, 20, yPosition);

  // Save the PDF
  const fileName = `payslip_${data.chatterName.replace(/\s+/g, '_')}_${format(data.weekStart, 'yyyy-MM-dd')}.pdf`;
  pdf.save(fileName);
};