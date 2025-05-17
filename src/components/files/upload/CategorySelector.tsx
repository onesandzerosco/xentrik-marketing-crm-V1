
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Category } from '@/types/fileTypes';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  label: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  categories, 
  selectedCategoryId, 
  onCategoryChange, 
  label 
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select
        value={selectedCategoryId || ""}
        onValueChange={(value) => onCategoryChange(value || null)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a category (optional)" />
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
