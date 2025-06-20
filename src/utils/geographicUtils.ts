
/**
 * Utility functions for geographic restrictions and location detection
 */

export const SOUTH_AFRICAN_INDICATORS = [
  'south africa',
  'sa',
  'cape town',
  'johannesburg',
  'durban',
  'pretoria',
  'port elizabeth',
  'bloemfontein',
  'east london',
  'pietermaritzburg',
  'welkom',
  'kimberley',
  'rustenburg',
  'polokwane',
  'witbank',
  'nelspruit',
  'western cape',
  'eastern cape',
  'northern cape',
  'free state',
  'kwazulu-natal',
  'north west',
  'gauteng',
  'mpumalanga',
  'limpopo'
];

/**
 * Check if a location string indicates South Africa
 */
export const isSouthAfricanLocation = (location: string): boolean => {
  if (!location) return false;
  
  const normalizedLocation = location.toLowerCase().trim();
  
  return SOUTH_AFRICAN_INDICATORS.some(indicator => 
    normalizedLocation.includes(indicator)
  );
};

/**
 * Check if a team member has geographic restrictions for a given country/region
 */
export const hasGeographicRestriction = (
  teamMemberRestrictions: string[] | undefined,
  restrictionType: string
): boolean => {
  if (!teamMemberRestrictions) return false;
  return teamMemberRestrictions.includes(restrictionType);
};

/**
 * Filter creators based on team member's geographic restrictions
 */
export const filterCreatorsByGeographicRestrictions = (
  creators: any[],
  teamMemberRestrictions: string[] | undefined
): any[] => {
  if (!teamMemberRestrictions || teamMemberRestrictions.length === 0) {
    return creators;
  }

  return creators.filter(creator => {
    // Check if team member has South Africa restriction
    if (hasGeographicRestriction(teamMemberRestrictions, 'south_africa')) {
      const location = creator.model_profile?.personalInfo?.location || '';
      const additionalLocationNote = creator.model_profile?.personalInfo?.additionalLocationNote || '';
      
      // Hide creator if they're from South Africa
      if (isSouthAfricanLocation(location) || isSouthAfricanLocation(additionalLocationNote)) {
        return false;
      }
    }

    // Add more restriction checks here as needed
    return true;
  });
};
