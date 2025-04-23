
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OnboardingFormContainer from "@/components/creators/onboarding/OnboardingFormContainer";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import ProfileImageUploader from "@/components/team/ProfileImageUploader";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Gender = "Male" | "Female" | "Trans";
type Team = "A Team" | "B Team" | "C Team";
type Role = "Admin" | "Manager" | "Employee";

interface AddTeamMemberForm {
  name: string;
  email: string;
  gender: Gender;
  team: Team;
  role: Role;
  profileImage: string;
  telegram: string;
  whatsapp: string;
  department: string;
}

const defaultForm: AddTeamMemberForm = {
  name: "",
  email: "",
  gender: "Male",
  team: "A Team",
  role: "Employee",
  profileImage: "",
  telegram: "",
  whatsapp: "",
  department: "",
};

const AddTeamMember: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<AddTeamMemberForm>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileImageChange = (val: string) => {
    setForm({ ...form, profileImage: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // TODO: Integrate actual submit logic (e.g. Supabase)
      toast({
        title: "Team member added!",
        description: `${form.name} has been added to the team.`,
      });
      navigate("/team");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add team member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141428] p-6">
      <OnboardingFormContainer>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <BackButton to="/team" />
            <h1 className="text-2xl font-bold text-white">Onboard New Team Member</h1>
          </div>
          <Button 
            onClick={handleSubmit as any}
            disabled={isSubmitting}
            variant="premium"
            className="rounded-[15px] px-4 py-2 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Team Member"}
          </Button>
        </div>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info & Profile image side-by-side */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Basic Info */}
            <div className="flex-1 bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50">
              <h2 className="text-xl font-bold mb-4 text-white">Basic Information</h2>
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-white mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                    placeholder="Enter team member name"
                    required
                  />
                </div>
                {/* Email */}
                <div>
                  <label className="block text-white mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                    placeholder="name@example.com"
                    required
                  />
                </div>
                {/* Gender */}
                <div>
                  <label className="block text-white mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Trans">Trans</option>
                  </select>
                </div>
                {/* Team */}
                <div>
                  <label className="block text-white mb-1">
                    Team <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="team"
                    value={form.team}
                    onChange={handleChange}
                    className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                  >
                    <option value="A Team">A Team</option>
                    <option value="B Team">B Team</option>
                    <option value="C Team">C Team</option>
                  </select>
                </div>
                {/* Role */}
                <div>
                  <label className="block text-white mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                {/* Department */}
                <div>
                  <label className="block text-white mb-1">Department</label>
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                    placeholder="e.g. Marketing, Sales"
                  />
                </div>
              </div>
            </div>
            {/* Profile Image */}
            <div className="flex flex-col items-center justify-center min-w-[280px] bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50">
              <ProfileImageUploader
                value={form.profileImage}
                onChange={handleProfileImageChange}
                name={form.name}
              />
            </div>
          </div>
          {/* Contact Information */}
          <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50 mb-6">
            <h2 className="text-xl font-bold mb-4 text-white">Contact Information</h2>
            <div className="space-y-4">
              {/* Telegram */}
              <div>
                <label className="block text-white mb-1">
                  Telegram Username
                </label>
                <input
                  name="telegram"
                  value={form.telegram}
                  onChange={handleChange}
                  className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                  placeholder="@username"
                />
              </div>
              {/* WhatsApp */}
              <div>
                <label className="block text-white mb-1">
                  WhatsApp Number
                </label>
                <input
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                  placeholder="+123456789"
                />
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-black rounded-[15px] px-4 py-2 bg-gradient-premium-yellow shadow-premium-yellow transition-all hover:opacity-90 hover:-translate-y-0.5"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creating..." : "Save Team Member"}
            </Button>
          </div>
        </form>
      </OnboardingFormContainer>
    </div>
  );
};

export default AddTeamMember;
