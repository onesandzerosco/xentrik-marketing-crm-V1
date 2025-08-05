import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditRowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelName: string;
  initialValues: Record<number, number>; // dayOfWeek -> earnings
  onSave: (modelName: string, values: Record<number, number>) => Promise<void>;
}

const DAYS_OF_WEEK = [
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
];

export const EditRowModal: React.FC<EditRowModalProps> = ({
  open,
  onOpenChange,
  modelName,
  initialValues,
  onSave
}) => {
  const [values, setValues] = useState<Record<number, string>>(() => {
    const stringValues: Record<number, string> = {};
    DAYS_OF_WEEK.forEach(day => {
      const value = initialValues[day.value] || 0;
      stringValues[day.value] = value === 0 ? '' : value.toString();
    });
    return stringValues;
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Reset values when modal opens with new data
  React.useEffect(() => {
    if (open) {
      const stringValues: Record<number, string> = {};
      DAYS_OF_WEEK.forEach(day => {
        const value = initialValues[day.value] || 0;
        stringValues[day.value] = value === 0 ? '' : value.toString();
      });
      setValues(stringValues);
    }
  }, [open, initialValues]);

  const handleInputChange = (dayOfWeek: number, value: string) => {
    // Allow empty, numbers, and decimal points
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setValues(prev => ({
        ...prev,
        [dayOfWeek]: value
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Convert string values to numbers
      const numericValues: Record<number, number> = {};
      Object.entries(values).forEach(([day, value]) => {
        const dayNum = parseInt(day);
        numericValues[dayNum] = value === '' ? 0 : parseFloat(value) || 0;
      });
      
      await onSave(modelName, numericValues);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving row:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalForRow = () => {
    return Object.values(values).reduce((sum, value) => {
      return sum + (value === '' ? 0 : parseFloat(value) || 0);
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit {modelName}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          {DAYS_OF_WEEK.map(day => (
            <div key={day.value} className="space-y-2">
              <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
              <Input
                id={`day-${day.value}`}
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                value={values[day.value] || ''}
                onChange={(e) => handleInputChange(day.value, e.target.value)}
                placeholder="0.00"
                className="text-center"
              />
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">${getTotalForRow().toFixed(2)}</span>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};