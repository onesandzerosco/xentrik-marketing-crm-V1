
/**
 * Utility functions for checking localStorage usage and limits
 */

/**
 * Get the approximate size of localStorage data in bytes
 */
export const getLocalStorageSize = (): number => {
  let totalSize = 0;
  
  for (let key in localStorage) {
    // Skip built-in properties
    if (!localStorage.hasOwnProperty(key)) continue;
    
    // Get the size of the key and its value
    const value = localStorage[key];
    totalSize += (key.length + value.length) * 2; // UTF-16 uses 2 bytes per character
  }
  
  return totalSize;
};

/**
 * Format bytes to a human-readable format (KB, MB)
 */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / 1048576).toFixed(2) + " MB";
};

/**
 * Get the total localStorage limit for the current browser
 * Note: This is an estimation as browsers don't expose this directly
 */
export const getLocalStorageLimit = (): string => {
  // Common localStorage limits by browser
  // Chrome, Firefox, Safari: ~5-10MB
  // Edge: ~10MB
  // IE: ~10MB
  return "~5-10 MB (varies by browser)";
};

/**
 * Calculate the percentage of localStorage used
 * Uses a conservative 5MB estimate for the limit
 */
export const getLocalStorageUsagePercentage = (): number => {
  const bytesUsed = getLocalStorageSize();
  const estimatedLimit = 5 * 1048576; // 5MB in bytes
  return Math.round((bytesUsed / estimatedLimit) * 100);
};

/**
 * Get a detailed breakdown of localStorage usage by key
 */
export const getLocalStorageBreakdown = (): Array<{key: string, size: number, formattedSize: string}> => {
  const breakdown = [];
  
  for (let key in localStorage) {
    // Skip built-in properties
    if (!localStorage.hasOwnProperty(key)) continue;
    
    const value = localStorage[key];
    const size = (key.length + value.length) * 2; // UTF-16 uses 2 bytes per character
    
    breakdown.push({
      key,
      size,
      formattedSize: formatBytes(size)
    });
  }
  
  // Sort by size (largest first)
  return breakdown.sort((a, b) => b.size - a.size);
};
