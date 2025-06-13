
/**
 * Utility functions for timezone and daylight saving time detection
 */

/**
 * Checks if a timezone actually observes daylight saving time at all
 */
export const timeZoneObservesDST = (timezone: string): boolean => {
  try {
    const now = new Date();
    
    // Create two dates: one in January (winter) and one in July (summer)
    const january = new Date(now.getFullYear(), 0, 1);
    const july = new Date(now.getFullYear(), 6, 1);
    
    // Get timezone offsets for both dates
    const januaryOffset = getTimezoneOffset(january, timezone);
    const julyOffset = getTimezoneOffset(july, timezone);
    
    // If the offsets are different, DST is observed in this timezone
    return januaryOffset !== julyOffset;
  } catch (error) {
    console.error('Error checking if timezone observes DST:', timezone, error);
    return false;
  }
};

/**
 * Checks if a timezone is currently observing daylight saving time
 * Only returns true if the timezone actually observes DST AND is currently in DST period
 */
export const isDaylightSavingTime = (timezone: string): boolean => {
  try {
    // First check if this timezone even observes DST
    if (!timeZoneObservesDST(timezone)) {
      return false;
    }
    
    const now = new Date();
    
    // Create two dates: one in January (winter) and one in July (summer)
    const january = new Date(now.getFullYear(), 0, 1);
    const july = new Date(now.getFullYear(), 6, 1);
    
    // Get timezone offsets for both dates
    const januaryOffset = getTimezoneOffset(january, timezone);
    const julyOffset = getTimezoneOffset(july, timezone);
    const currentOffset = getTimezoneOffset(now, timezone);
    
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
    // Use Intl.DateTimeFormat to get the actual offset for the timezone
    const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    
    const targetDate = new Date(utcDate.toLocaleString("en-US", { timeZone: timezone }));
    const utcTime = new Date(utcDate.toLocaleString("en-US", { timeZone: "UTC" }));
    
    // Calculate the difference in minutes
    return (utcTime.getTime() - targetDate.getTime()) / (1000 * 60);
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
  
  // Asia (Philippines and other Asian countries that don't observe DST)
  else if (lat >= 10 && lat <= 70 && lon >= 40 && lon <= 180) {
    // Middle East
    if (lon >= 40 && lon <= 70) baseTimezone = 'Asia/Dubai'; // UAE (no DST)
    // South Asia
    else if (lon >= 70 && lon <= 90) baseTimezone = 'Asia/Kolkata'; // India (no DST)
    // East Asia
    else if (lon >= 90 && lon <= 120) {
      // China
      if (lat >= 18 && lat <= 54) baseTimezone = 'Asia/Shanghai'; // China (no DST)
      // Southeast Asia
      else if (lat >= 10 && lat <= 25) {
        // Philippines
        if (lon >= 116 && lon <= 127 && lat >= 4.5 && lat <= 21) baseTimezone = 'Asia/Manila'; // Philippines (no DST)
        // Thailand, Vietnam
        else if (lon >= 100 && lon <= 110) baseTimezone = 'Asia/Bangkok'; // Thailand (no DST)
        // Malaysia, Singapore
        else if (lon >= 100 && lon <= 120 && lat >= 0 && lat <= 7) baseTimezone = 'Asia/Kuala_Lumpur'; // Malaysia (no DST)
        else baseTimezone = 'Asia/Shanghai';
      }
      else baseTimezone = 'Asia/Shanghai';
    }
    // Japan, Korea
    else if (lon >= 120 && lon <= 140) {
      if (lat >= 30 && lat <= 46) baseTimezone = 'Asia/Tokyo'; // Japan (no DST currently)
      else if (lat >= 33 && lat <= 43) baseTimezone = 'Asia/Seoul'; // South Korea (no DST currently)
      else baseTimezone = 'Asia/Tokyo';
    }
    else baseTimezone = 'Asia/Shanghai';
  }
  
  // Australia (observes DST in some regions)
  else if (lat >= -45 && lat <= -10 && lon >= 110 && lon <= 155) {
    if (lon >= 110 && lon <= 130) baseTimezone = 'Australia/Perth'; // Western Australia (no DST)
    else if (lon >= 130 && lon <= 138) baseTimezone = 'Australia/Darwin'; // Northern Territory (no DST)
    else if (lon >= 138 && lon <= 142) baseTimezone = 'Australia/Adelaide'; // South Australia (has DST)
    else if (lon >= 142 && lon <= 154) baseTimezone = 'Australia/Sydney'; // Eastern Australia (has DST)
    else baseTimezone = 'Australia/Sydney';
  }
  
  // Africa (most countries don't observe DST)
  else if (lat >= -35 && lat <= 35 && lon >= -20 && lon <= 50) {
    if (lat >= 0 && lat <= 35) baseTimezone = 'Africa/Cairo'; // North Africa (Egypt has no DST currently)
    else baseTimezone = 'Africa/Johannesburg'; // South Africa (no DST)
  }
  
  // South America (some countries observe DST)
  else if (lat >= -55 && lat <= 15 && lon >= -85 && lon <= -35) {
    if (lon >= -85 && lon <= -70) baseTimezone = 'America/Lima'; // Peru (no DST)
    else if (lon >= -70 && lon <= -50) baseTimezone = 'America/Sao_Paulo'; // Brazil (has DST in some regions)
    else baseTimezone = 'America/Argentina/Buenos_Aires'; // Argentina (no DST currently)
  }
  
  // Default fallback
  else {
    baseTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  
  return baseTimezone;
};

/**
 * Formats the current time for a given timezone, accounting for DST only if the timezone observes it
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
    
    const formattedTime = formatter.format(now);
    
    // Log DST status for debugging
    const observesDst = timeZoneObservesDST(timezone);
    const currentlyDst = isDaylightSavingTime(timezone);
    console.log(`Timezone: ${timezone}, Observes DST: ${observesDst}, Currently in DST: ${currentlyDst}, Time: ${formattedTime}`);
    
    return formattedTime;
  } catch (error) {
    console.error('Error formatting time for timezone:', timezone, error);
    return '';
  }
};
