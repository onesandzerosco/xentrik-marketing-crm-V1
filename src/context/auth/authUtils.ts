import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Helper function to check creator status
export const checkCreatorStatus = async (userId: string) => {
  try {
    // First check if user has Creator role in profiles.roles
    const { data: profileData } = await supabase
      .from('profiles')
      .select('roles, role')
      .eq('id', userId)
      .single();
      
    let hasCreatorRole = false;
    let userRoles: string[] = [];
    let userRole = 'Employee';
    let creatorId: string | null = null;
    
    if (profileData?.roles && Array.isArray(profileData.roles) && profileData.roles.includes('Creator')) {
      hasCreatorRole = true;
      localStorage.setItem('isCreator', 'true');
      creatorId = userId;
      localStorage.setItem('creatorId', userId);
      userRoles = profileData.roles;
      localStorage.setItem('userRoles', JSON.stringify(profileData.roles));
      
      // Ensure creator record exists and is approved
      await ensureCreatorRecord(userId);
    }
    
    if (profileData?.role) {
      userRole = profileData.role;
      localStorage.setItem('userRole', profileData.role);
    }
    
    // Also check creator_team_members for associations if not already identified as creator
    if (!hasCreatorRole) {
      const { data: teamMemberData } = await supabase
        .from('creator_team_members')
        .select('creator_id')
        .eq('team_member_id', userId)
        .limit(1);
      
      if (teamMemberData && teamMemberData.length > 0) {
        // If user is directly associated with a creator but doesn't have Creator role,
        // keep the creatorId but don't set isCreator
        creatorId = teamMemberData[0].creator_id;
        localStorage.setItem('creatorId', teamMemberData[0].creator_id);
      } else {
        // Only reset these if user isn't a creator by role
        creatorId = null;
        localStorage.removeItem('creatorId');
      }
    }

    return {
      isCreator: hasCreatorRole,
      creatorId,
      userRole,
      userRoles
    };
  } catch (error) {
    console.error('Error checking creator status:', error);
    return {
      isCreator: false,
      creatorId: null,
      userRole: 'Employee',
      userRoles: []
    };
  }
};

// Helper function to ensure creator record exists in database
export const ensureCreatorRecord = async (userId: string) => {
  try {
    // Check if creator record exists
    const { data: existingCreator } = await supabase
      .from('creators')
      .select('id, needs_review')
      .eq('id', userId)
      .maybeSingle();
    
    if (!existingCreator) {
      console.log("Creating creator record for user:", userId);
      
      // Get user profile data
      const { data: userData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();
        
      if (userData) {
        // Create creator record - automatically approved
        await supabase
          .from('creators')
          .insert({
            id: userId,
            name: userData.name,
            gender: 'Male', // Default value required
            team: 'A Team', // Default value required
            creator_type: 'Real', // Default value required
            needs_review: false // Automatically approved
          });
        
        // Create empty social links record
        await supabase
          .from('creator_social_links')
          .insert({
            creator_id: userId
          });
      }
    } else if (existingCreator.needs_review) {
      // If creator exists but needs review, automatically approve them
      await supabase
        .from('creators')
        .update({ needs_review: false })
        .eq('id', userId);
    }
  } catch (error) {
    console.error('Error ensuring creator record exists:', error);
  }
};

// Helper function to update user credentials
export const updateUserCredentials = async (
  credentials: { 
    email?: string; 
    password?: string;
    currentPassword?: string;
    displayName?: string;
    profileImage?: string;
  }
) => {
  // Build update object based on provided credentials
  const updateData: { email?: string; password?: string; data?: Record<string, any> } = {};
  if (credentials.email) updateData.email = credentials.email;
  if (credentials.password) updateData.password = credentials.password;
  
  // Add user metadata updates if provided
  if (credentials.displayName || credentials.profileImage) {
    updateData.data = {};
    
    if (credentials.displayName) {
      updateData.data.name = credentials.displayName;
    }
    
    if (credentials.profileImage) {
      updateData.data.avatar_url = credentials.profileImage;
    }
  }
  
  // Update auth credentials
  const { error } = await supabase.auth.updateUser(updateData);
  
  if (error) throw error;
  
  return true;
};

// Helper function to create team members
export const createTeamMember = async (data: { 
  username: string; 
  email: string; 
  role: string;
}): Promise<boolean> => {
  // Create a random temporary password
  const tempPassword = Math.random().toString(36).slice(-10);
  
  // Call the create_team_member function
  const { data: newUser, error } = await supabase.rpc(
    'create_team_member',
    { 
      email: data.email, 
      password: tempPassword,
      name: data.username,
      roles: [data.role]
    }
  );
  
  if (error) {
    throw error;
  }
  
  console.log("Team member created with ID:", newUser);
  return true;
};

// Helper functions to get/set stored auth values
export const getStoredAuthValues = () => {
  const storedIsCreator = localStorage.getItem('isCreator');
  const storedCreatorId = localStorage.getItem('creatorId');
  const storedUserRole = localStorage.getItem('userRole');
  const storedUserRoles = localStorage.getItem('userRoles');
  
  let parsedUserRoles: string[] = [];
  if (storedUserRoles) {
    try {
      const parsed = JSON.parse(storedUserRoles);
      if (Array.isArray(parsed)) {
        parsedUserRoles = parsed;
      }
    } catch (e) {
      console.error('Error parsing stored user roles:', e);
    }
  }
  
  return {
    isCreator: storedIsCreator === 'true',
    creatorId: storedCreatorId || null,
    userRole: storedUserRole || 'Employee',
    userRoles: parsedUserRoles
  };
};

// Clear stored auth values
export const clearStoredAuthValues = () => {
  localStorage.removeItem('isCreator');
  localStorage.removeItem('creatorId');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userRoles');
};
