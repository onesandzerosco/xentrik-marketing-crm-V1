
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CreateCustomData } from '@/types/customs';

interface CreateCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomData) => Promise<void>;
  isLoading: boolean;
}

const CreateCustomModal: React.FC<CreateCustomModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState<CreateCustomData>({
    model_name: '',
    fan_display_name: '',
    fan_username: '',
    description: '',
    sale_date: new Date().toISOString().split('T')[0],
    due_date: '',
    downpayment: 0,
    full_price: 0,
    sale_by: ''
  });

  const handleInputChange = (field: keyof CreateCustomData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        model_name: '',
        fan_display_name: '',
        fan_username: '',
        description: '',
        sale_date: new Date().toISOString().split('T')[0],
        due_date: '',
        downpayment: 0,
        full_price: 0,
        sale_by: ''
      });
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Custom</DialogTitle>
          <DialogDescription>
            Add a new custom order to track its progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="model_name">Model Name</Label>
              <Input
                id="model_name"
                value={formData.model_name}
                onChange={(e) => handleInputChange('model_name', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="sale_by">Sale By</Label>
              <Input
                id="sale_by"
                value={formData.sale_by}
                onChange={(e) => handleInputChange('sale_by', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fan_display_name">Fan Display Name</Label>
              <Input
                id="fan_display_name"
                value={formData.fan_display_name}
                onChange={(e) => handleInputChange('fan_display_name', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="fan_username">Fan Username</Label>
              <Input
                id="fan_username"
                value={formData.fan_username}
                onChange={(e) => handleInputChange('fan_username', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sale_date">Sale Date</Label>
              <Input
                id="sale_date"
                type="date"
                value={formData.sale_date}
                onChange={(e) => handleInputChange('sale_date', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="downpayment">Downpayment ($)</Label>
              <Input
                id="downpayment"
                type="number"
                step="0.01"
                min="0"
                value={formData.downpayment}
                onChange={(e) => handleInputChange('downpayment', parseFloat(e.target.value) || 0)}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="full_price">Full Price ($)</Label>
              <Input
                id="full_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.full_price}
                onChange={(e) => handleInputChange('full_price', parseFloat(e.target.value) || 0)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Custom'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomModal;
