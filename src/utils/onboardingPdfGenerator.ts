import { jsPDF } from "jspdf";
import { OnboardSubmission } from "@/hooks/useOnboardingSubmissions";

interface SectionConfig {
  title: string;
  key: string;
  priorityOrder: string[];
}

const formatFieldName = (key: string): string => {
  const fieldMappings: Record<string, string> = {
    'dateOfBirth': 'Real Date of Birth',
    'modelBirthday': 'Model Birthday',
    'age': 'Real Age',
    'modelAge': 'Model Age',
  };
  
  if (fieldMappings[key]) {
    return fieldMappings[key];
  }
  
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ');
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return 'Not provided';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Not provided';
    // Handle pets array
    if (value.length > 0 && typeof value[0] === 'object') {
      return value.map((item, idx) => {
        if (typeof item === 'object') {
          return Object.entries(item)
            .map(([k, v]) => `${formatFieldName(k)}: ${v}`)
            .join(', ');
        }
        return String(item);
      }).join('; ');
    }
    return value.join(', ');
  }
  if (typeof value === 'object') {
    // Handle social media handles
    return Object.entries(value)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${formatFieldName(k)}: ${v}`)
      .join(', ') || 'Not provided';
  }
  return String(value);
};

const sortFieldsByPriority = (data: any, priorityOrder: string[]): [string, any][] => {
  if (!data || typeof data !== 'object') return [];
  
  const allPossibleFields = new Set([
    ...priorityOrder,
    ...Object.keys(data)
  ]);

  const allEntries = Array.from(allPossibleFields).map(key => [key, data[key]] as [string, any]);

  return allEntries.sort(([keyA], [keyB]) => {
    const priorityA = priorityOrder.indexOf(keyA);
    const priorityB = priorityOrder.indexOf(keyB);
    
    if (priorityA !== -1 && priorityB !== -1) {
      return priorityA - priorityB;
    }
    if (priorityA !== -1) return -1;
    if (priorityB !== -1) return 1;
    return keyA.localeCompare(keyB);
  });
};

const personalInfoPriority = [
  'modelName', 'fullName', 'nickname', 'age', 'modelAge', 'dateOfBirth', 'modelBirthday', 'location', 'hometown', 'ethnicity',
  'email', 'sex', 'religion', 'relationshipStatus', 'handedness',
  'hasPets', 'pets', 'hasKids', 'numberOfKids', 'occupation', 'workplace', 'placesVisited'
];

const physicalPriority = [
  'bodyType', 'height', 'weight', 'eyeColor',
  'hairColor', 'favoriteColor', 'dislikedColor', 'allergies',
  'hasTattoos', 'tattooDetails', 'bustWaistHip', 'dickSize', 'isCircumcised', 'isTopOrBottom'
];

const preferencesPriority = [
  'hobbies', 'favoriteFood', 'favoriteDrink', 'favoriteMusic', 'favoriteMovies',
  'favoriteExpression', 'canSing', 'smokes', 'drinks', 'isSexual',
  'homeActivities', 'morningRoutine', 'likeInPerson', 'dislikeInPerson', 'turnOffs'
];

const contentPriority = [
  'pricePerMinute', 'videoCallPrice', 'sellsUnderwear',
  'bodyCount', 'hasFetish', 'fetishDetails', 'doesAnal', 'hasTriedOrgy', 'sexToysCount',
  'lovesThreesomes', 'favoritePosition', 'craziestSexPlace', 'fanHandlingPreference', 'socialMediaHandles'
];

const sections: SectionConfig[] = [
  { title: 'Personal Information', key: 'personalInfo', priorityOrder: personalInfoPriority },
  { title: 'Physical Attributes', key: 'physicalAttributes', priorityOrder: physicalPriority },
  { title: 'Personal Preferences', key: 'personalPreferences', priorityOrder: preferencesPriority },
  { title: 'Content & Service', key: 'contentAndService', priorityOrder: contentPriority }
];

export const generateOnboardingPDF = (submission: OnboardSubmission): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  const checkPageBreak = (height: number) => {
    if (yPos + height > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(26, 26, 51); // Dark purple background
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Creator Onboarding Submission', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Submitted: ${new Date(submission.submittedAt).toLocaleDateString()}`, pageWidth / 2, 32, { align: 'center' });
  
  yPos = 55;

  // Basic Info Box
  doc.setFillColor(245, 245, 250);
  doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F');
  
  doc.setTextColor(60, 60, 80);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Email:', margin + 5, yPos + 10);
  doc.text('Name:', margin + 5, yPos + 22);
  
  doc.setFont('helvetica', 'normal');
  doc.text(submission.email || 'Not provided', margin + 35, yPos + 10);
  doc.text(submission.name || 'Not provided', margin + 35, yPos + 22);
  
  yPos += 40;

  // Render each section
  sections.forEach((section, sectionIndex) => {
    const sectionData = (submission.data as any)?.[section.key];
    const sortedEntries = sortFieldsByPriority(sectionData || {}, section.priorityOrder);
    
    // Section header
    checkPageBreak(20);
    doc.setFillColor(100, 100, 180);
    doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, margin + 5, yPos + 7);
    
    yPos += 15;

    // Section fields
    sortedEntries.forEach(([key, value]) => {
      const fieldName = formatFieldName(key);
      const fieldValue = formatValue(value);
      
      // Calculate required height for this field
      const labelLines = doc.splitTextToSize(`${fieldName}:`, 50);
      const valueLines = doc.splitTextToSize(fieldValue, contentWidth - 60);
      const lineHeight = 5;
      const fieldHeight = Math.max(labelLines.length, valueLines.length) * lineHeight + 4;
      
      checkPageBreak(fieldHeight + 2);
      
      // Alternating row background
      const rowIndex = sortedEntries.indexOf([key, value] as [string, any]);
      if (rowIndex % 2 === 0) {
        doc.setFillColor(250, 250, 252);
        doc.rect(margin, yPos - 2, contentWidth, fieldHeight, 'F');
      }
      
      doc.setTextColor(80, 80, 100);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(labelLines, margin + 2, yPos + 2);
      
      doc.setTextColor(60, 60, 80);
      doc.setFont('helvetica', 'normal');
      doc.text(valueLines, margin + 55, yPos + 2);
      
      yPos += fieldHeight;
    });

    yPos += 8; // Space between sections
  });

  // Footer on last page
  const footerY = pageHeight - 15;
  doc.setDrawColor(200, 200, 210);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setTextColor(150, 150, 160);
  doc.setFontSize(8);
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY, { align: 'center' });

  // Generate filename
  const safeName = (submission.name || 'submission')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toLowerCase();
  const dateStr = new Date(submission.submittedAt).toISOString().split('T')[0];
  
  doc.save(`onboarding_${safeName}_${dateStr}.pdf`);
};
