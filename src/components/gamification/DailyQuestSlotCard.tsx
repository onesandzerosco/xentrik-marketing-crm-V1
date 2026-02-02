import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Dices, Trophy, Check, Clock, X, Settings } from 'lucide-react';
import { DailyQuestSlot } from '@/hooks/useDailyQuestSlots';

interface DailyQuestSlotCardProps {
  slot: DailyQuestSlot;
  status: 'pending' | 'verified' | 'rejected' | null;
  isRerolling: boolean;
  onReroll: () => void;
  onViewQuest: () => void;
}

const DailyQuestSlotCard: React.FC<DailyQuestSlotCardProps> = ({
  slot,
  status,
  isRerolling,
  onReroll,
  onViewQuest,
}) => {
  const quest = slot.quest;
  const isVerified = status === 'verified';
  const isPending = status === 'pending';
  const isRejected = status === 'rejected';

  // Calculate progress (0 if not started, 100 if verified)
  const progressValue = isVerified ? 100 : isPending ? 50 : 0;

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden transition-all ${
        isVerified
          ? 'border-green-500/50 bg-green-500/5'
          : isPending
          ? 'border-yellow-500/50 bg-yellow-500/5'
          : isRejected
          ? 'border-red-500/50 bg-red-500/5'
          : 'border-border/50 bg-card/50 hover:border-primary/50'
      }`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <Badge 
          variant="outline" 
          className="bg-primary/20 text-primary border-primary/30 text-xs font-semibold tracking-wider uppercase"
        >
          Daily Quest
        </Badge>
        <div className="flex items-center gap-1.5 text-yellow-500">
          <Trophy className="h-4 w-4" />
          <span className="font-bold text-sm">{quest?.xp_reward || 0} XP</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Game Name - Primary Title */}
        <div>
          <h3 className="text-xl font-bold text-foreground uppercase tracking-wide">
            {quest?.game_name || quest?.title || 'Unknown Quest'}
          </h3>
          {quest?.game_name && quest.game_name !== quest.title && (
            <p className="text-sm text-muted-foreground italic mt-0.5">
              {quest.title}
            </p>
          )}
        </div>

        {/* Progress Tracking */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground uppercase tracking-wider font-medium">
              System Tracking
            </span>
            <span className="text-primary font-semibold">
              {isVerified ? '1 / 1' : isPending ? '0 / 1' : '0 / 1'} calls
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <Progress value={progressValue} className="h-2 bg-muted/30" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        {(isVerified || isPending || isRejected) && (
          <div className="flex items-center gap-2">
            {isVerified && (
              <Badge className="bg-green-500 text-white">
                <Check className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
            {isPending && (
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                <Clock className="h-3 w-3 mr-1" />
                Pending Review
              </Badge>
            )}
            {isRejected && (
              <Badge variant="destructive">
                <X className="h-3 w-3 mr-1" />
                Rejected
              </Badge>
            )}
          </div>
        )}

        {/* Banana Reward */}
        <div className="text-sm text-muted-foreground">
          🍌 +{quest?.banana_reward || 0} Bananas
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 pb-4 flex items-center gap-2">
        {!isVerified && (
          <Button
            onClick={onViewQuest}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            <Settings className="h-4 w-4 mr-2" />
            Log Activity
          </Button>
        )}

        {isVerified && (
          <Button
            disabled
            className="flex-1 bg-green-500/20 text-green-500 font-semibold"
          >
            <Check className="h-4 w-4 mr-2" />
            Completed
          </Button>
        )}

        {/* Re-roll Button */}
        {!isVerified && !isPending && !slot.has_rerolled && (
          <Button
            size="icon"
            variant="outline"
            onClick={onReroll}
            disabled={isRerolling}
            title="Re-roll this quest (once per day)"
            className="border-border/50 hover:border-primary hover:text-primary"
          >
            {isRerolling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Dices className="h-4 w-4" />
            )}
          </Button>
        )}

        {slot.has_rerolled && !isVerified && !isPending && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Re-rolled
          </Badge>
        )}
      </div>
    </div>
  );
};

export default DailyQuestSlotCard;
