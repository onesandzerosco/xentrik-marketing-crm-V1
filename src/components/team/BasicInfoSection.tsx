
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  form: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    telegram: string;
    phoneNumber: string;
    department: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicInfoSection: React.FC<Props> = ({ form, onInputChange }) => (
  <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50">
    <h2 className="text-xl font-bold mb-6 text-white">Basic Information</h2>
    <div className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-white mb-1">Full Name</Label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={onInputChange}
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
          onChange={onInputChange}
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
            onChange={onInputChange}
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
            onChange={onInputChange}
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
            onChange={onInputChange}
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
            onChange={onInputChange}
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
          onChange={onInputChange}
          placeholder="Marketing"
          className="bg-[#23233a] text-white border-none placeholder:text-neutral-400"
        />
      </div>
    </div>
  </div>
);

export default BasicInfoSection;
