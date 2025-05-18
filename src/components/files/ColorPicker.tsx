
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

// Array of tailwind-friendly pastel colors
const colorOptions = [
  { name: 'Pink', value: '#FFD1DC' },
  { name: 'Orange', value: '#FFB347' },
  { name: 'Yellow', value: '#FFDF80' },
  { name: 'Green', value: '#98FB98' },
  { name: 'Blue', value: '#87CEFA' },
  { name: 'Purple', value: '#D8BFD8' },
  { name: 'Coral', value: '#FFA07A' },
  { name: 'Powder Blue', value: '#B0E0E6' },
  { name: 'Mint', value: '#BDFCC9' },
  { name: 'Lavender', value: '#E6E6FA' },
  { name: 'Peach', value: '#FFDAB9' },
  { name: 'Sky Blue', value: '#ADD8E6' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 max-w-xs">
      {colorOptions.map((color) => (
        <button
          key={color.value}
          type="button"
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-transform",
            selectedColor === color.value && "ring-2 ring-offset-2 ring-slate-500"
          )}
          style={{ backgroundColor: color.value }}
          onClick={() => onColorSelect(color.value)}
          title={color.name}
        >
          {selectedColor === color.value && (
            <Check className="h-4 w-4 text-slate-800" />
          )}
        </button>
      ))}
    </div>
  );
};
