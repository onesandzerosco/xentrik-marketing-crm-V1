
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  type: "gender" | "team" | "class" | "review";
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTags, onChange, type }) => {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const getTagClass = (tag: string, isSelected: boolean) => {
    if (!isSelected) {
      // Subtle background colors when not selected
      if (type === "gender") {
        return "bg-violet-500/10 hover:bg-violet-500/20 text-violet-200";
      } else if (type === "team") {
        return "bg-amber-500/10 hover:bg-amber-500/20 text-amber-200";
      } else if (type === "class") {
        return "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200";
      }
      return "";
    }
    
    // Stronger colors when selected
    if (type === "gender") {
      switch (tag.toLowerCase()) {
        case "male":
          return "!bg-violet-600 hover:!bg-violet-700 text-white";
        case "female":
          return "!bg-violet-600 hover:!bg-violet-700 text-white";
        case "trans":
          return "!bg-violet-600 hover:!bg-violet-700 text-white";
        default:
          return "";
      }
    } else if (type === "team") {
      switch (tag) {
        case "A Team":
          return "!bg-amber-600 hover:!bg-amber-700 text-white";
        case "B Team":
          return "!bg-amber-600 hover:!bg-amber-700 text-white";
        case "C Team":
          return "!bg-amber-600 hover:!bg-amber-700 text-white";
        default:
          return "";
      }
    } else if (type === "class") {
      switch (tag) {
        case "Real":
          return "!bg-emerald-600 hover:!bg-emerald-700 text-white";
        case "AI":
          return "!bg-emerald-600 hover:!bg-emerald-700 text-white";
        default:
          return "";
      }
    }
    
    return "";
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <Button
            key={tag}
            variant={isSelected ? "secondary" : "outline"}
            size="sm"
            onClick={() => toggleTag(tag)}
            className={cn(
              "rounded-full border-0",
              getTagClass(tag, isSelected)
            )}
          >
            {tag}
          </Button>
        );
      })}
    </div>
  );
};

export default TagFilter;
