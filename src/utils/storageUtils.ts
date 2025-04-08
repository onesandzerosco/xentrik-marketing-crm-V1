
/**
 * Calculate the approximate size of localStorage in bytes
 */
export function getLocalStorageSize(): number {
  let totalSize = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || '';
    const value = localStorage.getItem(key) || '';
    
    // Calculate size: key length + value length in bytes
    totalSize += key.length * 2 + value.length * 2; // UTF-16 uses 2 bytes per character
  }
  
  return totalSize;
}

/**
 * Format bytes into a human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Calculate the percentage of localStorage usage based on typical browser limits
 * Most browsers have a limit of 5-10MB
 */
export function getLocalStorageUsagePercentage(): number {
  const size = getLocalStorageSize();
  // Using 5MB as a conservative estimate
  const estimatedLimit = 5 * 1024 * 1024; 
  
  return Math.min(Math.round((size / estimatedLimit) * 100), 100);
}

/**
 * Clear all localStorage data except for essential items
 * @param keysToKeep Array of localStorage keys that should not be deleted
 */
export function cleanLocalStorage(keysToKeep: string[] = []): void {
  const keysToDelete: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !keysToKeep.includes(key)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => localStorage.removeItem(key));
}
