
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Category } from '@/types/fileTypes';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  label?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  label = "Category:"
}) => {
  if (categories.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="text-sm text-muted-foreground italic">
          No categories available. Please create a category first.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select
        value={selectedCategoryId || ""}
        onValueChange={(value) => onCategoryChange(value || null)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
