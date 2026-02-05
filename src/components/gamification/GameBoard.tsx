import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Trophy, Star, Crown, Medal } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/context/AuthContext';
import WordOfTheDayWidget from './WordOfTheDayWidget';

interface GameBoardProps {
  isAdmin: boolean;
}

const questTypeConfig = {
  daily: {
    label: 'Daily',
    badgeClass: 'bg-green-500/20 text-green-400 border-green-500/50',
    icon: Trophy,
  },
  weekly: {
    label: 'Weekly',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
    icon: Medal,
  },
  monthly: {
    label: 'Special Ops',
    badgeClass: 'bg-pink-500/20 text-pink-400 border-pink-500/50',
    icon: Crown,
  },
};

const GameBoard: React.FC<GameBoardProps> = ({ isAdmin }) => {
  const { user } = useAuth();
  const {
    ranks,
    myStats,
    leaderboard,
    activeAssignments,
    myCompletions,
    isLoading,
    getCurrentRank,
    getProgressCount,
  } = useGamification();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2" style={{ fontFamily: "'Pixellari', sans-serif" }}>Loading game board...</span>
      </div>
    );
  }

  const currentRank = myStats ? getCurrentRank(myStats.total_xp) : null;
  const nextRank = currentRank && ranks.length > 0
    ? ranks.find(r => r.sort_order === (currentRank?.sort_order || 0) + 1)
    : null;
  
  const xpToNextRank = nextRank && currentRank
    ? nextRank.min_xp - (myStats?.total_xp || 0)
    : 0;
  
  const xpProgress = nextRank && currentRank
    ? ((myStats?.total_xp || 0) - currentRank.min_xp) / (nextRank.min_xp - currentRank.min_xp) * 100
    : 100;

  const myPosition = leaderboard.findIndex(s => s.chatter_id === user?.id) + 1;

  // Categorize active quests
  const dailyQuests = activeAssignments.filter(a => a.quest?.quest_type === 'daily');
  const weeklyQuests = activeAssignments.filter(a => a.quest?.quest_type === 'weekly');
  const monthlyQuests = activeAssignments.filter(a => a.quest?.quest_type === 'monthly');

  const getCompletionStatus = (assignmentId: string) => {
    return myCompletions.find(c => c.quest_assignment_id === assignmentId);
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Pixellari', sans-serif" }}>
      {/* Header */}
      <div>
        <h1 
          className="text-4xl font-bold text-foreground uppercase tracking-wide"
          style={{ fontFamily: "'Pixellari', sans-serif" }}
        >
          Game Board
        </h1>
        <p className="text-muted-foreground text-base mt-1">
          Welcome back, Chatter. Status report follows.
        </p>
      </div>

      {/* Stats Grid - 4 Panels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rank Panel */}
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Current Rank</p>
            <p 
              className="text-xl font-bold uppercase"
              style={{ 
                fontFamily: "'Macs Minecraft', sans-serif",
                color: currentRank?.badge_color || '#808080'
              }}
            >
              {currentRank?.name || 'Unranked'}
            </p>
          </CardContent>
        </Card>

        {/* Leaderboard Position Panel */}
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Leaderboard</p>
            <p 
              className="text-3xl font-bold"
              style={{ 
                fontFamily: "'Macs Minecraft', sans-serif",
                color: currentRank?.badge_color || '#808080'
              }}
            >
              #{myPosition || '-'}
            </p>
          </CardContent>
        </Card>

        {/* Banana Count Panel */}
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Bananas</p>
            <p className="text-3xl font-bold text-yellow-500 flex items-center justify-center gap-2">
              <span>🍌</span>
              <span style={{ fontFamily: "'Macs Minecraft', sans-serif" }}>{myStats?.banana_balance || 0}</span>
            </p>
          </CardContent>
        </Card>

        {/* XP Count Panel */}
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total XP</p>
            <p 
              className="text-3xl font-bold text-primary"
              style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
            >
              {myStats?.total_xp || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Rank */}
      {nextRank && (
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Progress to {nextRank.name}</span>
              <span className="text-sm text-muted-foreground">{xpToNextRank} XP to go</span>
            </div>
            <Progress value={xpProgress} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* Word of the Day */}
      <WordOfTheDayWidget />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Directives - Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-7 bg-primary rounded-full" />
            <h2 
              className="text-2xl font-bold uppercase tracking-wide"
              style={{ fontFamily: "'Pixellari', sans-serif" }}
            >
              Active Directives
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...weeklyQuests, ...monthlyQuests, ...dailyQuests].map(assignment => {
              const completion = getCompletionStatus(assignment.id);
              const questType = assignment.quest?.quest_type || 'daily';
              const config = questTypeConfig[questType];
              const IconComponent = config.icon;
              const isCompleted = completion?.status === 'verified';
              const isPending = completion?.status === 'pending';
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
                  className={`bg-card/80 border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 ${isCompleted ? 'opacity-60' : ''}`}
                >
                  <CardContent className="p-4">
                    {/* Type Badge & Rewards */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs uppercase tracking-wider ${config.badgeClass}`}
                        style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
                      >
                        <IconComponent className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-sm font-bold text-primary"
                          style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
                        >
                          {assignment.quest?.xp_reward} XP
                        </span>
                        <span className="text-sm text-yellow-500">🍌{assignment.quest?.banana_reward}</span>
                      </div>
                    </div>

                    {/* Game Name */}
                    <h3 
                      className="text-lg font-bold uppercase text-foreground leading-tight mb-3"
                      style={{ fontFamily: "'Pixellari', sans-serif" }}
                    >
                      {assignment.quest?.game_name || assignment.quest?.title}
                    </h3>

                    {/* Progress with target from DB */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-muted-foreground uppercase">
                        <span>Progress</span>
                        <span className="flex items-center gap-2">
                          {currentProgress} / {progressTarget}
                          {isCompleted && <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0">✓</Badge>}
                          {isPending && <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-500 text-[10px] px-1.5 py-0">⏳</Badge>}
                        </span>
                      </div>
                      <Progress 
                        value={(currentProgress / progressTarget) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {activeAssignments.length === 0 && (
              <Card className="bg-card/80 border-border/50 col-span-2">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No active directives at this time.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Leaderboard - Right Column (Full) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-7 bg-primary rounded-full" />
            <h2 
              className="text-2xl font-bold uppercase tracking-wide"
              style={{ fontFamily: "'Pixellari', sans-serif" }}
            >
              Leaderboard
            </h2>
          </div>

          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-4">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 pb-3 border-b border-border/50 text-sm text-muted-foreground uppercase tracking-wider">
                <div className="col-span-2">Rank</div>
                <div className="col-span-7">Agent</div>
                <div className="col-span-3 text-right">XP</div>
              </div>

              {/* Full Leaderboard */}
              <div className="space-y-1 mt-3 max-h-96 overflow-y-auto">
                {leaderboard.map((stats, index) => {
                  const rank = getCurrentRank(stats.total_xp);
                  const isMe = stats.chatter_id === user?.id;
                  
                  return (
                    <div 
                      key={stats.id} 
                      className={`grid grid-cols-12 gap-2 items-center py-2 rounded px-1 ${isMe ? 'bg-primary/10 border border-primary/30' : ''}`}
                    >
                      <div className="col-span-2 flex items-center justify-center">
                        {index === 0 && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
                        {index === 1 && <span className="text-muted-foreground text-base font-bold">2</span>}
                        {index === 2 && <span className="text-muted-foreground text-base font-bold">3</span>}
                        {index > 2 && <span className="text-muted-foreground text-sm">{index + 1}</span>}
                      </div>
                      <div className="col-span-7 flex items-center gap-2 min-w-0">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage src={stats.profile?.profile_image} />
                          <AvatarFallback className="text-xs">
                            {stats.profile?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span 
                          className={`text-sm truncate ${isMe ? 'text-primary font-bold' : 'text-foreground'}`}
                        >
                          {isMe ? 'You' : stats.profile?.name || 'Unknown'}
                        </span>
                      </div>
                      <div
                        className="col-span-3 text-right text-sm font-bold"
                        style={{ 
                          fontFamily: "'Macs Minecraft', sans-serif",
                          color: rank?.badge_color || '#808080'
                        }}
                      >
                        {stats.total_xp}
                      </div>
                    </div>
                  );
                })}

                {leaderboard.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No agents on the leaderboard yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default GameBoard;
