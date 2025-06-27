
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
  onSubmit: (customData: CreateCustomData) => Promise<void>;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        ...formData,
        sale_date: new Date(formData.sale_date).toISOString(),
        due_date: new Date(formData.due_date).toISOString()
      });
      onClose();
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
    } catch (error) {
      // Error is handled in the parent component
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Custom</DialogTitle>
          <DialogDescription>
            Add a new custom order to track through the pipeline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model_name">Model Name</Label>
                <Input
                  id="model_name"
                  value={formData.model_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, model_name: e.target.value }))}
                  placeholder="Enter model name..."
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale_by">Sale By</Label>
                <Input
                  id="sale_by"
                  value={formData.sale_by}
                  onChange={(e) => setFormData(prev => ({ ...prev, sale_by: e.target.value }))}
                  placeholder="Chatter name..."
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fan_display_name">Fan Display Name</Label>
                <Input
                  id="fan_display_name"
                  value={formData.fan_display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, fan_display_name: e.target.value }))}
                  placeholder="Fan's display name..."
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fan_username">Fan Username</Label>
                <Input
                  id="fan_username"
                  value={formData.fan_username}
                  onChange={(e) => setFormData(prev => ({ ...prev, fan_username: e.target.value }))}
                  placeholder="@username"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Custom description..."
                required
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sale_date">Sale Date</Label>
                <Input
                  id="sale_date"
                  type="date"
                  value={formData.sale_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, sale_date: e.target.value }))}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="downpayment">Downpayment ($)</Label>
                <Input
                  id="downpayment"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.downpayment}
                  onChange={(e) => setFormData(prev => ({ ...prev, downpayment: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_price">Full Price ($)</Label>
                <Input
                  id="full_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.full_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
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
