import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Trophy, Target, Banana, Star, Crown, Medal } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/context/AuthContext';

interface GameBoardProps {
  isAdmin: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ isAdmin }) => {
  const { user } = useAuth();
  const {
    ranks,
    myStats,
    leaderboard,
    activeAssignments,
    myCompletions,
    isLoading,
    getCurrentRank
  } = useGamification();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading game board...</span>
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

  // Get my position in leaderboard
  const myPosition = leaderboard.findIndex(s => s.chatter_id === user?.id) + 1;

  // Categorize active quests
  const dailyQuests = activeAssignments.filter(a => a.quest?.quest_type === 'daily');
  const weeklyQuests = activeAssignments.filter(a => a.quest?.quest_type === 'weekly');
  const monthlyQuests = activeAssignments.filter(a => a.quest?.quest_type === 'monthly');

  const getCompletionStatus = (assignmentId: string) => {
    return myCompletions.find(c => c.quest_assignment_id === assignmentId);
  };

  const renderQuestList = (quests: typeof activeAssignments, title: string, icon: React.ReactNode) => (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {quests.length === 0 ? (
          <p className="text-xs text-muted-foreground">No {title.toLowerCase()} available</p>
        ) : (
          quests.slice(0, 3).map(assignment => {
            const completion = getCompletionStatus(assignment.id);
            return (
              <div 
                key={assignment.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{assignment.quest?.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      +{assignment.quest?.xp_reward} XP
                    </span>
                    <span className="text-xs text-yellow-500">
                      +{assignment.quest?.banana_reward} 🍌
                    </span>
                  </div>
                </div>
                {completion ? (
                  <Badge 
                    variant={completion.status === 'verified' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {completion.status === 'verified' ? '✓' : completion.status === 'pending' ? '⏳' : '✗'}
                  </Badge>
                ) : null}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Rank Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: currentRank?.badge_color || '#808080' }}
              >
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold">{currentRank?.name || 'Unranked'}</p>
                <p className="text-xs text-muted-foreground">{myStats?.total_xp || 0} XP</p>
              </div>
            </div>
            {nextRank && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Next: {nextRank.name}</span>
                  <span>{xpToNextRank} XP to go</span>
                </div>
                <Progress value={xpProgress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Banana Balance Card */}
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Banana Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-2xl">🍌</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-500">{myStats?.banana_balance || 0}</p>
                <p className="text-xs text-muted-foreground">Available to spend</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Position */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-500">
                  #{myPosition || '-'}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {leaderboard.length} chatters
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Quests */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Quests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-500">{activeAssignments.length}</p>
                <p className="text-xs text-muted-foreground">
                  {myCompletions.filter(c => c.status === 'verified').length} completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quests Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Quests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderQuestList(dailyQuests, 'Daily Quests', <Star className="h-4 w-4 text-yellow-500" />)}
            {renderQuestList(weeklyQuests, 'Weekly Quests', <Medal className="h-4 w-4 text-blue-500" />)}
            {renderQuestList(monthlyQuests, 'Monthly Quests', <Crown className="h-4 w-4 text-purple-500" />)}
          </div>
        </div>

        {/* Leaderboard Column */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Chatters
          </h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              {leaderboard.slice(0, 10).map((stats, index) => {
                const rank = getCurrentRank(stats.total_xp);
                const isMe = stats.chatter_id === user?.id;
                return (
                  <div 
                    key={stats.id} 
                    className={`flex items-center gap-3 p-2 rounded-lg ${isMe ? 'bg-primary/10 border border-primary/20' : ''}`}
                  >
                    <div className="flex items-center justify-center w-6 h-6 text-sm font-bold">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && <span className="text-muted-foreground">{index + 1}</span>}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={stats.profile?.profile_image} />
                      <AvatarFallback className="text-xs">
                        {stats.profile?.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {stats.profile?.name || 'Unknown'}
                        {isMe && <span className="text-xs text-primary ml-1">(You)</span>}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ borderColor: rank?.badge_color, color: rank?.badge_color }}
                        >
                          {rank?.name || 'Unranked'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{stats.total_xp}</p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
