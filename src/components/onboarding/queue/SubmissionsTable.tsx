
import React, { useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Check, Loader2 } from "lucide-react";
import { OnboardSubmission } from "@/hooks/useOnboardingSubmissions";

interface SubmissionsTableProps {
  submissions: OnboardSubmission[];
  processingTokens: string[];
  formatDate: (dateString: string) => string;
  togglePreview: (token: string) => void;
  deleteSubmission: (token: string) => Promise<void>; // This is now the decline function
  onAcceptClick: (submission: OnboardSubmission) => void;
}

const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  submissions,
  processingTokens,
  formatDate,
  togglePreview,
  deleteSubmission,
  onAcceptClick
}) => {
  // Track buttons that have been clicked to prevent double clicks
  const [clickedButtons, setClickedButtons] = React.useState<Record<string, boolean>>({});
  const [handlingTokens, setHandlingTokens] = React.useState<Set<string>>(new Set());
  
  // Use useMemo for derived state that depends on other state values
  const disabledTokens = useMemo(() => {
    const tokens = new Set<string>();
    
    // Add all processing tokens
    processingTokens.forEach(token => tokens.add(token));
    
    // Add all clicked buttons
    Object.entries(clickedButtons)
      .filter(([_, isClicked]) => isClicked)
      .forEach(([token]) => tokens.add(token));
    
    // Add all handling tokens
    handlingTokens.forEach(token => tokens.add(token));
    
    return tokens;
  }, [processingTokens, clickedButtons, handlingTokens]);

  // Formatting functions adapted from CreatorDataModal
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
    // Special case for price fields
    if (key === 'pricePerMinute') return 'Custom Video Price per Minute';
    if (key === 'videoCallPrice') return 'Price for Video Call';
    
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ');
  };

  // Define field priority orders for each section - ALL FIELDS MUST BE INCLUDED
  const personalInfoPriority = ['fullName', 'age', 'email', 'phoneNumber', 'location', 'birthday', 'nationality', 'languages', 'pets', 'socialMediaHandles'];
  const physicalPriority = ['height', 'weight', 'bodyType', 'ethnicity', 'hairColor', 'eyeColor', 'tattoos', 'piercings'];
  const preferencesPriority = ['sexualOrientation', 'relationshipStatus', 'interests', 'hobbies', 'favoriteFood', 'favoriteMusic', 'favoriteMovies', 'personalityTraits'];
  const contentPriority = [
    'experienceLevel', 
    'contentTypes', 
    'availability', 
    'specialSkills', 
    'equipment', 
    'workEnvironment', 
    'goals', 
    'pricePerMinute', 
    'videoCallPrice',
    'bodyCount',
    'craziestSexPlace',
    'hasFetish',
    'fetishDetails',
    'doesAnal',
    'hasTriedOrgy',
    'lovesThreesomes',
    'sellsUnderwear',
    'sexToysCount',
    'favoritePosition',
    'fanHandlingPreference'
  ];

  const getAllFieldsFromPriority = (data: any, priorityOrder: string[]) => {
    if (!data || typeof data !== 'object') {
      // If no data exists, create entries for all priority fields with empty values
      return priorityOrder.map(field => [field, '']);
    }
    
    const existingEntries = Object.entries(data);
    const existingKeys = new Set(existingEntries.map(([key]) => key));
    
    // Add missing fields from priority list with empty values
    const missingFields = priorityOrder
      .filter(field => !existingKeys.has(field))
      .map(field => [field, '']);
    
    const allEntries = [...existingEntries, ...missingFields];

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

  const renderDataSection = (sectionData: any, title: string, priorityOrder: string[]) => {
    const sortedEntries = getAllFieldsFromPriority(sectionData, priorityOrder);

    return (
      <div className="space-y-3">
        {sortedEntries.map(([key, value]) => (
          <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-border/30">
            <div className="font-medium text-foreground text-sm">
              {formatFieldName(key)}:
            </div>
            <div className="md:col-span-2 text-muted-foreground break-words text-sm">
              {key === 'pets' && Array.isArray(value) ? (
                value.length > 0 ? (
                  <div className="space-y-2">
                    {value.map((pet: any, index: number) => (
                      <div key={index} className="bg-muted/30 p-2 rounded text-xs">
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
                    <div key={platform} className="text-xs">
                      <span className="font-medium">{formatFieldName(platform)}:</span> {formatValue(handle)}
                    </div>
                  ))}
                </div>
              ) : key === 'pricePerMinute' ? (
                <span>
                  {value !== null && value !== undefined && value !== '' ? `$${value}` : '$Not provided'}
                </span>
              ) : key === 'videoCallPrice' ? (
                <span>
                  {value !== null && value !== undefined && value !== '' ? `$${value}` : '$Not provided'}
                </span>
              ) : (
                formatValue(value)
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFormattedPreview = (data: any) => {
    const sections = [
      { 
        title: 'Personal Information', 
        data: data?.personalInfo,
        priority: personalInfoPriority 
      },
      { 
        title: 'Physical Attributes', 
        data: data?.physicalAttributes,
        priority: physicalPriority 
      },
      { 
        title: 'Personal Preferences', 
        data: data?.personalPreferences,
        priority: preferencesPriority 
      },
      { 
        title: 'Content & Service', 
        data: data?.contentAndService,
        priority: contentPriority 
      }
    ];

    return (
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="mb-4">
            <h4 className="text-base font-semibold mb-3 border-b pb-1 text-white">{section.title}</h4>
            {renderDataSection(section.data, section.title, section.priority)}
          </div>
        ))}
      </div>
    );
  };
  
  const handleDeclineClick = async (token: string) => {
    if (disabledTokens.has(token)) {
      console.log("Skipping decline action - token already being handled:", token);
      return;
    }
    
    try {
      // Mark this button as clicked and token as being handled
      setClickedButtons(prev => ({ ...prev, [token]: true }));
      setHandlingTokens(prev => new Set(prev).add(token));
      
      // Process the deletion (now decline)
      console.log("Decline button clicked for token:", token);
      await deleteSubmission(token);
    } finally {
      // Reset clicked state after completion
      setClickedButtons(prev => ({ ...prev, [token]: false }));
      setHandlingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(token);
        return newSet;
      });
    }
  };
  
  const handleAcceptClick = (submission: OnboardSubmission) => {
    const token = submission.token;
    if (disabledTokens.has(token)) {
      console.log("Skipping accept action - token already being handled:", token);
      return;
    }
    
    // Mark this button as clicked and token as being handled
    setClickedButtons(prev => ({ ...prev, [token]: true }));
    setHandlingTokens(prev => new Set(prev).add(token));
    
    // Process the acceptance
    console.log("Accept button clicked for token:", token);
    onAcceptClick(submission);
    
    // We'll reset this when modal closes or action completes
    setTimeout(() => {
      setClickedButtons(prev => ({ ...prev, [token]: false }));
      setHandlingTokens(prev => {
        const newSet = new Set(prev);
        newSet.delete(token);
        return newSet;
      });
    }, 10000); // Timeout as safety measure
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <React.Fragment key={submission.token}>
            <TableRow>
              <TableCell>{submission.email}</TableCell>
              <TableCell>{submission.name}</TableCell>
              <TableCell>
                {formatDate(submission.submittedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePreview(submission.token)}
                    title="Toggle preview"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeclineClick(submission.token)}
                    disabled={disabledTokens.has(submission.token)}
                    title="Decline submission"
                  >
                    {processingTokens.includes(submission.token) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAcceptClick(submission)}
                    disabled={disabledTokens.has(submission.token)}
                    title="Approve creator"
                  >
                    {processingTokens.includes(submission.token) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            {submission.showPreview && (
              <TableRow>
                <TableCell colSpan={4} className="bg-muted/10">
                  <div className="p-4 rounded overflow-auto max-h-96">
                    <div className="max-w-4xl">
                      {renderFormattedPreview(submission.data)}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

export default SubmissionsTable;
