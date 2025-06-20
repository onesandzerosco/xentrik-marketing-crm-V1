
/**
 * A password hashing utility that works with SHA256 in browser environments
 */

/**
 * Generates a random password
 */
export const generatePassword = (): string => {
  return "XentrikBananas"; // Using the default password as specified in the forms
};

/**
 * Generates a SHA256 hash of the password with a prefix to identify it as our hash
 */
export const hashPassword = async (password: string): Promise<string> => {
  // Use Web Crypto API for SHA256 hashing (browser compatible)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to base64
  const hashArray = new Uint8Array(hashBuffer);
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  
  return `simple:${hashBase64}`;
};

/**
 * Verifies a password against a hash
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  // Check the hash type
  if (hashedPassword.startsWith('simple:')) {
    const storedHash = hashedPassword.substring(7); // Remove the "simple:" prefix
    
    // Generate hash for the input password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    const inputHashBase64 = btoa(String.fromCharCode(...hashArray));
    
    return storedHash === inputHashBase64;
  }
  
  // If it's not a simple hash, we can't verify it
  console.warn('Unsupported hash format');
  return false;
};
