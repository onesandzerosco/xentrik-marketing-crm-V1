
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ProfileImageUploader from "./ProfileImageUploader";
import { Save } from "lucide-react";

const onboardingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  gender: z.enum(["Male", "Female", "Trans"]),
  team: z.enum(["A Team", "B Team", "C Team"]),
  role: z.string().min(1, "Role is required"),
  profileImage: z.string().optional(),
  telegram: z.string().optional(),
  whatsapp: z.string().optional(),
  department: z.string().optional(),
});

type OnboardingTeamMemberValues = z.infer<typeof onboardingSchema>;

interface OnboardingTeamMemberFormProps {
  onSubmit: (values: OnboardingTeamMemberValues) => void;
  isSubmitting: boolean;
}

const OnboardingTeamMemberForm: React.FC<OnboardingTeamMemberFormProps> = ({
  onSubmit,
  isSubmitting
}) => {
  const form = useForm<OnboardingTeamMemberValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      email: "",
      gender: "Male",
      team: "A Team",
      role: "",
      profileImage: "",
      telegram: "",
      whatsapp: "",
      department: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* Basic Info + Profile */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Basic Info */}
          <div className="flex-1 bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50">
            <h2 className="text-xl font-bold mb-4 text-white">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                      placeholder="Enter team member name"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-white mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                      placeholder="name@example.com"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-white mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Trans">Trans</option>
                    </select>
                  )}
                />
              </div>
              <div>
                <label className="block text-white mb-1">
                  Team <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={form.control}
                  name="team"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                    >
                      <option value="A Team">A Team</option>
                      <option value="B Team">B Team</option>
                      <option value="C Team">C Team</option>
                    </select>
                  )}
                />
              </div>
              <div>
                <label className="block text-white mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                      placeholder="Enter role"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-white mb-1">Department</label>
                <Controller
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                      placeholder="e.g. Marketing, Sales"
                    />
                  )}
                />
              </div>
            </div>
          </div>
          {/* Profile Image */}
          <div className="flex flex-col items-center justify-center min-w-[280px] bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50">
            <ProfileImageUploader
              value={form.watch("profileImage")}
              onChange={val => form.setValue("profileImage", val)}
              name={form.watch("name")}
            />
          </div>
        </div>
        {/* Contact Details */}
        <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50 mb-6">
          <h2 className="text-xl font-bold mb-4 text-white">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-1">Telegram Username</label>
              <Controller
                control={form.control}
                name="telegram"
                render={({ field }) => (
                  <input
                    {...field}
                    className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                    placeholder="@username"
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-white mb-1">WhatsApp Number</label>
              <Controller
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <input
                    {...field}
                    className="w-full bg-[#232347] rounded py-2 px-4 border border-[#373757] text-white"
                    placeholder="+123456789"
                  />
                )}
              />
            </div>
          </div>
        </div>
        {/* Save Button */}
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
    </Form>
  );
};

export default OnboardingTeamMemberForm;
