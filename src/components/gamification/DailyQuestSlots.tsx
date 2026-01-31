import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Dices, Star, Check, Clock, X, Eye } from 'lucide-react';
import { useDailyQuestSlots, DailyQuestSlot } from '@/hooks/useDailyQuestSlots';
import { useGamification } from '@/hooks/useGamification';
import DailyQuestCompletionModal from './DailyQuestCompletionModal';
import { format } from 'date-fns';

interface DailyQuestSlotsProps {
  onQuestComplete?: () => void;
}

const DailyQuestSlots: React.FC<DailyQuestSlotsProps> = ({ onQuestComplete }) => {
  const { slots, isLoading, isRerolling, rerollSlot, markSlotCompleted, refetch } = useDailyQuestSlots();
  const { refetch: gamificationRefetch } = useGamification();
  const [selectedSlot, setSelectedSlot] = useState<DailyQuestSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewQuest = (slot: DailyQuestSlot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleSubmitComplete = async () => {
    if (selectedSlot) {
      await markSlotCompleted(selectedSlot.slot_number);
      gamificationRefetch.myCompletions();
      refetch();
      onQuestComplete?.();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (slots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Your Daily Quests
          </CardTitle>
          <CardDescription>
            No daily quests available. Check back when an admin adds daily quests!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const completedCount = slots.filter(s => s.completed).length;

  return (
    <>
      <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Your Daily Quests
              </CardTitle>
              <CardDescription>
                Complete 3 quests daily • Re-roll once each
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {completedCount}/3
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {slots.map((slot) => {
            const quest = slot.quest;
            const isCompleted = slot.completed;
            // For now we use the slot's completed status
            // In future, this can be expanded to track pending/rejected states

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-lg border transition-all ${
                  isCompleted 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-card border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        Slot {slot.slot_number}
                      </span>
                      {slot.has_rerolled && (
                        <Badge variant="outline" className="text-xs">
                          Re-rolled
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium truncate">{quest?.title || 'Unknown Quest'}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>+{quest?.xp_reward || 0} XP</span>
                      <span>🍌 +{quest?.banana_reward || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status or Action Button */}
                    {isCompleted ? (
                      <Badge className="bg-green-500 text-white">
                        <Check className="h-3 w-3 mr-1" />
                        Done
                      </Badge>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleViewQuest(slot)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}

                    {/* Re-roll Button */}
                    {!isCompleted && !slot.has_rerolled && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => rerollSlot(slot.slot_number)}
                        disabled={isRerolling === slot.slot_number}
                        title="Re-roll this quest (once per day)"
                        className="text-muted-foreground hover:text-primary"
                      >
                        {isRerolling === slot.slot_number ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Dices className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <p className="text-xs text-muted-foreground text-center pt-2">
            🎲 Click the dice to re-roll a quest (once per quest, per day)
          </p>
        </CardContent>
      </Card>

      {/* Daily Quest Completion Modal */}
      {selectedSlot && (
        <DailyQuestCompletionModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          slot={selectedSlot}
          onSubmitComplete={handleSubmitComplete}
        />
      )}
    </>
  );
};

export default DailyQuestSlots;
