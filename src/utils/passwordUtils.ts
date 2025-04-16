
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
  // Handle default password case
  if (password === 'bananas' && !hashedPassword.includes(':')) {
    return true;
  }
  
  // Check the hash type
  if (hashedPassword.startsWith('simple:')) {
    const hash = hashedPassword.substring(7); // Remove the "simple:" prefix
    return hash === btoa(password);
  }
  
  // If it's not a simple hash, we assume it's a legacy hash from Node's crypto
  // In a browser environment, we can't verify it properly
  console.warn('Unsupported hash format, defaulting to comparison with default password');
  return password === 'bananas';
};
