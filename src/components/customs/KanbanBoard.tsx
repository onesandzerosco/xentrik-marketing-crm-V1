
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PremiumCard } from '@/components/ui/premium-card';
import { Badge } from '@/components/ui/badge';
import CustomCard from './CustomCard';
import CustomDetailsModal from './CustomDetailsModal';
import DoneModal from './DoneModal';
import { Custom } from '@/types/custom';

interface KanbanBoardProps {
  customs: Custom[];
  onUpdateStatus: (data: { customId: string; newStatus: string; chatterName?: string }) => void;
  onUpdateDownpayment?: (customId: string, newDownpayment: number) => void;
  onDeleteCustom?: (customId: string) => void;
  isUpdating?: boolean;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  customs, 
  onUpdateStatus, 
  onUpdateDownpayment,
  onDeleteCustom,
  isUpdating 
}) => {
  const [selectedCustom, setSelectedCustom] = useState<Custom | null>(null);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [customToComplete, setCustomToComplete] = useState<Custom | null>(null);

  const statusGroups = [
    { status: 'new', label: 'New' },
    { status: 'partially_paid', label: 'Partially Paid' },
    { status: 'fully_paid', label: 'Fully Paid' },
    { status: 'in_progress', label: 'In Progress' },
    { status: 'qa', label: 'QA' },
    { status: 'done', label: 'Done' },
    { status: 'refunded', label: 'Refunded' },
  ];

  const getCustomsByStatus = (status: string) => {
    return customs.filter(custom => custom.status === status);
  };

  const statusCounts = statusGroups.map(group => ({
    status: group.status,
    count: getCustomsByStatus(group.status).length,
  }));

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      // Update the status of the custom
      onUpdateStatus({ customId: draggableId, newStatus: destination.droppableId });
    }
  };

  const handleCompleteCustom = (custom: Custom) => {
    setCustomToComplete(custom);
    setShowDoneModal(true);
  };

  const handleCloseDoneModal = () => {
    setShowDoneModal(false);
    setCustomToComplete(null);
  };

  return (
    <>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        {statusGroups.map(group => (
          <Droppable droppableId={group.status} key={group.status}>
            {(provided) => (
              <PremiumCard
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="w-full h-full overflow-x-auto flex-shrink-0"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4">
                    <h2 className="text-lg font-semibold text-white">{group.label}</h2>
                    <Badge variant="secondary">{statusCounts.find(item => item.status === group.status)?.count || 0}</Badge>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {getCustomsByStatus(group.status).map((custom, index) => (
                      <Draggable key={custom.id} draggableId={custom.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                          >
                            <CustomCard 
                              custom={custom} 
                              onDragStart={(e) => {}}
                              onClick={() => setSelectedCustom(custom)}
                              isDragging={false}
                              isUpdating={isUpdating || false}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              </PremiumCard>
            )}
          </Droppable>
        ))}
      </DragDropContext>

      {/* Custom Details Modal */}
      <CustomDetailsModal
        isOpen={!!selectedCustom}
        onClose={() => setSelectedCustom(null)}
        custom={selectedCustom}
        onUpdateStatus={onUpdateStatus}
        onUpdateDownpayment={onUpdateDownpayment}
        onDeleteCustom={onDeleteCustom}
        isUpdating={isUpdating}
      />

      {/* Done Modal */}
      <DoneModal
        isOpen={showDoneModal}
        onClose={handleCloseDoneModal}
        custom={customToComplete}
        onUpdateStatus={onUpdateStatus}
      />
    </>
  );
};

export default KanbanBoard;
