
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeam } from '@/context/TeamContext';
import { useAuth } from '@/context/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import ProfileImageSection from '@/components/team/ProfileImageSection';
import BasicInfoSection from '@/components/team/BasicInfoSection';
import TeamAssignmentSection from '@/components/team/TeamAssignmentSection';
import CreatorsAssignmentSection from '@/components/team/CreatorsAssignmentSection';
import { teamMemberFormSchema } from '@/schemas/teamMemberSchema';
import { useToast } from '@/hooks/use-toast';

const TeamMemberEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { teamMembers, updateTeamMember } = useTeam();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const teamMember = id ? teamMembers.find(member => member.id === id) : null;
  const isCurrentUser = user?.id === id;

  const form = useForm<z.infer<typeof teamMemberFormSchema>>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: teamMember?.name || '',
      email: teamMember?.email || '',
      roles: teamMember?.roles || [],
      status: teamMember?.status || 'Active',
      teams: teamMember?.teams || [],
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

  const handleSubmit = async (values: z.infer<typeof teamMemberFormSchema>) => {
    try {
      await updateTeamMember(teamMember.id, values);
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
      navigate(`/team/${teamMember.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <BackButton to={`/team/${teamMember.id}`} />
        <div>
          <h1 className="text-2xl font-bold">Edit Team Member</h1>
          <p className="text-sm text-muted-foreground">
            Update information for {teamMember.name}
            {isCurrentUser && " (me)"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ProfileImageSection 
                profileImage={form.watch("profileImage") || ""}
                name={form.watch("name") || teamMember.name}
                handleProfileImageChange={(url) => form.setValue("profileImage", url)}
              />
              
              <BasicInfoSection 
                control={form.control}
                isCurrentUser={isCurrentUser}
              />
            </div>

            <div className="space-y-6">
              <TeamAssignmentSection 
                selectedTeams={form.watch("teams") || []}
                toggleTeam={(team) => {
                  const currentTeams = form.getValues("teams") || [];
                  const newTeams = currentTeams.includes(team)
                    ? currentTeams.filter(t => t !== team)
                    : [...currentTeams, team];
                  form.setValue("teams", newTeams);
                }}
              />

              <CreatorsAssignmentSection 
                selectedCreators={form.watch("assignedCreators") || []}
                toggleCreator={(creatorId) => {
                  const currentCreators = form.getValues("assignedCreators") || [];
                  const newCreators = currentCreators.includes(creatorId)
                    ? currentCreators.filter(id => id !== creatorId)
                    : [...currentCreators, creatorId];
                  form.setValue("assignedCreators", newCreators);
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/team/${teamMember.id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-black rounded-[15px] px-4 py-2 transition-all hover:bg-gradient-premium-yellow hover:text-black hover:-translate-y-0.5 hover:shadow-premium-yellow hover:opacity-90 bg-gradient-premium-yellow shadow-premium-yellow"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default TeamMemberEdit;
