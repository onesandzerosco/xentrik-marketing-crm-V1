
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeam } from '@/context/TeamContext';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { TeamMemberRole } from '@/types/employee';
import TeamMemberEditHeader from '@/components/team/TeamMemberEditHeader';
import TeamMemberEditForm from '@/components/team/TeamMemberEditForm';
import { teamMemberFormSchema, TeamMemberFormValues } from '@/schemas/teamMemberSchema';

const TeamMemberEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { teamMembers, updateTeamMember } = useTeam();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const teamMember = id ? teamMembers.find(member => member.id === id) : null;
  const isCurrentUser = user?.id === id;

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: teamMember?.name || '',
      email: teamMember?.email || '',
      role: (teamMember?.roles?.[0] || 'Employee') as any,
      roles: teamMember?.roles || [],
      status: teamMember?.status || 'Active',
      department: teamMember?.department || '',
      telegram: teamMember?.telegram || '',
      phoneNumber: teamMember?.phoneNumber || '',
      profileImage: teamMember?.profileImage || '',
    }
  });

  if (!teamMember) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Team member not found</h1>
      </div>
    );
  }

  const handleSubmit = async (values: TeamMemberFormValues) => {
    try {
      await updateTeamMember(teamMember.id, {
        ...values,
        roles: values.roles as unknown as TeamMemberRole[]
      });
      
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
      navigate(`/team/${teamMember.id}`);
    } catch (error) {
      console.error('Error updating team member:', error);
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TeamMemberEditHeader
        memberName={teamMember.name}
        memberId={teamMember.id}
        isCurrentUser={isCurrentUser}
        onSave={form.handleSubmit(handleSubmit)}
      />
      
      <TeamMemberEditForm
        form={form}
        onSubmit={handleSubmit}
        isCurrentUser={isCurrentUser}
        teamMember={teamMember}
      />
    </div>
  );
};

export default TeamMemberEdit;
