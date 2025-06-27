
import React, { useState } from 'react';
import { PremiumCard } from '@/components/ui/premium-card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import CustomCard from './CustomCard';
import CustomDetailsModal from './CustomDetailsModal';
import DoneModal from './DoneModal';
import { Custom } from '@/types/custom';

interface KanbanBoardProps {
  customs: Custom[];
  onUpdateStatus: (data: { customId: string; newStatus: string; chatterName?: string }) => void;
  isUpdating: boolean;
}

const COLUMNS = [
  { id: 'partially_paid', title: 'Partially Paid', color: 'bg-yellow-500/20 border-yellow-500/30' },
  { id: 'fully_paid', title: 'Fully Paid', color: 'bg-blue-500/20 border-blue-500/30' },
  { id: 'endorsed', title: 'Endorsed', color: 'bg-purple-500/20 border-purple-500/30' },
  { id: 'done', title: 'Done', color: 'bg-green-500/20 border-green-500/30' },
  { id: 'refunded', title: 'Refunded', color: 'bg-red-500/20 border-red-500/30' }
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ customs, onUpdateStatus, isUpdating }) => {
  const [doneModalOpen, setDoneModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCustom, setSelectedCustom] = useState<Custom | null>(null);
  const [draggedCustom, setDraggedCustom] = useState<Custom | null>(null);

  const handleDragStart = (e: React.DragEvent, custom: Custom) => {
    setDraggedCustom(custom);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!draggedCustom || draggedCustom.status === newStatus) {
      setDraggedCustom(null);
      return;
    }

    if (newStatus === 'done') {
      setSelectedCustom(draggedCustom);
      setDoneModalOpen(true);
    } else {
      onUpdateStatus({ customId: draggedCustom.id, newStatus });
    }
    
    setDraggedCustom(null);
  };

  const handleCardClick = (custom: Custom) => {
    setSelectedCustom(custom);
    setDetailsModalOpen(true);
  };

  const handleDoneConfirm = (chatterName: string) => {
    if (selectedCustom) {
      onUpdateStatus({ 
        customId: selectedCustom.id, 
        newStatus: 'done', 
        chatterName 
      });
    }
    setDoneModalOpen(false);
    setSelectedCustom(null);
  };

  const getCustomsByStatus = (status: string) => {
    return customs.filter(custom => custom.status === status);
  };

  return (
    <>
      <ScrollArea className="w-full">
        <div className="flex gap-4 h-full pb-4" style={{ display: 'flex', width: '100%' }}>
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col h-full" style={{ flex: '1 1 0%', minWidth: '380px' }}>
              <PremiumCard className={`flex-1 ${column.color}`}>
                <div className="p-2 border-b border-premium-border/20">
                  <h3 className="font-semibold text-white text-sm">{column.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {getCustomsByStatus(column.id).length} items
                  </span>
                </div>
                
                <div
                  className="flex-1 p-2 space-y-2 overflow-y-auto"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  {getCustomsByStatus(column.id).map((custom) => (
                    <div key={custom.id}>
                      <CustomCard
                        custom={custom}
                        onDragStart={handleDragStart}
                        onClick={handleCardClick}
                        isDragging={draggedCustom?.id === custom.id}
                        isUpdating={isUpdating}
                      />
                    </div>
                  ))}
                  
                  {getCustomsByStatus(column.id).length === 0 && (
                    <div className="text-center text-muted-foreground py-8 text-xs">
                      No customs in this stage
                    </div>
                  )}
                </div>
              </PremiumCard>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <CustomDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedCustom(null);
        }}
        custom={selectedCustom}
        onUpdateStatus={onUpdateStatus}
        isUpdating={isUpdating}
      />

      <DoneModal
        isOpen={doneModalOpen}
        onClose={() => {
          setDoneModalOpen(false);
          setSelectedCustom(null);
        }}
        onConfirm={handleDoneConfirm}
        custom={selectedCustom}
      />
    </>
  );
};

export default KanbanBoard;
