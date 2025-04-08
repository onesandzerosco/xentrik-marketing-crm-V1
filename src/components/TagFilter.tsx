
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
    if (!isSelected) return "";
    
    if (type === "gender") {
      switch (tag.toLowerCase()) {
        case "male":
          return "!bg-blue-600 hover:!bg-blue-700";
        case "female":
          return "!bg-pink-600 hover:!bg-pink-700";
        case "trans":
          return "!bg-purple-600 hover:!bg-purple-700";
        case "ai":
          return "!bg-gray-600 hover:!bg-gray-700";
        default:
          return "";
      }
    } else if (type === "team") {
      switch (tag) {
        case "A Team":
          return "!bg-green-600 hover:!bg-green-700";
        case "B Team":
          return "!bg-yellow-600 hover:!bg-yellow-700";
        case "C Team":
          return "!bg-red-600 hover:!bg-red-700";
        default:
          return "";
      }
    } else if (type === "class") {
      switch (tag) {
        case "Real":
          return "!bg-indigo-600 hover:!bg-indigo-700";
        case "AI":
          return "!bg-gray-600 hover:!bg-gray-700";
        default:
          return "";
      }
    } else if (type === "review") {
      switch (tag) {
        case "Needs Review":
          return "!bg-orange-500 hover:!bg-orange-600";
        case "Reviewed":
          return "!bg-green-600 hover:!bg-green-700";
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
              "rounded-full",
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
