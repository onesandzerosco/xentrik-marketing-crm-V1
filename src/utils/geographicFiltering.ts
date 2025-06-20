
/**
 * Checks if a creator should be filtered out based on geographic restrictions
 */
export const shouldFilterCreator = (
  creatorData: any,
  userGeographicRestrictions: string[] = []
): boolean => {
  // If user has no geographic restrictions, don't filter anything
  if (!userGeographicRestrictions || userGeographicRestrictions.length === 0) {
    return false;
  }

  // Check if user is restricted from viewing South African creators
  if (userGeographicRestrictions.includes('south_africa')) {
    // Check location field
    const location = creatorData?.data?.personalInfo?.location?.toLowerCase() || '';
    
    // Check additional location note
    const additionalLocationNote = creatorData?.data?.personalInfo?.additionalLocationNote?.toLowerCase() || '';
    
    // Check if either field contains "sa" or "south africa"
    const containsSouthAfrica = (field: string) => {
      return field.includes('sa') || field.includes('south africa');
    };
    
    if (containsSouthAfrica(location) || containsSouthAfrica(additionalLocationNote)) {
      return true; // Filter out this creator
    }
  }

  return false; // Don't filter
};
