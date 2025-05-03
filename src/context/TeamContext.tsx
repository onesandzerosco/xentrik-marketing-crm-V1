import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TeamMember, TeamFilters } from '@/types/team';
import { TeamMemberRole } from '@/types/employee';

interface TeamContextProps {
  teamMembers: TeamMember[];
  loading: boolean;
  error: string | null;
  addTeamMember: (teamMember: Omit<TeamMember, 'id' | 'createdAt'>, password: string) => Promise<void>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  filterTeamMembers: (filters: TeamFilters) => TeamMember[];
}

const TeamContext = createContext<TeamContextProps | undefined>(undefined);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within a TeamProvider');
  return context;
};

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      const formattedTeamMembers: TeamMember[] = data.map((profile: any) => ({
        id: profile.id,
        name: profile.name || '',
        email: profile.email || '',
        // Map both the primary role and additional roles correctly
        role: profile.role || 'Employee', // Primary role from 'role' column
        roles: profile.roles || [], // Additional roles from 'roles' array column
        status: profile.status || 'Active',
        teams: profile.teams || [],
        telegram: profile.telegram,
        phoneNumber: profile.phone_number,
        lastLogin: profile.last_login || 'Never',
        profileImage: profile.profile_image,
        department: profile.department,
        createdAt: profile.created_at
      }));
      
      setTeamMembers(formattedTeamMembers);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching team members:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = async (newMember: Omit<TeamMember, 'id' | 'createdAt'>, password: string) => {
    try {
      setLoading(true);
      
      // The RPC function expects separate 'role' and 'roles' parameters
      const { data, error } = await supabase.rpc('create_team_member', {
        email: newMember.email,
        password: password,
        name: newMember.name,
        phone: newMember.phoneNumber,
        telegram: newMember.telegram,
        // Need to specify 'role' separately for the RPC function
        role: newMember.role, // Send primary role as a separate parameter
        roles: newMember.roles, // Send additional roles as array
        teams: newMember.teams
      });
      
      if (error) throw error;
      
      // Refetch to get the updated list with the new member
      await fetchTeamMembers();
      
      toast({
        title: "Success",
        description: `${newMember.name} has been added to the team`,
      });
    } catch (err: any) {
      console.error('Error adding team member:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message || "Failed to add team member",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
    try {
      setLoading(true);
      
      // Map to database column names
      const dbUpdates: any = {
        name: updates.name,
        teams: updates.teams,
        role: updates.role, // Primary role goes to the 'role' column
        roles: updates.roles, // Additional roles go to the 'roles' array column
        status: updates.status,
        telegram: updates.telegram,
        phone_number: updates.phoneNumber,
        department: updates.department,
        profile_image: updates.profileImage
      };
      
      // Filter out undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key] === undefined) {
          delete dbUpdates[key];
        }
      });
      
      console.log("Updating team member with:", dbUpdates);
      
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setTeamMembers(prev => 
        prev.map(member => member.id === id ? { ...member, ...updates } : member)
      );
      
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
    } catch (err: any) {
      console.error('Error updating team member:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message || "Failed to update team member",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteTeamMember = async (id: string) => {
    try {
      setLoading(true);
      
      // Delete user from auth (will cascade to profiles)
      const { error } = await supabase.auth.admin.deleteUser(id);
      
      if (error) throw error;
      
      // Update local state
      setTeamMembers(prev => prev.filter(member => member.id !== id));
      
      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
    } catch (err: any) {
      console.error('Error deleting team member:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message || "Failed to delete team member",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTeamMembers = (filters: TeamFilters): TeamMember[] => {
    return teamMembers.filter(member => {
      // Filter by roles
      const roleMatch = filters.roles.length === 0 || 
        member.roles.some(role => filters.roles.includes(role));
      
      // Filter by teams
      const teamMatch = filters.teams.length === 0 || 
        (member.teams && member.teams.some(team => filters.teams.includes(team)));
      
      // Filter by status
      const statusMatch = filters.status.length === 0 || 
        filters.status.includes(member.status);
      
      // Filter by search query
      const searchMatch = !filters.searchQuery || 
        member.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      return roleMatch && teamMatch && statusMatch && searchMatch;
    });
  };

  return (
    <TeamContext.Provider value={{
      teamMembers,
      loading,
      error,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
      filterTeamMembers
    }}>
      {children}
    </TeamContext.Provider>
  );
};
