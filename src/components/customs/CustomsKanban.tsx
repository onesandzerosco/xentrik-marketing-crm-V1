
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, X } from 'lucide-react';
import CustomCard from './CustomCard';
import StatusChangeModal from './StatusChangeModal';
import CreateCustomModal from './CreateCustomModal';
import { useCustomsTracker } from '@/hooks/useCustomsTracker';
import type { Custom, CustomStatus } from '@/types/customs';

const CustomsKanban: React.FC = () => {
  const {
    customs,
    loading,
    selectedModel,
    setSelectedModel,
    modelNames,
    createCustom,
    updateCustomStatus,
    isOverdue
  } = useCustomsTracker();

  const [draggedCustom, setDraggedCustom] = useState<Custom | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    customId: string;
    newStatus: CustomStatus;
    title: string;
    description: string;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const columns = [
    { id: 'partially_paid', title: 'Partially Paid', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'fully_paid', title: 'Fully Paid', color: 'bg-blue-100 border-blue-300' },
    { id: 'endorsed', title: 'Endorsed', color: 'bg-purple-100 border-purple-300' },
    { id: 'done', title: 'Done', color: 'bg-green-100 border-green-300' }
  ];

  const getCustomsByStatus = (status: CustomStatus) => {
    return customs.filter(custom => custom.status === status);
  };

  const handleDragStart = (e: React.DragEvent, custom: Custom) => {
    setDraggedCustom(custom);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: CustomStatus) => {
    e.preventDefault();
    
    if (!draggedCustom || draggedCustom.status === newStatus) {
      setDraggedCustom(null);
      return;
    }

    // For "endorsed" and "done" statuses, show modal for chatter name
    if (newStatus === 'endorsed' || newStatus === 'done') {
      setPendingStatusChange({
        customId: draggedCustom.id,
        newStatus,
        title: newStatus === 'endorsed' ? 'Mark as Endorsed' : 'Mark as Done',
        description: newStatus === 'endorsed' 
          ? 'Please enter the name of the chatter who endorsed this custom.'
          : 'Please enter the name of the chatter who sent this custom to the fan.'
      });
      setStatusModalOpen(true);
    } else {
      // For other statuses, update directly
      try {
        await updateCustomStatus(draggedCustom.id, newStatus);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
    
    setDraggedCustom(null);
  };

  const handleStatusChangeConfirm = async (chatterName: string) => {
    if (!pendingStatusChange) return;

    setIsUpdating(true);
    try {
      await updateCustomStatus(
        pendingStatusChange.customId, 
        pendingStatusChange.newStatus, 
        chatterName
      );
      setStatusModalOpen(false);
      setPendingStatusChange(null);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateCustom = async (customData: any) => {
    setIsCreating(true);
    try {
      await createCustom(customData);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseStatusModal = () => {
    setStatusModalOpen(false);
    setPendingStatusChange(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading customs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Customs Tracker</h1>
          <Badge variant="outline" className="text-sm">
            {customs.length} total customs
          </Badge>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Model filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Filter by model..."
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="pl-10 w-48"
            />
            {selectedModel && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSelectedModel('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {/* Create button */}
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Custom
          </Button>
        </div>
      </div>

      {/* Model filter chips */}
      {modelNames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Quick filters:</span>
          {modelNames.slice(0, 8).map(model => (
            <Badge
              key={model}
              variant={selectedModel === model ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setSelectedModel(selectedModel === model ? '' : model)}
            >
              {model}
            </Badge>
          ))}
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(column => {
          const columnCustoms = getCustomsByStatus(column.id as CustomStatus);
          
          return (
            <Card
              key={column.id}
              className={`${column.color} min-h-[500px]`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id as CustomStatus)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm font-medium">{column.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {columnCustoms.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {columnCustoms.map(custom => (
                  <CustomCard
                    key={custom.id}
                    custom={custom}
                    isOverdue={isOverdue(custom.due_date)}
                    onDragStart={handleDragStart}
                  />
                ))}
                {columnCustoms.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-8">
                    No customs in this status
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modals */}
      <StatusChangeModal
        isOpen={statusModalOpen}
        onClose={handleCloseStatusModal}
        onConfirm={handleStatusChangeConfirm}
        title={pendingStatusChange?.title || ''}
        description={pendingStatusChange?.description || ''}
        isLoading={isUpdating}
      />

      <CreateCustomModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateCustom}
        isLoading={isCreating}
      />
    </div>
  );
};

export default CustomsKanban;
