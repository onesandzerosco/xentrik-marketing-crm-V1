
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeam } from '@/context/TeamContext';
import { useAuth } from '@/context/AuthContext';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BackButton } from '@/components/ui/back-button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProfileImageSection from '@/components/team/ProfileImageSection';
import { useToast } from '@/hooks/use-toast';

const teamMemberFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  status: z.enum(["Active", "Inactive", "Paused"]),
  telegram: z.string().optional(),
  department: z.string().optional(),
  profileImage: z.string().optional(),
  teams: z.array(z.string()).default([]),
  role: z.enum(["Admin", "Manager", "Employee"]).optional(),
  roles: z.array(z.string()).default([]),
  phoneNumber: z.string().optional(),
});

type FormValues = z.infer<typeof teamMemberFormSchema>;

const TeamMemberEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { teamMembers, updateTeamMember } = useTeam();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const teamMember = id ? teamMembers.find(member => member.id === id) : null;
  const isCurrentUser = user?.id === id;

  const form = useForm<FormValues>({
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

  const handleSubmit = async (values: FormValues) => {
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

  // Available roles
  const availableRoles = [
    "Manager",
    "Creative Director",
    "Developer",
    "Editor",
    "Chatters"
  ];

  // Team options
  const teamOptions = ["A", "B", "C"];

  // Handle role toggle
  const handleRoleToggle = (role: string) => {
    const currentRoles = form.getValues("roles") || [];
    const updatedRoles = currentRoles.includes(role)
      ? currentRoles.filter(r => r !== role)
      : [...currentRoles, role];
    form.setValue("roles", updatedRoles);
  };

  // Handle team toggle
  const handleTeamToggle = (team: string) => {
    const currentTeams = form.getValues("teams") || [];
    const updatedTeams = currentTeams.includes(team)
      ? currentTeams.filter(t => t !== team)
      : [...currentTeams, team];
    form.setValue("teams", updatedTeams);
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
              {/* Profile Image */}
              <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
                <h2 className="text-xl font-semibold mb-4">Profile Image</h2>
                <ProfileImageSection 
                  profileImage={form.watch("profileImage") || ""}
                  name={form.watch("name") || teamMember.name}
                  handleProfileImageChange={(url) => form.setValue("profileImage", url)}
                />
              </div>
              
              {/* Basic Info */}
              <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter email" 
                            {...field} 
                            disabled={isCurrentUser}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isCurrentUser}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Paused">Paused</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="telegram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telegram</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1234567890" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter department" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Roles */}
              <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
                <h2 className="text-xl font-semibold mb-4">Roles</h2>
                <div className="grid grid-cols-2 gap-3">
                  {availableRoles.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`role-${role}`} 
                        checked={form.watch("roles")?.includes(role)} 
                        onCheckedChange={() => handleRoleToggle(role)}
                      />
                      <label
                        htmlFor={`role-${role}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Teams */}
              <div className="bg-[#1a1a33]/50 backdrop-blur-sm p-6 rounded-xl border border-[#252538]/50">
                <h2 className="text-xl font-semibold mb-4">Teams</h2>
                <div className="grid grid-cols-3 gap-3">
                  {teamOptions.map((team) => (
                    <div key={team} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`team-${team}`} 
                        checked={form.watch("teams")?.includes(team)} 
                        onCheckedChange={() => handleTeamToggle(team)}
                      />
                      <label
                        htmlFor={`team-${team}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Team {team}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Creator assignments could go here if needed */}
            </div>
          </div>

          {/* Action Buttons */}
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
