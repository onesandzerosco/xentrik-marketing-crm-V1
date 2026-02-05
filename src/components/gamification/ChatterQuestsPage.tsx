import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    tabLabel: 'Daily',
  },
  weekly: {
    label: 'Weekly',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    icon: Medal,
    iconColor: 'text-purple-400',
    tabLabel: 'Weekly',
  },
  monthly: {
    label: 'Special Ops',
    badgeClass: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
    icon: Crown,
    iconColor: 'text-pink-400',
    tabLabel: 'Special Ops',
  },
};

const ChatterQuestsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    activeAssignments,
    myCompletions,
    isLoading,
    getProgressCount,
    refetch
  } = useGamification();

  const [selectedAssignment, setSelectedAssignment] = useState<QuestAssignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

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
    refetch.myProgress();
  };

  // Get quests for current tab
  const getQuestsForTab = (tab: string) => {
    switch (tab) {
      case 'daily': return dailyQuests;
      case 'weekly': return weeklyQuests;
      case 'monthly': return monthlyQuests;
      default: return [];
    }
  };

  // Count completions per tab
  const getTabStats = (quests: QuestAssignment[]) => {
    const completed = quests.filter(a => getCompletionStatus(a.id)?.status === 'verified').length;
    return { total: quests.length, completed };
  };

  const dailyStats = getTabStats(dailyQuests);
  const weeklyStats = getTabStats(weeklyQuests);
  const monthlyStats = getTabStats(monthlyQuests);

  const renderQuestCards = (quests: QuestAssignment[]) => {
    if (quests.length === 0) {
      return (
        <Card className="bg-card/80 border-border/50 col-span-full">
          <CardContent className="p-12 text-center">
            <Swords className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">No quests available in this category.</p>
            <p className="text-muted-foreground text-sm mt-1">Check back later for new missions!</p>
          </CardContent>
        </Card>
      );
    }

    return quests.map(assignment => {
      const completion = getCompletionStatus(assignment.id);
      const questType = assignment.quest?.quest_type || 'daily';
      const config = questTypeConfig[questType];
      const IconComponent = config.icon;
      const isCompleted = completion?.status === 'verified';
      const isPending = completion?.status === 'pending';
      const isRejected = completion?.status === 'rejected';
      const progressTarget = assignment.quest?.progress_target || 1;
      // Use real progress from database
      const currentProgress = isCompleted 
        ? progressTarget 
        : isPending 
          ? progressTarget
          : getProgressCount(assignment.id);
      
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
                style={{ fontFamily: "'Pixellari', sans-serif" }}
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
                <span>{currentProgress} / {progressTarget}</span>
              </div>
              <Progress 
                value={(currentProgress / progressTarget) * 100} 
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
                {assignment.shift && (
                  <Badge variant="outline" className="text-xs ml-2">
                    {assignment.shift}
                  </Badge>
                )}
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
    });
  };

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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'daily' | 'weekly' | 'monthly')} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/80 border border-border/50 h-auto p-1">
          <TabsTrigger 
            value="daily" 
            className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/50 flex items-center gap-2 py-3"
            style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
          >
            <Trophy className="h-4 w-4" />
            <span>Daily</span>
            <Badge variant="outline" className="ml-1 text-xs bg-background/50">
              {dailyStats.completed}/{dailyStats.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="weekly" 
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-purple-500/50 flex items-center gap-2 py-3"
            style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
          >
            <Medal className="h-4 w-4" />
            <span>Weekly</span>
            <Badge variant="outline" className="ml-1 text-xs bg-background/50">
              {weeklyStats.completed}/{weeklyStats.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="monthly" 
            className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 data-[state=active]:border-pink-500/50 flex items-center gap-2 py-3"
            style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
          >
            <Crown className="h-4 w-4" />
            <span>Special Ops</span>
            <Badge variant="outline" className="ml-1 text-xs bg-background/50">
              {monthlyStats.completed}/{monthlyStats.total}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-6">
          {/* Daily quests: max 4, display in 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderQuestCards(dailyQuests)}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          {/* Weekly quests: max 1, full width */}
          <div className="grid grid-cols-1 gap-4">
            {renderQuestCards(weeklyQuests)}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          {/* Monthly quests: max 1, full width */}
          <div className="grid grid-cols-1 gap-4">
            {renderQuestCards(monthlyQuests)}
          </div>
        </TabsContent>
      </Tabs>

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
