
import React from 'react';
import { Form } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { TeamMemberFormValues } from '@/schemas/teamMemberSchema';
import ProfileImageSection from './ProfileImageSection';
import TeamBasicInfoSection from './TeamBasicInfoSection';
import TeamRolesSection from './TeamRolesSection';
import { EmployeeTeam } from '@/types/employee';

export type FormValues = TeamMemberFormValues;

interface TeamMemberEditFormProps {
  form: UseFormReturn<TeamMemberFormValues>;
  onSubmit: (values: TeamMemberFormValues) => void;
  isCurrentUser: boolean;
  teamMember: any;
}

const TeamMemberEditForm: React.FC<TeamMemberEditFormProps> = ({
  form,
  onSubmit,
  isCurrentUser,
  teamMember
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
              <h2 className="text-xl font-semibold mb-4">Profile Image</h2>
              <ProfileImageSection
                profileImage={form.watch("profileImage") || ""}
                name={form.watch("name") || teamMember.name}
                handleProfileImageChange={(url) => form.setValue("profileImage", url)}
              />
            </div>
            
            <TeamBasicInfoSection control={form.control} />
          </div>

          <div className="space-y-6">
            <TeamRolesSection control={form.control} />
          </div>
        </div>
      </form>
    </Form>
  );
};

export default TeamMemberEditForm;
