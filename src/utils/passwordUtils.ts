
/**
 * A simple password hashing utility that works in browser environments
 * (Browser-compatible replacement for Node's crypto)
 */

/**
 * Generates a hash of the password with a prefix to identify it as our hash
 */
export const hashPassword = (password: string): string => {
  // In a browser environment, we'll use a simpler approach than pbkdf2
  // Note: In a production app, you would use a more secure method like bcrypt via an API
  const hash = btoa(password); // Simple base64 encoding (not secure for production)
  return `simple:${hash}`;
};

/**
 * Verifies a password against a hash
 */
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  // Check the hash type
  if (hashedPassword.startsWith('simple:')) {
    const hash = hashedPassword.substring(7); // Remove the "simple:" prefix
    return hash === btoa(password);
  }
  
  // If it's not a simple hash, we can't verify it
  console.warn('Unsupported hash format');
  return false;
};
