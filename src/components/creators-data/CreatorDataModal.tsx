
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
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  };

  // Define field priority orders for each section
  const personalInfoPriority = ['fullName', 'age', 'email', 'phoneNumber', 'location', 'birthday', 'nationality', 'languages', 'pets', 'socialMediaHandles'];
  const physicalPriority = ['height', 'weight', 'bodyType', 'ethnicity', 'hairColor', 'eyeColor', 'tattoos', 'piercings'];
  const preferencesPriority = ['sexualOrientation', 'relationshipStatus', 'interests', 'hobbies', 'favoriteFood', 'favoriteMusic', 'favoriteMovies', 'personalityTraits'];
  const contentPriority = ['experienceLevel', 'contentTypes', 'availability', 'specialSkills', 'equipment', 'workEnvironment', 'goals'];

  const sortFieldsByPriority = (data: any, priorityOrder: string[]) => {
    if (!data || typeof data !== 'object') return [];
    
    const entries = Object.entries(data).filter(([key, value]) => {
      // Special handling for nested objects and arrays
      if (key === 'pets' && Array.isArray(value)) {
        return value.length > 0;
      }
      if (key === 'socialMediaHandles' && typeof value === 'object') {
        return Object.values(value).some(v => v && v !== '');
      }
      return value !== null && value !== undefined && value !== '';
    });

    // Sort by priority order, then alphabetically for remaining fields
    return entries.sort(([keyA], [keyB]) => {
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

  const renderDataSection = (sectionData: any, title: string, priorityOrder: string[]) => {
    if (!sectionData || typeof sectionData !== 'object') {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No {title.toLowerCase()} data available</p>
        </div>
      );
    }

    const sortedEntries = sortFieldsByPriority(sectionData, priorityOrder);

    if (sortedEntries.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No {title.toLowerCase()} data available</p>
        </div>
      );
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
                <div className="space-y-2">
                  {value.map((pet: any, index: number) => (
                    <div key={index} className="bg-muted/30 p-2 rounded text-sm">
                      {Object.entries(pet).map(([petKey, petValue]) => (
                        petValue && (
                          <div key={petKey}>
                            <span className="font-medium">{formatFieldName(petKey)}:</span> {formatValue(petValue)}
                          </div>
                        )
                      ))}
                    </div>
                  ))}
                </div>
              ) : key === 'socialMediaHandles' && typeof value === 'object' ? (
                <div className="space-y-1">
                  {Object.entries(value).map(([platform, handle]) => (
                    handle && handle !== '' && (
                      <div key={platform}>
                        <span className="font-medium">{formatFieldName(platform)}:</span> {formatValue(handle)}
                      </div>
                    )
                  ))}
                </div>
              ) : (
                formatValue(value)
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
            Creator Biodata
            <Badge variant="secondary">Accepted</Badge>
          </DialogTitle>
          <DialogDescription>
            Viewing submission data for {submission.name} (submitted {formatDate(submission.submitted_at)})
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[65vh] w-full">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="physical">Physical</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="content">Content & Service</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="personal" className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                {renderDataSection(submission.data?.personalInfo, 'Personal Information', personalInfoPriority)}
              </TabsContent>
              
              <TabsContent value="physical" className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Physical Attributes</h3>
                {renderDataSection(submission.data?.physicalAttributes, 'Physical Attributes', physicalPriority)}
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Personal Preferences</h3>
                {renderDataSection(submission.data?.personalPreferences, 'Personal Preferences', preferencesPriority)}
              </TabsContent>
              
              <TabsContent value="content" className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Content & Service</h3>
                {renderDataSection(submission.data?.contentAndService, 'Content & Service', contentPriority)}
              </TabsContent>
            </div>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreatorDataModal;
