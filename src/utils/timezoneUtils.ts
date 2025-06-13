
/**
 * Utility functions for timezone and daylight saving time detection
 */

/**
 * Checks if a timezone is currently observing daylight saving time
 */
export const isDaylightSavingTime = (timezone: string): boolean => {
  try {
    const now = new Date();
    
    // Create two dates: one in January (winter) and one in July (summer)
    const january = new Date(now.getFullYear(), 0, 1);
    const july = new Date(now.getFullYear(), 6, 1);
    
    // Get timezone offsets for both dates
    const januaryOffset = getTimezoneOffset(january, timezone);
    const julyOffset = getTimezoneOffset(july, timezone);
    const currentOffset = getTimezoneOffset(now, timezone);
    
    // If the offsets are different, DST is observed in this timezone
    const observesDST = januaryOffset !== julyOffset;
    
    if (!observesDST) {
      return false;
    }
    
    // If DST is observed, check if we're currently in the DST period
    // DST is typically when the offset is less (closer to UTC)
    const dstOffset = Math.min(januaryOffset, julyOffset);
    return currentOffset === dstOffset;
  } catch (error) {
    console.error('Error checking DST for timezone:', timezone, error);
    return false;
  }
};

/**
 * Gets the timezone offset in minutes for a specific date and timezone
 */
const getTimezoneOffset = (date: Date, timezone: string): number => {
  try {
    // Create formatters for UTC and the target timezone
    const utcFormatter = new Intl.DateTimeFormat('en', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const targetFormatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const utcTime = new Date(utcFormatter.format(date));
    const targetTime = new Date(targetFormatter.format(date));
    
    // Calculate the difference in minutes
    return (utcTime.getTime() - targetTime.getTime()) / (1000 * 60);
  } catch (error) {
    console.error('Error getting timezone offset:', error);
    return 0;
  }
};

/**
 * Enhanced timezone detection with proper DST handling
 */
export const getTimezoneFromCoordinates = (lat: number, lon: number): string => {
  // Base timezone detection using geographic boundaries
  // This gives us the standard timezone identifier
  let baseTimezone: string;
  
  // United States
  if (lat >= 60 && lon >= -180 && lon <= -120) baseTimezone = 'America/Anchorage'; // Alaska
  else if (lat >= 25 && lat <= 50 && lon >= -125 && lon <= -114) baseTimezone = 'America/Los_Angeles'; // Pacific
  else if (lat >= 25 && lat <= 50 && lon >= -114 && lon <= -104) baseTimezone = 'America/Denver'; // Mountain
  else if (lat >= 25 && lat <= 50 && lon >= -104 && lon <= -87) baseTimezone = 'America/Chicago'; // Central
  else if (lat >= 25 && lat <= 50 && lon >= -87 && lon <= -67) baseTimezone = 'America/New_York'; // Eastern
  
  // Europe
  else if (lat >= 35 && lat <= 70 && lon >= -10 && lon <= 40) {
    if (lon >= -10 && lon <= 2) baseTimezone = 'Europe/London'; // UK
    else if (lon >= 2 && lon <= 15) baseTimezone = 'Europe/Paris'; // Western Europe
    else if (lon >= 15 && lon <= 30) baseTimezone = 'Europe/Berlin'; // Central Europe
    else baseTimezone = 'Europe/Moscow'; // Eastern Europe/Russia
  }
  
  // Asia
  else if (lat >= 10 && lat <= 70 && lon >= 40 && lon <= 180) {
    // Middle East
    if (lon >= 40 && lon <= 70) baseTimezone = 'Asia/Dubai'; // UAE
    // South Asia
    else if (lon >= 70 && lon <= 90) baseTimezone = 'Asia/Kolkata'; // India
    // East Asia
    else if (lon >= 90 && lon <= 120) {
      // China
      if (lat >= 18 && lat <= 54) baseTimezone = 'Asia/Shanghai'; // China
      // Southeast Asia
      else if (lat >= 10 && lat <= 25) {
        // Philippines
        if (lon >= 116 && lon <= 127 && lat >= 4.5 && lat <= 21) baseTimezone = 'Asia/Manila'; // Philippines
        // Thailand, Vietnam
        else if (lon >= 100 && lon <= 110) baseTimezone = 'Asia/Bangkok'; // Thailand
        // Malaysia, Singapore
        else if (lon >= 100 && lon <= 120 && lat >= 0 && lat <= 7) baseTimezone = 'Asia/Kuala_Lumpur'; // Malaysia
        else baseTimezone = 'Asia/Shanghai';
      }
      else baseTimezone = 'Asia/Shanghai';
    }
    // Japan, Korea
    else if (lon >= 120 && lon <= 140) {
      if (lat >= 30 && lat <= 46) baseTimezone = 'Asia/Tokyo'; // Japan
      else if (lat >= 33 && lat <= 43) baseTimezone = 'Asia/Seoul'; // South Korea
      else baseTimezone = 'Asia/Tokyo';
    }
    else baseTimezone = 'Asia/Shanghai';
  }
  
  // Australia
  else if (lat >= -45 && lat <= -10 && lon >= 110 && lon <= 155) {
    if (lon >= 110 && lon <= 130) baseTimezone = 'Australia/Perth'; // Western Australia
    else if (lon >= 130 && lon <= 138) baseTimezone = 'Australia/Darwin'; // Northern Territory
    else if (lon >= 138 && lon <= 142) baseTimezone = 'Australia/Adelaide'; // South Australia
    else if (lon >= 142 && lon <= 154) baseTimezone = 'Australia/Sydney'; // Eastern Australia
    else baseTimezone = 'Australia/Sydney';
  }
  
  // Africa
  else if (lat >= -35 && lat <= 35 && lon >= -20 && lon <= 50) {
    if (lat >= 0 && lat <= 35) baseTimezone = 'Africa/Cairo'; // North Africa
    else baseTimezone = 'Africa/Johannesburg'; // South Africa
  }
  
  // South America
  else if (lat >= -55 && lat <= 15 && lon >= -85 && lon <= -35) {
    if (lon >= -85 && lon <= -70) baseTimezone = 'America/Lima'; // Peru
    else if (lon >= -70 && lon <= -50) baseTimezone = 'America/Sao_Paulo'; // Brazil
    else baseTimezone = 'America/Argentina/Buenos_Aires'; // Argentina
  }
  
  // Default fallback
  else {
    baseTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  
  return baseTimezone;
};

/**
 * Formats the current time for a given timezone, accounting for DST
 */
export const formatTimeForTimezone = (timezone: string): string => {
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
    
    return formatter.format(now);
  } catch (error) {
    console.error('Error formatting time for timezone:', timezone, error);
    return '';
  }
};
