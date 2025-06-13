import React, { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationPicker } from '@/components/ui/location-picker';
import { Edit, Save, X, Clock, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { getTimezoneFromLocationName, formatTimeForTimezone } from '@/utils/timezoneUtils';

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
  onDataUpdate?: (updatedSubmission: CreatorSubmission) => void;
}

// Component to display location with local time
const LocationWithTime: React.FC<{ location: string }> = ({ location }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [timezone, setTimezone] = useState<string | null>(null);

  useEffect(() => {
    if (location) {
      const detectedTimezone = getTimezoneFromLocationName(location);
      setTimezone(detectedTimezone);
      console.log('Detected timezone for', location, ':', detectedTimezone);
    }
  }, [location]);

  useEffect(() => {
    if (timezone) {
      const updateTime = () => {
        const formattedTime = formatTimeForTimezone(timezone);
        setCurrentTime(formattedTime);
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [timezone]);

  return (
    <div>
      <div className="text-muted-foreground break-words">{location || 'Not provided'}</div>
      {timezone && currentTime && (
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Local time: {currentTime}</span>
        </div>
      )}
      {location && !timezone && (
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Timezone not detected</span>
        </div>
      )}
    </div>
  );
};

// Component for the dialog header time display
const HeaderTimeDisplay: React.FC<{ location: string }> = ({ location }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [timezone, setTimezone] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (location) {
      setLoading(true);
      const detectedTimezone = getTimezoneFromLocationName(location);
      setTimezone(detectedTimezone);
      setLoading(false);
      console.log('Header detected timezone for', location, ':', detectedTimezone);
    } else {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    if (timezone) {
      const updateTime = () => {
        const formattedTime = formatTimeForTimezone(timezone);
        setCurrentTime(formattedTime);
      };

      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [timezone]);

  if (loading) {
    return <span>Loading local time...</span>;
  }

  if (!location) {
    return <span>No location provided</span>;
  }

  if (!timezone) {
    return <span>Timezone not detected for {location}</span>;
  }

  if (!currentTime) {
    return <span>Local time unavailable</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      <span>Local time: {currentTime}</span>
    </div>
  );
};

const CreatorDataModal: React.FC<CreatorDataModalProps> = ({
  submission,
  open,
  onOpenChange,
  onDataUpdate,
}) => {
  const { toast } = useToast();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>('');
  const [submissionData, setSubmissionData] = useState<any>(submission?.data || {});
  const [isSaving, setIsSaving] = useState(false);

  // Update submissionData when submission changes
  React.useEffect(() => {
    if (submission?.data) {
      setSubmissionData(submission.data);
    }
  }, [submission]);

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

  const handleEditClick = (section: string, fieldKey: string, currentValue: any) => {
    const editKey = `${section}.${fieldKey}`;
    setEditingField(editKey);
    
    // Special handling for date fields
    if (fieldKey === 'dateOfBirth' && currentValue) {
      try {
        // Try to parse the existing date value
        const dateValue = new Date(currentValue);
        setEditValue(dateValue);
      } catch (e) {
        setEditValue(new Date());
      }
    } else {
      setEditValue(currentValue || '');
    }
  };

  const updateDatabase = async (updatedData: any) => {
    try {
      setIsSaving(true);
      console.log('Updating both tables with data:', updatedData);
      console.log('Submission ID:', submission.id);
      console.log('Submission email:', submission.email);
      
      // Step 1: Update onboarding_submissions table
      const { data: submissionUpdateData, error: submissionError } = await supabase
        .from('onboarding_submissions')
        .update({ data: updatedData })
        .eq('id', submission.id)
        .select();

      if (submissionError) {
        console.error('Onboarding submissions update error:', submissionError);
        throw new Error(`Failed to update submission: ${submissionError.message}`);
      }

      console.log('Onboarding submissions update successful:', submissionUpdateData);

      // Step 2: Find and update the corresponding creator
      const { data: creators, error: findCreatorError } = await supabase
        .from('creators')
        .select('id, email')
        .eq('email', submission.email)
        .limit(1);

      if (findCreatorError) {
        console.error('Error finding creator:', findCreatorError);
        throw new Error(`Failed to find creator: ${findCreatorError.message}`);
      }

      if (!creators || creators.length === 0) {
        console.warn('No creator found with email:', submission.email);
        // Don't throw error here - submission update was successful
        toast({
          title: "Partial Update",
          description: "Submission updated but no matching creator found to update model profile.",
          variant: "default",
        });
      } else {
        const creatorId = creators[0].id;
        console.log('Found creator ID:', creatorId);

        // Step 3: Update creators table model_profile
        const { data: creatorUpdateData, error: creatorError } = await supabase
          .from('creators')
          .update({ model_profile: updatedData })
          .eq('id', creatorId)
          .select();

        if (creatorError) {
          console.error('Creator model_profile update error:', creatorError);
          throw new Error(`Failed to update creator profile: ${creatorError.message}`);
        }

        console.log('Creator model_profile update successful:', creatorUpdateData);
      }

      // Call the parent component's update handler if provided
      if (onDataUpdate) {
        onDataUpdate({
          ...submission,
          data: updatedData
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to update database:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = async (section: string, fieldKey: string) => {
    const editKey = `${section}.${fieldKey}`;
    
    // Create a deep copy of the submission data
    const newData = JSON.parse(JSON.stringify(submissionData));
    
    // Ensure the section exists
    if (!newData[section]) {
      newData[section] = {};
    }
    
    // Handle different value types
    let processedValue = editValue;
    if (fieldKey === 'dateOfBirth' && editValue instanceof Date) {
      // Format date as YYYY-MM-DD for consistent storage
      processedValue = format(editValue, 'yyyy-MM-dd');
    } else if (fieldKey === 'age' || fieldKey === 'numberOfKids' || fieldKey === 'bodyCount' || fieldKey === 'sexToysCount' || fieldKey === 'pricePerMinute' || fieldKey === 'videoCallPrice') {
      processedValue = editValue === '' ? null : Number(editValue);
    } else if (fieldKey === 'hasPets' || fieldKey === 'hasKids' || fieldKey === 'hasTattoos' || fieldKey === 'canSing' || fieldKey === 'smokes' || fieldKey === 'drinks' || fieldKey === 'isSexual' || fieldKey === 'hasFetish' || fieldKey === 'doesAnal' || fieldKey === 'hasTriedOrgy' || fieldKey === 'lovesThreesomes' || fieldKey === 'sellsUnderwear' || fieldKey === 'isCircumcised') {
      processedValue = editValue === 'true' || editValue === true;
    } else if (fieldKey === 'hobbies' || fieldKey === 'placesVisited') {
      processedValue = typeof editValue === 'string' ? editValue.split(',').map(item => item.trim()).filter(item => item !== '') : editValue;
    }
    
    // Update the field
    newData[section][fieldKey] = processedValue;
    
    console.log('Saving field:', fieldKey, 'with value:', processedValue);
    console.log('New data structure:', newData);
    
    // Update local state first
    setSubmissionData(newData);
    
    // Save to both database tables
    const success = await updateDatabase(newData);
    
    if (success) {
      setEditingField(null);
      setEditValue('');
      
      toast({
        title: "Model Profile Updated",
        description: `${formatFieldName(fieldKey)} has been updated successfully.`,
      });
    } else {
      // Revert local changes if database update failed
      setSubmissionData(submission.data);
      toast({
        title: "Update Failed",
        description: `Failed to update ${formatFieldName(fieldKey)}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const renderEditableField = (section: string, fieldKey: string, value: any) => {
    const editKey = `${section}.${fieldKey}`;
    const isEditing = editingField === editKey;
    
    if (isEditing) {
      // Special handling for date of birth field
      if (fieldKey === 'dateOfBirth') {
        return (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !editValue && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editValue instanceof Date ? format(editValue, "MMMM dd, yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editValue instanceof Date ? editValue : undefined}
                  onSelect={(date) => setEditValue(date || new Date())}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <Button size="sm" onClick={() => handleSaveClick(section, fieldKey)} disabled={isSaving}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }

      // Special handling for location fields
      if (fieldKey === 'location' || fieldKey === 'hometown') {
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <LocationPicker
                value={editValue || ''}
                onChange={(location) => setEditValue(location)}
                placeholder={`Search for ${fieldKey === 'location' ? 'current location' : 'hometown'}...`}
                showCurrentTime={fieldKey === 'location'}
              />
            </div>
            <Button size="sm" onClick={() => handleSaveClick(section, fieldKey)} disabled={isSaving}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }

      // Special handling for boolean fields
      if (fieldKey === 'hasPets' || fieldKey === 'hasKids' || fieldKey === 'hasTattoos' || fieldKey === 'canSing' || fieldKey === 'smokes' || fieldKey === 'drinks' || fieldKey === 'isSexual' || fieldKey === 'hasFetish' || fieldKey === 'doesAnal' || fieldKey === 'hasTriedOrgy' || fieldKey === 'lovesThreesomes' || fieldKey === 'sellsUnderwear' || fieldKey === 'isCircumcised') {
        return (
          <div className="flex items-center gap-2">
            <Select value={String(editValue)} onValueChange={setEditValue}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => handleSaveClick(section, fieldKey)} disabled={isSaving}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }
      
      // Special handling for enum fields
      if (fieldKey === 'sex') {
        return (
          <div className="flex items-center gap-2">
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Transgender">Transgender</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => handleSaveClick(section, fieldKey)} disabled={isSaving}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }
      
      if (fieldKey === 'handedness') {
        return (
          <div className="flex items-center gap-2">
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Left">Left</SelectItem>
                <SelectItem value="Right">Right</SelectItem>
                <SelectItem value="Ambidextrous">Ambidextrous</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => handleSaveClick(section, fieldKey)} disabled={isSaving}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }
      
      if (fieldKey === 'isTopOrBottom') {
        return (
          <div className="flex items-center gap-2">
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Top">Top</SelectItem>
                <SelectItem value="Bottom">Bottom</SelectItem>
                <SelectItem value="Versatile">Versatile</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => handleSaveClick(section, fieldKey)} disabled={isSaving}>
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }
      
      // For longer text fields, use textarea
      if (fieldKey === 'tattooDetails' || fieldKey === 'fetishDetails' || fieldKey === 'homeActivities' || fieldKey === 'morningRoutine' || fieldKey === 'likeInPerson' || fieldKey === 'dislikeInPerson' || fieldKey === 'turnOffs' || fieldKey === 'craziestSexPlace' || fieldKey === 'fanHandlingPreference' || fieldKey === 'additionalLocationNote') {
        return (
          <div className="flex items-start gap-2">
            <Textarea 
              value={editValue} 
              onChange={(e) => setEditValue(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex flex-col gap-1">
              <Button size="sm" onClick={() => handleSaveClick(section, fieldKey)} disabled={isSaving}>
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      }
      
      // Default input field
      return (
        <div className="flex items-center gap-2">
          <Input 
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" onClick={() => handleSaveClick(section, fieldKey)} disabled={isSaving}>
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      );
    }
    
    // Display mode with edit button
    return (
      <div className="flex items-center justify-between group">
        <div className="flex-1 text-muted-foreground break-words">
          {/* Special handling for date of birth display */}
          {fieldKey === 'dateOfBirth' && value ? (
            (() => {
              try {
                const date = new Date(value);
                return format(date, "MMMM dd, yyyy");
              } catch (e) {
                return formatValue(value);
              }
            })()
          ) : (fieldKey === 'location' || fieldKey === 'hometown') && value ? (
            <LocationWithTime location={value} />
          ) : fieldKey === 'pets' && Array.isArray(value) ? (
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
          ) : fieldKey === 'socialMediaHandles' && typeof value === 'object' && value !== null ? (
            <div className="space-y-1">
              {Object.entries(value).map(([platform, handle]) => {
                // Special handling for the "other" platforms array
                if (platform === 'other' && Array.isArray(handle)) {
                  return (
                    <div key={platform}>
                      <span className="font-medium">Other Platforms:</span>
                      <div className="ml-4 space-y-1">
                        {handle.map((otherPlatform: any, index: number) => (
                          <div key={index} className="bg-muted/30 p-2 rounded text-sm">
                            <span className="font-medium">{otherPlatform.platform}:</span> {otherPlatform.handle}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                // Regular platform handling
                return (
                  <div key={platform}>
                    <span className="font-medium">{formatFieldName(platform)}:</span> {formatValue(handle)}
                  </div>
                );
              })}
            </div>
          ) : (
            formatValue(value)
          )}
        </div>
        {/* Show edit button for most fields, but exclude complex objects and location fields that need special handling */}
        {!(fieldKey === 'pets' && Array.isArray(value) && value.length > 0) && 
         !(fieldKey === 'socialMediaHandles' && typeof value === 'object' && value !== null) && (
          <Button 
            size="sm" 
            variant="ghost" 
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
            onClick={() => handleEditClick(section, fieldKey, value)}
            disabled={isSaving}
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  const personalInfoPriority = [
    'fullName', 'nickname', 'age', 'dateOfBirth', 'location', 'additionalLocationNote', 'hometown', 'ethnicity',
    // Logical ordering for remaining actual fields
    'email', 'sex', 'religion', 'relationshipStatus', 'handedness',
    'hasPets', 'pets', 'hasKids', 'numberOfKids', 'occupation', 'workplace', 'placesVisited'
  ];

  const physicalPriority = [
    'bodyType', 'height', 'weight', 'eyeColor',
    // Logical ordering for remaining actual fields
    'hairColor', 'favoriteColor', 'dislikedColor', 'allergies',
    'hasTattoos', 'tattooDetails', 'bustWaistHip', 'dickSize', 'isCircumcised', 'isTopOrBottom'
  ];

  const preferencesPriority = [
    'hobbies', 'favoriteFood', 'favoriteDrink', 'favoriteMusic', 'favoriteMovies',
    // Logical ordering for remaining actual fields
    'favoriteExpression', 'canSing', 'smokes', 'drinks', 'isSexual',
    'homeActivities', 'morningRoutine', 'likeInPerson', 'dislikeInPerson', 'turnOffs'
  ];

  const contentPriority = [
    'pricePerMinute', 'videoCallPrice', 'sellsUnderwear',
    // Logical ordering for remaining actual fields
    'bodyCount', 'hasFetish', 'fetishDetails', 'doesAnal', 'hasTriedOrgy', 'sexToysCount',
    'lovesThreesomes', 'favoritePosition', 'craziestSexPlace', 'fanHandlingPreference', 'socialMediaHandles'
  ];

  const sortFieldsByPriority = (data: any, priorityOrder: string[]) => {
    if (!data || typeof data !== 'object') return [];
    
    // Get ALL fields from the data object, regardless of whether they have values
    const allPossibleFields = new Set([
      ...priorityOrder,
      ...Object.keys(data)
    ]);

    // Create entries for ALL fields, using actual data or undefined for missing fields
    const allEntries = Array.from(allPossibleFields).map(key => [key, data[key]]);

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
        priority: personalInfoPriority,
        section: 'personalInfo'
      },
      { 
        title: 'Physical Attributes', 
        data: submissionData?.physicalAttributes,
        priority: physicalPriority,
        section: 'physicalAttributes'
      },
      { 
        title: 'Personal Preferences', 
        data: submissionData?.personalPreferences,
        priority: preferencesPriority,
        section: 'personalPreferences'
      },
      { 
        title: 'Content & Service', 
        data: submissionData?.contentAndService,
        priority: contentPriority,
        section: 'contentAndService'
      }
    ];

    return (
      <div className="space-y-6">
        {sections.map((sectionInfo, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">{sectionInfo.title}</h3>
            {renderDataSection(sectionInfo.data, sectionInfo.title, sectionInfo.priority, sectionInfo.section)}
          </div>
        ))}
      </div>
    );
  };

  const renderDataSection = (sectionData: any, title: string, priorityOrder: string[], section: string) => {
    // Always render fields, even if sectionData is null/undefined
    const sortedEntries = sortFieldsByPriority(sectionData || {}, priorityOrder);

    return (
      <div className="space-y-4">
        {sortedEntries.map(([key, value]) => (
          <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-border/50">
            <div className="font-medium text-foreground">
              {formatFieldName(key)}:
            </div>
            <div className="md:col-span-2">
              {renderEditableField(section, key, value)}
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
            <HeaderTimeDisplay location={submissionData?.personalInfo?.location || ''} />
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
                {renderDataSection(submissionData?.personalInfo, 'Personal Information', personalInfoPriority, 'personalInfo')}
              </TabsContent>
              
              <TabsContent value="physical" className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Physical Attributes</h3>
                {renderDataSection(submissionData?.physicalAttributes, 'Physical Attributes', physicalPriority, 'physicalAttributes')}
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Personal Preferences</h3>
                {renderDataSection(submissionData?.personalPreferences, 'Personal Preferences', preferencesPriority, 'personalPreferences')}
              </TabsContent>
              
              <TabsContent value="content" className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Content & Service</h3>
                {renderDataSection(submissionData?.contentAndService, 'Content & Service', contentPriority, 'contentAndService')}
              </TabsContent>
            </div>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreatorDataModal;
