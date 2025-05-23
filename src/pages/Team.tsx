
import React, { useState } from 'react';
import { TeamProvider, useTeam } from '@/context/TeamContext';
import { TeamMember, TeamFilters } from '@/types/team';
import { useNavigate } from 'react-router-dom';
import TeamHeader from '@/components/team/TeamHeader';
import TeamActiveFilters from '@/components/team/TeamActiveFilters';
import TeamMembersList from '@/components/team/TeamMembersList';
import EditTeamMemberModal from '@/components/team/EditTeamMemberModal';

// The main Team page component
const TeamContent = () => {
  const navigate = useNavigate();
  const { 
    teamMembers, 
    loading, 
    updateTeamMember,
    filterTeamMembers 
  } = useTeam();
  
  // State for filters
  const [filters, setFilters] = useState<TeamFilters>({
    roles: [],
    teams: [],
    status: [],
    searchQuery: '',
  });
  
  // State for modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  // Filter team members
  const filteredMembers = filterTeamMembers(filters);
  
  // Handle filter changes
  const handleFiltersChange = (newFilters: TeamFilters) => {
    setFilters(newFilters);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      roles: [],
      teams: [],
      status: [],
      searchQuery: '',
    });
  };
  
  // Handle editing a team member
  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };
  
  // Check if any filters are active
  const hasFilters = filters.roles.length > 0 || 
                    filters.teams.length > 0 || 
                    filters.status.length > 0 || 
                    filters.searchQuery !== '';

  return (
    <div className="p-8 w-full max-w-[1400px] mx-auto">
      <TeamHeader 
        memberCount={filteredMembers.length}
        isLoading={loading}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />
      
      <TeamActiveFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />
      
      <div className="mt-8">
        <TeamMembersList 
          members={filteredMembers}
          isLoading={loading}
          hasFilters={hasFilters}
          onEditMember={handleEditMember}
        />
      </div>
      
      <EditTeamMemberModal 
        teamMember={selectedMember}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUpdate={updateTeamMember}
      />
    </div>
  );
};

// Wrap the team page with the provider
const Team = () => {
  return (
    <TeamProvider>
      <TeamContent />
    </TeamProvider>
  );
};

export default Team;
