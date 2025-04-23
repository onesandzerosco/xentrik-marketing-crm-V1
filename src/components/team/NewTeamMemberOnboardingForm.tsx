
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, UserPlus, Mail, Lock, Phone, MessageSquare, Briefcase, Shield, Building } from "lucide-react";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { TeamMemberRole, EmployeeTeam } from "@/types/employee";

// Define the specific roles we want to use in this form
const formRoles = ["Chatters", "Creative Director", "Manager", "Developer", "Editor"] as const;
type FormRole = typeof formRoles[number];

// Define teams that match the EmployeeTeam type
const teams = [
  { label: "Team A", value: "A" as EmployeeTeam },
  { label: "Team B", value: "B" as EmployeeTeam },
  { label: "Team C", value: "C" as EmployeeTeam }
];

const schema = z.object({
  name: z.string().min(2, { message: "Full Name is required" }),
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
  telegram: z.string().optional(),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
  roles: z.array(z.enum(formRoles)).min(1, { message: "Select at least one role" }),
  teams: z.array(z.enum(["A", "B", "C"])).min(1, { message: "Select at least one team" }),
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  telegram: "",
  phoneNumber: "",
  department: "",
  roles: [],
  teams: [],
};

interface Props {
  onSubmit?: (values: FormValues) => void;
  isSubmitting?: boolean;
}

const NewTeamMemberOnboardingForm: React.FC<Props> = ({
  onSubmit,
  isSubmitting = false,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // For preview, just intercept submit if no onSubmit provided
  const handleFormSubmit = form.handleSubmit((values) => {
    if (onSubmit) {
      onSubmit(values);
    } else {
      // Demo feedback
      alert("Submitted! " + JSON.stringify(values, null, 2));
    }
  });

  return (
    <Form {...form}>
      <form
        onSubmit={handleFormSubmit}
        className="space-y-8 max-w-2xl mx-auto"
        autoComplete="off"
      >
        <h1 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-white">
          <UserPlus className="w-7 h-7" /> Add New Team Member
        </h1>
        <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-white font-medium" htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Controller
                name="name"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="name"
                    placeholder="John Doe"
                    className={cn("bg-[#23233a] text-white border-none placeholder:text-neutral-400 mt-1", form.formState.errors.name && "border-red-500")}
                  />
                )}
              />
              {form.formState.errors.name && (
                <span className="text-xs text-red-500">{form.formState.errors.name.message}</span>
              )}
            </div>
            <div>
              <label className="text-white font-medium" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <Controller
                name="email"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    className={cn("bg-[#23233a] text-white border-none placeholder:text-neutral-400 mt-1", form.formState.errors.email && "border-red-500")}
                  />
                )}
              />
              {form.formState.errors.email && (
                <span className="text-xs text-red-500">{form.formState.errors.email.message}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-white font-medium" htmlFor="password">
                Password <span className="text-red-500">*</span>
              </label>
              <Controller
                name="password"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder="Password"
                    className={cn("bg-[#23233a] text-white border-none placeholder:text-neutral-400 mt-1", form.formState.errors.password && "border-red-500")}
                  />
                )}
              />
              {form.formState.errors.password && (
                <span className="text-xs text-red-500">{form.formState.errors.password.message}</span>
              )}
            </div>
            <div>
              <label className="text-white font-medium" htmlFor="confirmPassword">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="confirmPassword"
                    type="password"
                    placeholder="Retype password"
                    className={cn("bg-[#23233a] text-white border-none placeholder:text-neutral-400 mt-1", form.formState.errors.confirmPassword && "border-red-500")}
                  />
                )}
              />
              {form.formState.errors.confirmPassword && (
                <span className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</span>
              )}
            </div>
          </div>
          {/* Contact + Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-white font-medium" htmlFor="telegram">
                Telegram
              </label>
              <Controller
                name="telegram"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="telegram"
                    placeholder="username"
                    className="bg-[#23233a] text-white border-none placeholder:text-neutral-400 mt-1"
                  />
                )}
              />
            </div>
            <div>
              <label className="text-white font-medium" htmlFor="phoneNumber">
                Phone Number
              </label>
              <Controller
                name="phoneNumber"
                control={form.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="phoneNumber"
                    placeholder="+1234567890"
                    className="bg-[#23233a] text-white border-none placeholder:text-neutral-400 mt-1"
                  />
                )}
              />
            </div>
          </div>
          <div>
            <label className="text-white font-medium" htmlFor="department">
              Department
            </label>
            <Controller
              name="department"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="department"
                  placeholder="Marketing"
                  className="bg-[#23233a] text-white border-none placeholder:text-neutral-400 mt-1"
                />
              )}
            />
          </div>
        </div>
        {/* Role selection */}
        <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50 space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white"><Shield className="w-5 h-5" /> Roles <span className="text-red-500">*</span></h2>
          <div className="flex flex-wrap gap-3">
            {formRoles.map(role => (
              <Controller
                key={role}
                name="roles"
                control={form.control}
                render={({ field }) => {
                  const isChecked = field.value.includes(role);
                  return (
                    <button
                      type="button"
                      className={cn(
                        "px-4 py-2 rounded-full border font-medium transition-all",
                        isChecked
                          ? "bg-gradient-premium-yellow text-black border-yellow-400 shadow-premium-yellow"
                          : "bg-[#262651] text-white border-[#252538]/50 hover:bg-[#2a2a60]"
                      )}
                      aria-pressed={isChecked}
                      onClick={() =>
                        isChecked
                          ? field.onChange(field.value.filter((r) => r !== role))
                          : field.onChange([...field.value, role])
                      }
                    >
                      {role}
                    </button>
                  );
                }}
              />
            ))}
          </div>
          {form.formState.errors.roles && (
            <span className="text-xs text-red-500">{form.formState.errors.roles.message}</span>
          )}
        </div>
        {/* Teams selection */}
        <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50 space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2 text-white"><Building className="w-5 h-5" /> Teams <span className="text-red-500">*</span></h2>
          <div className="flex flex-wrap gap-3">
            {teams.map(team => (
              <Controller
                key={team.value}
                name="teams"
                control={form.control}
                render={({ field }) => {
                  const isChecked = field.value.includes(team.value);
                  return (
                    <button
                      type="button"
                      className={cn(
                        "px-4 py-2 rounded-full border font-medium transition-all",
                        isChecked
                          ? "bg-gradient-to-r from-[#1EAEDB] to-[#33C3F0] text-white border-blue-400 shadow"
                          : "bg-[#262651] text-white border-[#252538]/50 hover:bg-[#1eaedb] hover:text-black"
                      )}
                      aria-pressed={isChecked}
                      onClick={() =>
                        isChecked
                          ? field.onChange(field.value.filter((t) => t !== team.value))
                          : field.onChange([...field.value, team.value])
                      }
                    >
                      {team.label}
                    </button>
                  );
                }}
              />
            ))}
          </div>
          {form.formState.errors.teams && (
            <span className="text-xs text-red-500">{form.formState.errors.teams.message}</span>
          )}
        </div>
        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={isSubmitting || form.formState.isSubmitting}
            className="text-black rounded-[15px] px-4 py-2 bg-gradient-premium-yellow shadow-premium-yellow transition-all hover:opacity-90 hover:-translate-y-0.5"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting || form.formState.isSubmitting ? "Creating..." : "Save Team Member"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewTeamMemberOnboardingForm;
