
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface CreatorSubmission {
  id: string;
  name: string;
  email: string;
  submitted_at: string;
  data: any;
  token: string;
}

interface CreatorDataModalProps {
  submission: CreatorSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatorDataModal: React.FC<CreatorDataModalProps> = ({
  submission,
  open,
  onOpenChange,
}) => {
  if (!submission) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return 'Not provided';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'Not provided';
      return value.join(', ');
    }
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const formatFieldName = (key: string): string => {
    // Handle specific field name mappings
    const fieldMappings: Record<string, string> = {
      'pricePerMinute': 'Custom Price per Minute',
      'videoCallPrice': 'Video Call Price per Minute'
    };
    
    // Return custom mapping if it exists
    if (fieldMappings[key]) {
      return fieldMappings[key];
    }
    
    // Default formatting for other fields
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  };

  // Parse the submission data properly
  const parseSubmissionData = () => {
    let parsedData;
    
    try {
      // If data is a string, parse it as JSON
      if (typeof submission.data === 'string') {
        parsedData = JSON.parse(submission.data);
      } else {
        parsedData = submission.data;
      }
      
      console.log('Parsed submission data:', parsedData);
      return parsedData;
    } catch (error) {
      console.error('Error parsing submission data:', error);
      return submission.data;
    }
  };

  const submissionData = parseSubmissionData();

  // Updated field priority orders based on actual schema fields only
  const personalInfoPriority = [
    'fullName', 'nickname', 'age', 'dateOfBirth', 'location', 'hometown', 'ethnicity',
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

  const sortFieldsByPriority = (data: any, priorityOrder: string[]) => {
    if (!data || typeof data !== 'object') {
      console.log('No data or data is not an object:', data);
      return [];
    }
    
    // Get ALL fields from the data object
    const allDataKeys = Object.keys(data);
    console.log('All data keys found:', allDataKeys);
    
    // Create a set of all possible fields
    const allPossibleFields = new Set([
      ...priorityOrder,
      ...allDataKeys
    ]);

    // Create entries for ALL fields, using actual data or undefined for missing fields
    const allEntries = Array.from(allPossibleFields).map(key => {
      const value = data[key];
      console.log(`Field ${key}:`, value);
      return [key, value];
    });

    // Sort by priority order, then alphabetically for remaining fields
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

  // New function to render all sections combined in one view
  const renderAllData = () => {
    const sections = [
      { 
        title: 'Personal Information', 
        data: submissionData?.personalInfo,
        priority: personalInfoPriority 
      },
      { 
        title: 'Physical Attributes', 
        data: submissionData?.physicalAttributes,
        priority: physicalPriority 
      },
      { 
        title: 'Personal Preferences', 
        data: submissionData?.personalPreferences,
        priority: preferencesPriority 
      },
      { 
        title: 'Content & Service', 
        data: submissionData?.contentAndService,
        priority: contentPriority 
      }
    ];

    return (
      <div className="space-y-6">
        {sections.map((section, index) => {
          console.log(`Rendering section: ${section.title}`, section.data);
          return (
            <div key={index} className="mb-6">
              <h3 className="text-lg font-semibold mb-4 border-b pb-2">{section.title}</h3>
              {renderDataSection(section.data, section.title, section.priority)}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDataSection = (sectionData: any, title: string, priorityOrder: string[]) => {
    console.log(`Rendering data section for ${title}:`, sectionData);
    
    // Always render fields, even if sectionData is null/undefined
    const sortedEntries = sortFieldsByPriority(sectionData || {}, priorityOrder);
    
    if (sortedEntries.length === 0) {
      return <div className="text-muted-foreground">No data available for this section</div>;
    }

    return (
      <div className="space-y-4">
        {sortedEntries.map(([key, value]) => (
          <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-border/50">
            <div className="font-medium text-foreground">
              {formatFieldName(key)}:
            </div>
            <div className="md:col-span-2 text-muted-foreground break-words">
              {key === 'pets' && Array.isArray(value) ? (
                value.length > 0 ? (
                  <div className="space-y-2">
                    {value.map((pet: any, index: number) => (
                      <div key={index} className="bg-muted/30 p-2 rounded text-sm">
                        {Object.entries(pet).map(([petKey, petValue]) => (
                          <div key={petKey}>
                            <span className="font-medium">{formatFieldName(petKey)}:</span> {formatValue(petValue)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  formatValue(value)
                )
              ) : key === 'socialMediaHandles' && typeof value === 'object' && value !== null ? (
                <div className="space-y-1">
                  {Object.entries(value).map(([platform, handle]) => (
                    <div key={platform}>
                      <span className="font-medium">{formatFieldName(platform)}:</span> {formatValue(handle)}
                    </div>
                  ))}
                </div>
              ) : (
                <span className={value === undefined || value === null || value === '' ? 'text-red-400' : ''}>
                  {formatValue(value)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {submission.name}'s Model Profile
            <Badge variant="secondary">Accepted</Badge>
          </DialogTitle>
          <DialogDescription>
            Viewing submission data for {submission.name} (submitted {formatDate(submission.submitted_at)})
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[65vh] w-full">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Data</TabsTrigger>
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="physical">Physical</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="content">Content & Service</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="all" className="space-y-4">
                {renderAllData()}
              </TabsContent>

              <TabsContent value="personal" className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                {renderDataSection(submissionData?.personalInfo, 'Personal Information', personalInfoPriority)}
              </TabsContent>
              
              <TabsContent value="physical" className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Physical Attributes</h3>
                {renderDataSection(submissionData?.physicalAttributes, 'Physical Attributes', physicalPriority)}
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Personal Preferences</h3>
                {renderDataSection(submissionData?.personalPreferences, 'Personal Preferences', preferencesPriority)}
              </TabsContent>
              
              <TabsContent value="content" className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Content & Service</h3>
                {renderDataSection(submissionData?.contentAndService, 'Content & Service', contentPriority)}
              </TabsContent>
            </div>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreatorDataModal;
