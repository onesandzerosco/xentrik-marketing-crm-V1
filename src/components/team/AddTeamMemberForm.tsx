
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ProfileImageUploader from "@/components/team/ProfileImageUploader";
import BasicInfoSection from "./BasicInfoSection";
import RolesSection from "./RolesSection";
import TeamsSection from "./TeamsSection";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TeamMemberRole } from "@/types/employee";

const PRIMARY_ROLES: TeamMemberRole[] = ["Admin", "Manager", "Employee"];

// Additional roles that can be assigned
const ADDITIONAL_ROLES: TeamMemberRole[] = [
  "Chatter",
  "Manager",
  "Developer",
  "VA",
  "Creator",
  "Admin"
];

const TEAMS = [
  { label: "Team A", value: "A" },
  { label: "Team B", value: "B" },
  { label: "Team C", value: "C" },
];

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  telegram: string;
  phoneNumber: string;
  department: string;
  profileImage: string;
  primaryRole: TeamMemberRole; // Primary role (stored in 'role' column)
  roles: string[]; // Additional roles (stored in 'roles' array column)
  teams: string[];
}

const defaultForm: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  telegram: "",
  phoneNumber: "",
  department: "",
  profileImage: "",
  primaryRole: "Employee",
  roles: [],
  teams: [],
};

const AddTeamMemberForm = () => {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileImageChange = (url: string) => {
    setForm((prev) => ({ ...prev, profileImage: url }));
  };

  const handlePrimaryRoleChange = (role: TeamMemberRole) => {
    setForm((prev) => ({ ...prev, primaryRole: role }));
  };

  const handleRoleToggle = (role: string) => {
    setForm((prev) => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleTeamToggle = (team: string) => {
    setForm((prev) => {
      const teams = prev.teams.includes(team)
        ? prev.teams.filter((t) => t !== team)
        : [...prev.teams, team];
      return { ...prev, teams };
    });
  };

  const handleCancel = () => {
    navigate("/team");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (form.password !== form.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // TODO: Integration with team add endpoint here
    // Make sure to save primaryRole to the 'role' column and roles to the 'roles' array column

    toast({
      title: "Team member added",
      description: `${form.name} has been added to the team.`,
    });
    setIsSubmitting(false);
    navigate("/team");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Basic information */}
        <BasicInfoSection form={form} onInputChange={handleInputChange} />

        {/* Right: Profile Image, Roles, Teams */}
        <div className="space-y-6">
          <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50">
            <h2 className="text-xl font-bold mb-4 text-white">Profile Image</h2>
            <ProfileImageUploader
              value={form.profileImage}
              onChange={handleProfileImageChange}
              name={form.name}
            />
          </div>
          
          {/* Primary Role Selection */}
          <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50">
            <h2 className="text-xl font-bold mb-4 text-white">Primary Role</h2>
            <div className="grid grid-cols-1 gap-3">
              {PRIMARY_ROLES.map((role) => (
                <label
                  key={role}
                  className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer transition-all ${
                    form.primaryRole === role
                      ? "bg-[#2a2a45] border-yellow-400/50"
                      : "bg-[#1e1e2e] border-[#23233a]"
                  }`}
                >
                  <input
                    type="radio"
                    name="primaryRole"
                    checked={form.primaryRole === role}
                    onChange={() => handlePrimaryRoleChange(role)}
                    className="accent-yellow-400 w-4 h-4"
                  />
                  <span className="text-white text-sm">{role}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Additional Roles */}
          <RolesSection
            roles={ADDITIONAL_ROLES}
            selected={form.roles}
            onChange={(role) => handleRoleToggle(role)}
          />
          
          <TeamsSection
            teams={TEAMS}
            selected={form.teams}
            onChange={(team) => handleTeamToggle(team)}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-8">
        <Button
          type="button"
          variant="outline"
          className="rounded-full px-6 py-2 text-white border border-[#35355f] bg-transparent hover:bg-[#24244a]"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="rounded-full px-8 py-2 text-black font-semibold bg-gradient-to-r from-yellow-400 to-yellow-300 shadow-lg hover:opacity-90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>Adding...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Add Team Member
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddTeamMemberForm;
