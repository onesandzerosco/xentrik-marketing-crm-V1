import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, Trophy, Medal, Crown, Star, Target, Swords } from 'lucide-react';
import { useGamification, QuestAssignment } from '@/hooks/useGamification';
import { useAuth } from '@/context/AuthContext';
import QuestDetailsModal from './QuestDetailsModal';

const questTypeConfig = {
  daily: {
    label: 'Daily',
    badgeClass: 'bg-green-500/20 text-green-400 border-green-500/50',
    icon: Trophy,
    iconColor: 'text-green-400',
  },
  weekly: {
    label: 'Weekly',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    icon: Medal,
    iconColor: 'text-purple-400',
  },
  monthly: {
    label: 'Special Ops',
    badgeClass: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
    icon: Crown,
    iconColor: 'text-pink-400',
  },
};

const ChatterQuestsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    activeAssignments,
    myCompletions,
    isLoading,
    refetch
  } = useGamification();

  const [selectedAssignment, setSelectedAssignment] = useState<QuestAssignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2" style={{ fontFamily: "'Pixellari', sans-serif" }}>Loading quests...</span>
      </div>
    );
  }

  // Categorize active quests
  const dailyQuests = activeAssignments.filter(a => a.quest?.quest_type === 'daily');
  const weeklyQuests = activeAssignments.filter(a => a.quest?.quest_type === 'weekly');
  const monthlyQuests = activeAssignments.filter(a => a.quest?.quest_type === 'monthly');

  const getCompletionStatus = (assignmentId: string) => {
    return myCompletions.find(c => c.quest_assignment_id === assignmentId);
  };

  const handleViewQuest = (assignment: QuestAssignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleQuestComplete = () => {
    refetch.myCompletions();
    refetch.activeAssignments();
  };

  // Combine quests with priority: weekly, monthly, daily
  const allQuests = [...weeklyQuests, ...monthlyQuests, ...dailyQuests];

  // Stats
  const completedCount = allQuests.filter(a => getCompletionStatus(a.id)?.status === 'verified').length;
  const pendingCount = allQuests.filter(a => getCompletionStatus(a.id)?.status === 'pending').length;
  const availableCount = allQuests.filter(a => !getCompletionStatus(a.id)).length;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Pixellari', sans-serif" }}>
      {/* Header */}
      <div>
        <h1 
          className="text-4xl font-bold text-foreground uppercase tracking-wide flex items-center gap-3"
          style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
        >
          <Swords className="h-9 w-9 text-primary" />
          Active Quests
        </h1>
        <p className="text-muted-foreground text-base mt-1">
          Complete missions to earn XP and Bananas. Click on a quest to begin.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-green-400 uppercase tracking-wider mb-1">Available</p>
            <span 
              className="text-3xl font-bold text-green-400"
              style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
            >
              {availableCount}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-yellow-400 uppercase tracking-wider mb-1">Pending</p>
            <span 
              className="text-3xl font-bold text-yellow-400"
              style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
            >
              {pendingCount}
            </span>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-primary uppercase tracking-wider mb-1">Completed</p>
            <span 
              className="text-3xl font-bold text-primary"
              style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
            >
              {completedCount}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Quest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allQuests.map(assignment => {
          const completion = getCompletionStatus(assignment.id);
          const questType = assignment.quest?.quest_type || 'daily';
          const config = questTypeConfig[questType];
          const IconComponent = config.icon;
          const isCompleted = completion?.status === 'verified';
          const isPending = completion?.status === 'pending';
          const isRejected = completion?.status === 'rejected';
          
          return (
            <Card 
              key={assignment.id} 
              className={`bg-card/80 border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 cursor-pointer ${isCompleted ? 'opacity-60' : ''}`}
              onClick={() => handleViewQuest(assignment)}
            >
              <CardContent className="p-5 space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <Badge 
                    variant="outline" 
                    className={`text-xs uppercase tracking-wider ${config.badgeClass}`}
                    style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
                  >
                    <IconComponent className={`h-3 w-3 mr-1 ${config.iconColor}`} />
                    {config.label}
                  </Badge>
                  {isCompleted && (
                    <Badge className="bg-green-500 text-white text-xs">✓ Done</Badge>
                  )}
                  {isPending && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 text-xs">⏳ Review</Badge>
                  )}
                  {isRejected && (
                    <Badge variant="destructive" className="text-xs">✗ Rejected</Badge>
                  )}
                </div>

                {/* Quest Title */}
                <div>
                  <h3 
                    className="text-xl font-bold uppercase text-foreground leading-tight"
                    style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
                  >
                    {assignment.quest?.game_name || assignment.quest?.title}
                  </h3>
                  {assignment.quest?.game_name && assignment.quest.game_name !== assignment.quest.title && (
                    <p className="text-sm text-muted-foreground italic mt-0.5">
                      {assignment.quest.title}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {assignment.quest?.description || 'Complete this quest to earn rewards.'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground uppercase">
                    <span>Progress</span>
                    <span>{isCompleted ? '1 / 1' : '0 / 1'}</span>
                  </div>
                  <Progress 
                    value={isCompleted ? 100 : isPending ? 50 : 0} 
                    className="h-2" 
                  />
                </div>

                {/* Rewards Row */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" />
                      <span 
                        className="text-sm font-bold text-primary"
                        style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
                      >
                        {assignment.quest?.xp_reward} XP
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-base">🍌</span>
                      <span 
                        className="text-sm font-bold text-yellow-500"
                        style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
                      >
                        {assignment.quest?.banana_reward}
                      </span>
                    </div>
                  </div>
                  
                  {!completion && (
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-8"
                      style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewQuest(assignment);
                      }}
                    >
                      <Target className="h-3 w-3 mr-1" />
                      Start Quest
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {allQuests.length === 0 && (
          <Card className="bg-card/80 border-border/50 col-span-full">
            <CardContent className="p-12 text-center">
              <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No active quests at this time.</p>
              <p className="text-muted-foreground text-sm mt-1">Check back later for new missions!</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quest Details Modal */}
      {selectedAssignment && (
        <QuestDetailsModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          assignment={selectedAssignment}
          completionStatus={getCompletionStatus(selectedAssignment.id)?.status || null}
          onSubmitComplete={handleQuestComplete}
        />
      )}
    </div>
  );
};

export default ChatterQuestsPage;
