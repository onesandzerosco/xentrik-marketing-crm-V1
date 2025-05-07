
import { SupabaseAuthProvider, useSupabaseAuth } from './auth/SupabaseAuthProvider';
import { SupabaseAuthContextType } from './auth/types';

export { SupabaseAuthProvider, useSupabaseAuth };
export type { SupabaseAuthContextType };

// Export as default for backward compatibility
export default SupabaseAuthProvider;
