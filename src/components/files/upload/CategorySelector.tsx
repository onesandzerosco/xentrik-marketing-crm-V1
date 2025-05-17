
import React from 'react';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface CategoryOption {
  id: string;
  name: string;
}

interface CategorySelectorProps {
  categories: CategoryOption[];
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  categories, 
  control, 
  name,
  label,
  placeholder = "Select a category",
  required = false 
}) => {
  return (
    <FormField
      control={control}
      name={name}
      rules={{ required: required ? "Please select a category" : false }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{required && <span className="text-destructive ml-1">*</span>}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
