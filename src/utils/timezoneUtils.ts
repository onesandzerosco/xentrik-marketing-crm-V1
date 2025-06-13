// Comprehensive timezone utilities with proper DST handling

export interface TimezoneInfo {
  timezone: string;
  observesDST: boolean;
  currentlyInDST: boolean;
  currentTime: string;
}

// List of timezones that NEVER observe DST
const NON_DST_TIMEZONES = new Set([
  // Asia - Most countries don't observe DST
  'Asia/Manila', 'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Kuala_Lumpur',
  'Asia/Singapore', 'Asia/Ho_Chi_Minh', 'Asia/Tokyo', 'Asia/Seoul',
  'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Taipei', 'Asia/Kolkata',
  'Asia/Dubai', 'Asia/Riyadh', 'Asia/Qatar', 'Asia/Kuwait',
  
  // Africa - Most countries don't observe DST
  'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
  'Africa/Casablanca', 'Africa/Tunis', 'Africa/Algiers',
  
  // South America - Many don't observe DST
  'America/Lima', 'America/Bogota', 'America/Caracas', 'America/La_Paz',
  'America/Guayaquil', 'America/Manaus', 'America/Argentina/Buenos_Aires',
  
  // Others
  'Australia/Perth', 'Australia/Darwin', 'Australia/Brisbane',
  'Pacific/Honolulu', 'Asia/Almaty', 'Asia/Tashkent'
]);

// List of timezones that DO observe DST
const DST_TIMEZONES = new Set([
  // North America
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Vancouver', 'America/Anchorage',
  
  // Europe
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
  'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna',
  'Europe/Stockholm', 'Europe/Copenhagen', 'Europe/Helsinki', 'Europe/Oslo',
  'Europe/Warsaw', 'Europe/Prague', 'Europe/Budapest', 'Europe/Zurich',
  
  // Australia (some states)
  'Australia/Sydney', 'Australia/Melbourne', 'Australia/Adelaide',
  'Australia/Hobart', 'Australia/Canberra',
  
  // Others
  'Pacific/Auckland', 'America/Sao_Paulo'
]);

/**
 * Check if a timezone observes Daylight Saving Time
 */
export function observesDaylightSaving(timezone: string): boolean {
  return DST_TIMEZONES.has(timezone);
}

/**
 * Check if a timezone is currently in Daylight Saving Time
 * Only relevant for timezones that observe DST
 */
export function isCurrentlyInDST(timezone: string): boolean {
  // If timezone doesn't observe DST, it's never in DST
  if (!observesDaylightSaving(timezone)) {
    return false;
  }

  try {
    const now = new Date();
    
    // Create two dates: one in January (definitely standard time) and one now
    const januaryDate = new Date(now.getFullYear(), 0, 1); // January 1st
    const currentDate = now;
    
    // Get timezone offset for both dates
    const januaryOffset = getTimezoneOffset(timezone, januaryDate);
    const currentOffset = getTimezoneOffset(timezone, currentDate);
    
    // If current offset is different from January offset, we're likely in DST
    // (DST typically means offset is 1 hour less than standard time)
    return currentOffset < januaryOffset;
  } catch (error) {
    console.error('Error checking DST status:', error);
    return false;
  }
}

/**
 * Get timezone offset for a specific date and timezone
 */
function getTimezoneOffset(timezone: string, date: Date): number {
  try {
    // Create a date formatter for the specific timezone
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    
    // Calculate offset in minutes
    return (utcDate.getTime() - tzDate.getTime()) / (1000 * 60);
  } catch (error) {
    console.error('Error getting timezone offset:', error);
    return 0;
  }
}

/**
 * Get comprehensive timezone information
 */
export function getTimezoneInfo(timezone: string): TimezoneInfo {
  const observesDST = observesDaylightSaving(timezone);
  const currentlyInDST = observesDST ? isCurrentlyInDST(timezone) : false;
  
  // Format current time
  let currentTime = '';
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    currentTime = formatter.format(now);
  } catch (error) {
    console.error('Error formatting time:', error);
    currentTime = 'Time unavailable';
  }

  return {
    timezone,
    observesDST,
    currentlyInDST,
    currentTime
  };
}

/**
 * Get timezone from coordinates with improved accuracy
 */
export function getTimezoneFromCoordinates(lat: number, lon: number): string {
  // More precise timezone boundaries
  
  // United States
  if (lat >= 60 && lon >= -180 && lon <= -120) return 'America/Anchorage'; // Alaska
  if (lat >= 25 && lat <= 50 && lon >= -125 && lon <= -114) return 'America/Los_Angeles'; // Pacific
  if (lat >= 25 && lat <= 50 && lon >= -114 && lon <= -104) return 'America/Denver'; // Mountain
  if (lat >= 25 && lat <= 50 && lon >= -104 && lon <= -87) return 'America/Chicago'; // Central
  if (lat >= 25 && lat <= 50 && lon >= -87 && lon <= -67) return 'America/New_York'; // Eastern
  
  // Europe
  if (lat >= 35 && lat <= 70 && lon >= -10 && lon <= 40) {
    if (lon >= -10 && lon <= 2) return 'Europe/London'; // UK
    if (lon >= 2 && lon <= 15) return 'Europe/Paris'; // Western Europe
    if (lon >= 15 && lon <= 30) return 'Europe/Berlin'; // Central Europe
    return 'Europe/Moscow'; // Eastern Europe
  }
  
  // Asia
  if (lat >= 10 && lat <= 70 && lon >= 40 && lon <= 180) {
    // Middle East
    if (lon >= 40 && lon <= 70) return 'Asia/Dubai';
    
    // South Asia
    if (lon >= 70 && lon <= 90) return 'Asia/Kolkata'; // India
    
    // East Asia
    if (lon >= 90 && lon <= 120) {
      // China
      if (lat >= 18 && lat <= 54) return 'Asia/Shanghai';
      // Southeast Asia
      if (lat >= 10 && lat <= 25) {
        // Philippines
        if (lon >= 116 && lon <= 127 && lat >= 4.5 && lat <= 21) return 'Asia/Manila';
        // Thailand, Vietnam
        if (lon >= 100 && lon <= 110) return 'Asia/Bangkok';
        // Malaysia, Singapore
        if (lon >= 100 && lon <= 120 && lat >= 0 && lat <= 7) return 'Asia/Kuala_Lumpur';
      }
      return 'Asia/Shanghai';
    }
    
    // Japan, Korea
    if (lon >= 120 && lon <= 140) {
      if (lat >= 30 && lat <= 46) return 'Asia/Tokyo';
      if (lat >= 33 && lat <= 43) return 'Asia/Seoul';
      return 'Asia/Tokyo';
    }
    
    return 'Asia/Shanghai';
  }
  
  // Australia
  if (lat >= -45 && lat <= -10 && lon >= 110 && lon <= 155) {
    if (lon >= 110 && lon <= 130) return 'Australia/Perth'; // Western Australia
    if (lon >= 130 && lon <= 138) return 'Australia/Darwin'; // Northern Territory
    if (lon >= 138 && lon <= 142) return 'Australia/Adelaide'; // South Australia
    if (lon >= 142 && lon <= 154) return 'Australia/Sydney'; // Eastern Australia
    return 'Australia/Sydney';
  }
  
  // Africa
  if (lat >= -35 && lat <= 35 && lon >= -20 && lon <= 50) {
    if (lat >= 0 && lat <= 35) return 'Africa/Cairo'; // Northern Africa
    return 'Africa/Johannesburg'; // Southern Africa
  }
  
  // South America
  if (lat >= -55 && lat <= 15 && lon >= -85 && lon <= -35) {
    if (lon >= -85 && lon <= -70) return 'America/Lima'; // Western South America
    if (lon >= -70 && lon <= -50) return 'America/Sao_Paulo'; // Eastern South America
    return 'America/Argentina/Buenos_Aires'; // Southern South America
  }
  
  // Default fallback
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get timezone from location name via geocoding
 */
export async function getTimezoneFromLocation(location: string): Promise<TimezoneInfo | null> {
  if (!location) return null;
  
  try {
    // Geocode the location
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      const timezone = getTimezoneFromCoordinates(parseFloat(lat), parseFloat(lon));
      return getTimezoneInfo(timezone);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting timezone for location:', error);
    return null;
  }
}
