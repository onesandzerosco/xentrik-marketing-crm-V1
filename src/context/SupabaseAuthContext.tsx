
import { SupabaseAuthProvider, useSupabaseAuth } from './auth/SupabaseAuthProvider';
import { SupabaseAuthContextType } from './auth/types';

export { SupabaseAuthProvider, useSupabaseAuth };
export type { SupabaseAuthContextType };

// For backward compatibility, export as default
export default SupabaseAuthProvider;
