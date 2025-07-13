
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { teamMemberFormSchema, TeamMemberFormValues } from "@/schemas/teamMemberSchema";
import { useTeam } from "@/context/TeamContext";
import BasicInfoSection from "@/components/team/BasicInfoSection";
import ProfileImageSection from "@/components/team/ProfileImageSection";
import TeamAssignmentSection from "@/components/team/TeamAssignmentSection";
import CreatorsAssignmentSection from "@/components/team/CreatorsAssignmentSection";
import { EmployeeTeam } from "@/types/employee";

const AddTeamMemberForm: React.FC = () => {
  const { toast } = useToast();
  const { addTeamMember, loading } = useTeam();
  const [selectedTeams, setSelectedTeams] = useState<EmployeeTeam[]>([]);
  const [selectedCreators, setSelectedCreators] = useState<string[]>([]);

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Employee",
      status: "Active",
      roles: [],
      teams: [],
      telegram: "",
      phoneNumber: "",
      department: "",
      profileImage: "",
      assignedCreators: [],
      geographicRestrictions: []
    }
  });

  const handleSubmit = async (values: TeamMemberFormValues) => {
    try {
      // Add selected teams and creators to form values
      const teamMemberData = {
        ...values,
        teams: selectedTeams,
        assignedCreators: selectedCreators,
      };

      await addTeamMember(teamMemberData, values.password);
      
      // Reset form and selections
      form.reset();
      setSelectedTeams([]);
      setSelectedCreators([]);
      
      toast({
        title: "Success",
        description: `${values.name} has been added to the team successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProfileImageChange = (url: string) => {
    form.setValue("profileImage", url);
  };

  const toggleTeam = (team: EmployeeTeam) => {
    setSelectedTeams(prev => {
      if (prev.includes(team)) {
        return prev.filter(t => t !== team);
      } else {
        return [...prev, team];
      }
    });
  };

  const toggleCreator = (creatorId: string) => {
    setSelectedCreators(prev => {
      if (prev.includes(creatorId)) {
        return prev.filter(id => id !== creatorId);
      } else {
        return [...prev, creatorId];
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Add New Team Member</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Create a new team member account with role and team assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 sm:space-y-6">
            {/* Mobile: Stack vertically, Desktop: Side by side */}
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <ProfileImageSection 
                  profileImage={form.watch("profileImage") || ""}
                  name={form.watch("name") || "New Member"}
                  handleProfileImageChange={handleProfileImageChange}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <BasicInfoSection control={form.control} />
              </div>
            </div>

            <TeamAssignmentSection 
              selectedTeams={selectedTeams}
              toggleTeam={toggleTeam}
            />

            <CreatorsAssignmentSection 
              selectedCreators={selectedCreators}
              toggleCreator={toggleCreator}
            />
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  form.reset();
                  setSelectedTeams([]);
                  setSelectedCreators([]);
                }}
                className="w-full sm:w-auto order-2 sm:order-1"
                disabled={loading}
              >
                Reset Form
              </Button>
              <Button 
                type="submit" 
                variant="premium"
                className="w-full sm:w-auto shadow-premium-yellow order-1 sm:order-2"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Team Member"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddTeamMemberForm;
