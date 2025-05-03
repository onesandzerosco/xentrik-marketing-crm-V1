
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

const ROLES = [
  "Chatters",
  "Creative Director",
  "Manager",
  "Developer",
  "Editor"
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
  roles: string[];
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

  const handleMultiSelect = (key: "roles" | "teams", value: string) => {
    setForm((prev) => {
      const arr = prev[key];
      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter((v) => v !== value) };
      }
      return { ...prev, [key]: [...arr, value] };
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
          <RolesSection
            roles={ROLES}
            selected={form.roles}
            onChange={(role) => handleMultiSelect("roles", role)}
          />
          <TeamsSection
            teams={TEAMS}
            selected={form.teams}
            onChange={(team) => handleMultiSelect("teams", team)}
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
