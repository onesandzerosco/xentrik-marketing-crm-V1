
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProfileImageUploader from "@/components/team/ProfileImageUploader";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/ui/back-button";
import { Save } from "lucide-react";

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

const AddTeamMember = () => {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileImageChange = (url: string) => {
    setForm({ ...form, profileImage: url });
  };

  const handleMultiSelect = (key: "roles" | "teams", value: string) => {
    setForm(prev => {
      const arr = prev[key];
      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter(v => v !== value) };
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

    // Demo validation, replace with your logic
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
    <div className="min-h-screen bg-[#181828] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-8">
          <BackButton to="/team" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Add New Team Member</h1>
            <p className="text-gray-400 text-sm mt-1">
              Create login credentials and assign teams and roles
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Main content in a 2-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Basic Information */}
            <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50">
              <h2 className="text-xl font-bold mb-6 text-white">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white mb-1">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="bg-[#23233a] text-white border-none placeholder:text-neutral-400"
                    autoFocus
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-white mb-1">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="john.doe@example.com"
                    className="bg-[#23233a] text-white border-none placeholder:text-neutral-400"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-white mb-1">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password" 
                      value={form.password}
                      onChange={handleInputChange}
                      placeholder="********"
                      className="bg-[#23233a] text-white border-none placeholder:text-neutral-400"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-white mb-1">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="********"
                      className="bg-[#23233a] text-white border-none placeholder:text-neutral-400"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telegram" className="text-white mb-1">Telegram</Label>
                    <Input
                      id="telegram"
                      name="telegram" 
                      value={form.telegram}
                      onChange={handleInputChange}
                      placeholder="username"
                      className="bg-[#23233a] text-white border-none placeholder:text-neutral-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="text-white mb-1">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      className="bg-[#23233a] text-white border-none placeholder:text-neutral-400"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="department" className="text-white mb-1">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    value={form.department}
                    onChange={handleInputChange}
                    placeholder="Marketing"
                    className="bg-[#23233a] text-white border-none placeholder:text-neutral-400"
                  />
                </div>
              </div>
            </div>
            
            {/* Right Column - Profile, Roles, Teams */}
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50">
                <h2 className="text-xl font-bold mb-4 text-white">Profile Image</h2>
                <ProfileImageUploader
                  value={form.profileImage}
                  onChange={handleProfileImageChange}
                  name={form.name}
                />
              </div>
              
              {/* Roles */}
              <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50">
                <h2 className="text-xl font-bold mb-4 text-white">Roles</h2>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((role) => (
                    <label 
                      key={role}
                      className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer transition-all ${
                        form.roles.includes(role) 
                          ? "bg-[#2a2a45] border-yellow-400/50" 
                          : "bg-[#1e1e2e] border-[#23233a]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.roles.includes(role)}
                        onChange={() => handleMultiSelect("roles", role)}
                        className="accent-yellow-400 w-4 h-4"
                      />
                      <span className="text-white text-sm">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Teams */}
              <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50">
                <h2 className="text-xl font-bold mb-4 text-white">Teams</h2>
                <div className="grid grid-cols-3 gap-3">
                  {TEAMS.map((team) => (
                    <label 
                      key={team.value}
                      className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer transition-all ${
                        form.teams.includes(team.value) 
                          ? "bg-[#2a2a45] border-yellow-400/50" 
                          : "bg-[#1e1e2e] border-[#23233a]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.teams.includes(team.value)}
                        onChange={() => handleMultiSelect("teams", team.value)}
                        className="accent-yellow-400 w-4 h-4"
                      />
                      <span className="text-white text-sm">{team.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
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
      </div>
    </div>
  );
};

export default AddTeamMember;
