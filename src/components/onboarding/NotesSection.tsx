
import React from "react";

interface NotesSectionProps {
  notes: string;
  setNotes: (notes: string) => void;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, setNotes }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-4">Additional Notes</h2>
      <textarea 
        className="w-full min-h-[100px] rounded-md border border-input bg-secondary/5 px-3 py-2 text-base"
        placeholder="Add any additional notes about this creator"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  );
};

export default NotesSection;
