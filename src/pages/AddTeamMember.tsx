
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProfileImageUploader from "@/components/team/ProfileImageUploader";
import { useToast } from "@/hooks/use-toast";

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
    <div className="min-h-screen bg-[#181828] flex items-center justify-center px-3 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl rounded-xl bg-[#222235] p-10 shadow-lg"
        autoComplete="off"
      >
        {/* Header */}
        <div className="flex flex-col gap-1 pb-6">
          <div className="flex justify-between items-start gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Add New Team Member
              </h2>
              <div className="text-neutral-400 text-sm mt-1">
                Create login credentials and assign teams and roles
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-white text-xl px-2 transition-colors"
              type="button"
              aria-label="Close"
              onClick={handleCancel}
            >
              ×
            </button>
          </div>
        </div>

        {/* 2 column section */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left - Basic Info */}
          <div className="flex-1 grid grid-cols-1 gap-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="name" className="text-base text-white mb-1">Full Name</Label>
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
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-base text-white mb-1">Email</Label>
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
            {/* Passwords grid */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="password" className="text-base text-white mb-1">Password</Label>
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
              <div className="flex-1">
                <Label htmlFor="confirmPassword" className="text-base text-white mb-1">Confirm Password</Label>
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
            {/* Telegram & Phone */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="telegram" className="text-base text-white mb-1">Telegram</Label>
                <Input
                  id="telegram"
                  name="telegram"
                  value={form.telegram}
                  onChange={handleInputChange}
                  placeholder="username"
                  className="bg-[#23233a] text-white border-none placeholder:text-neutral-400"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="phoneNumber" className="text-base text-white mb-1">Phone Number</Label>
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
            {/* Department */}
            <div>
              <Label htmlFor="department" className="text-base text-white mb-1">Department</Label>
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

          {/* Right - Image uploader, Roles, Teams */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Profile Image */}
            <div>
              <Label className="text-base text-white mb-1">Profile Image</Label>
              <div className="mt-2">
                <ProfileImageUploader
                  value={form.profileImage}
                  onChange={handleProfileImageChange}
                  name={form.name}
                />
              </div>
            </div>
            {/* Roles */}
            <div>
              <Label className="text-base text-white mb-2">Roles</Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-2 rounded-md border border-[#23233a] bg-[#1e1e2e] px-4 py-2 cursor-pointer hover:bg-[#262638] transition-all">
                    <input
                      type="checkbox"
                      checked={form.roles.includes(role)}
                      onChange={() => handleMultiSelect("roles", role)}
                      className="accent-yellow-400 w-4 h-4 border border-yellow-400"
                    />
                    <span className="text-white text-sm">{role}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Teams */}
            <div>
              <Label className="text-base text-white mb-2">Teams</Label>
              <div className="flex gap-3">
                {TEAMS.map((team) => (
                  <label key={team.value} className="flex items-center gap-2 rounded-md border border-[#23233a] bg-[#1e1e2e] px-6 py-2 cursor-pointer hover:bg-[#262638] transition-all">
                    <input
                      type="checkbox"
                      checked={form.teams.includes(team.value)}
                      onChange={() => handleMultiSelect("teams", team.value)}
                      className="accent-yellow-400 w-4 h-4 border border-yellow-400"
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
            className="rounded-full px-6 py-2 text-white border border-[#35355f] bg-transparent hover:bg-[#24244a] transition-all"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-full px-8 py-2 text-black font-semibold bg-gradient-to-r from-yellow-400 to-yellow-300 shadow-lg hover:opacity-90 transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Team Member"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTeamMember;
