import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Dices, Star, Check, Clock, X, Eye } from 'lucide-react';
import { useDailyQuestSlots, DailyQuestSlot } from '@/hooks/useDailyQuestSlots';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DailyQuestCompletionModal from './DailyQuestCompletionModal';
import { format } from 'date-fns';

interface DailyQuestSlotsProps {
  onQuestComplete?: () => void;
}

interface SlotCompletionStatus {
  questId: string;
  status: 'pending' | 'verified' | 'rejected' | null;
}

const DailyQuestSlots: React.FC<DailyQuestSlotsProps> = ({ onQuestComplete }) => {
  const { user } = useAuth();
  const { slots, isLoading, isRerolling, rerollSlot, refetch } = useDailyQuestSlots();
  const { refetch: gamificationRefetch } = useGamification();
  const [selectedSlot, setSelectedSlot] = useState<DailyQuestSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completionStatuses, setCompletionStatuses] = useState<SlotCompletionStatus[]>([]);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch completion statuses for today's daily quests
  useEffect(() => {
    const fetchCompletionStatuses = async () => {
      if (!user || slots.length === 0) return;

      const questIds = slots.map(s => s.quest_id);
      
      // Get all quest assignments for today's daily quests
      const { data: assignments } = await supabase
        .from('gamification_quest_assignments')
        .select('id, quest_id')
        .in('quest_id', questIds)
        .lte('start_date', today)
        .gte('end_date', today);

      if (!assignments || assignments.length === 0) {
        setCompletionStatuses([]);
        return;
      }

      const assignmentIds = assignments.map(a => a.id);

      // Get completions for this user on these assignments
      const { data: completions } = await supabase
        .from('gamification_quest_completions')
        .select('quest_assignment_id, status')
        .eq('chatter_id', user.id)
        .in('quest_assignment_id', assignmentIds);

      // Map quest_id to status
      const statuses: SlotCompletionStatus[] = questIds.map(questId => {
        const assignment = assignments.find(a => a.quest_id === questId);
        if (!assignment) return { questId, status: null };
        
        const completion = completions?.find(c => c.quest_assignment_id === assignment.id);
        return { 
          questId, 
          status: completion?.status as 'pending' | 'verified' | 'rejected' | null 
        };
      });

      setCompletionStatuses(statuses);
    };

    fetchCompletionStatuses();
  }, [user, slots, today]);

  const getSlotStatus = (slot: DailyQuestSlot) => {
    const statusEntry = completionStatuses.find(s => s.questId === slot.quest_id);
    return statusEntry?.status || null;
  };

  const handleViewQuest = (slot: DailyQuestSlot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleSubmitComplete = async () => {
    gamificationRefetch.myCompletions();
    refetch();
    onQuestComplete?.();
    // Re-fetch completion statuses
    if (user && slots.length > 0) {
      const questIds = slots.map(s => s.quest_id);
      const { data: assignments } = await supabase
        .from('gamification_quest_assignments')
        .select('id, quest_id')
        .in('quest_id', questIds)
        .lte('start_date', today)
        .gte('end_date', today);

      if (assignments && assignments.length > 0) {
        const assignmentIds = assignments.map(a => a.id);
        const { data: completions } = await supabase
          .from('gamification_quest_completions')
          .select('quest_assignment_id, status')
          .eq('chatter_id', user.id)
          .in('quest_assignment_id', assignmentIds);

        const statuses: SlotCompletionStatus[] = questIds.map(questId => {
          const assignment = assignments.find(a => a.quest_id === questId);
          if (!assignment) return { questId, status: null };
          const completion = completions?.find(c => c.quest_assignment_id === assignment.id);
          return { questId, status: completion?.status as 'pending' | 'verified' | 'rejected' | null };
        });
        setCompletionStatuses(statuses);
      }
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

  const completedCount = slots.filter(s => getSlotStatus(s) === 'verified').length;

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
            const status = getSlotStatus(slot);
            const isVerified = status === 'verified';
            const isPending = status === 'pending';
            const isRejected = status === 'rejected';

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-lg border transition-all ${
                  isVerified 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : isPending
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : isRejected
                    ? 'bg-red-500/10 border-red-500/30'
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
                    {/* Status Badge or Action Button */}
                    {isVerified ? (
                      <Badge className="bg-green-500 text-white">
                        <Check className="h-3 w-3 mr-1" />
                        Done
                      </Badge>
                    ) : isPending ? (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    ) : isRejected ? (
                      <>
                        <Badge variant="destructive">
                          <X className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewQuest(slot)}
                        >
                          Retry
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleViewQuest(slot)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}

                    {/* Re-roll Button - only show if not verified/pending */}
                    {!isVerified && !isPending && !slot.has_rerolled && (
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
