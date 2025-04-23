
import React from "react";

interface Props {
  teams: { label: string; value: string }[];
  selected: string[];
  onChange: (value: string) => void;
}

const TeamsSection: React.FC<Props> = ({ teams, selected, onChange }) => (
  <div className="bg-[#1a1a33]/50 p-6 rounded-xl border border-[#252538]/50">
    <h2 className="text-xl font-bold mb-4 text-white">Teams</h2>
    <div className="grid grid-cols-3 gap-3">
      {teams.map((team) => (
        <label
          key={team.value}
          className={`flex items-center gap-2 rounded-md border p-3 cursor-pointer transition-all ${
            selected.includes(team.value)
              ? "bg-[#2a2a45] border-yellow-400/50"
              : "bg-[#1e1e2e] border-[#23233a]"
          }`}
        >
          <input
            type="checkbox"
            checked={selected.includes(team.value)}
            onChange={() => onChange(team.value)}
            className="accent-yellow-400 w-4 h-4"
          />
          <span className="text-white text-sm">{team.label}</span>
        </label>
      ))}
    </div>
  </div>
);

export default TeamsSection;
