
import React from "react";
import { TeamMemberRole } from "@/types/employee";

interface Props {
  roles: string[];
  selected: string[];
  onChange: (role: string) => void;
}

const RolesSection: React.FC<Props> = ({ roles, selected, onChange }) => (
  <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50">
    <h2 className="text-xl font-bold mb-4 text-white">Roles</h2>
    <div className="grid grid-cols-2 gap-3">
      {roles.map((role) => (
        <label
          key={role}
          className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer transition-all ${
            selected.includes(role)
              ? "bg-[#2a2a45] border-yellow-400/50"
              : "bg-[#1e1e2e] border-[#23233a]"
          }`}
        >
          <input
            type="checkbox"
            checked={selected.includes(role)}
            onChange={() => onChange(role)}
            className="accent-yellow-400 w-4 h-4"
          />
          <span className="text-white text-sm">{role}</span>
        </label>
      ))}
    </div>
  </div>
);

export default RolesSection;
