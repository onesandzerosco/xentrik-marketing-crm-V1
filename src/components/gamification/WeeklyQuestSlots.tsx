import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Medal, Check, Clock, X, Eye } from 'lucide-react';
import { useGamification, QuestAssignment } from '@/hooks/useGamification';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import QuestCompletionModal from './QuestCompletionModal';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface WeeklyQuestSlotsProps {
  onQuestComplete?: () => void;
}

interface QuestCompletionStatus {
  assignmentId: string;
  status: 'pending' | 'verified' | 'rejected' | null;
}

const WeeklyQuestSlots: React.FC<WeeklyQuestSlotsProps> = ({ onQuestComplete }) => {
  const { user } = useAuth();
  const { activeAssignments, isLoading, refetch } = useGamification();
  const [selectedAssignment, setSelectedAssignment] = useState<QuestAssignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completionStatuses, setCompletionStatuses] = useState<QuestCompletionStatus[]>([]);

  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  // Filter to only weekly quests for this week
  const weeklyAssignments = activeAssignments.filter(
    a => a.quest?.quest_type === 'weekly' && 
         a.start_date <= weekEnd && 
         a.end_date >= weekStart
  );

  // Fetch completion statuses for weekly quests
  useEffect(() => {
    const fetchCompletionStatuses = async () => {
      if (!user || weeklyAssignments.length === 0) return;

      const assignmentIds = weeklyAssignments.map(a => a.id);

      const { data: completions } = await supabase
        .from('gamification_quest_completions')
        .select('quest_assignment_id, status')
        .eq('chatter_id', user.id)
        .in('quest_assignment_id', assignmentIds);

      const statuses: QuestCompletionStatus[] = assignmentIds.map(assignmentId => {
        const completion = completions?.find(c => c.quest_assignment_id === assignmentId);
        return { 
          assignmentId, 
          status: completion?.status as 'pending' | 'verified' | 'rejected' | null 
        };
      });

      setCompletionStatuses(statuses);
    };

    fetchCompletionStatuses();
  }, [user, weeklyAssignments.length, activeAssignments]);

  const getAssignmentStatus = (assignmentId: string) => {
    const statusEntry = completionStatuses.find(s => s.assignmentId === assignmentId);
    return statusEntry?.status || null;
  };

  const handleViewQuest = (assignment: QuestAssignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleSubmitComplete = async () => {
    refetch.myCompletions();
    onQuestComplete?.();
    
    // Re-fetch completion statuses
    if (user && weeklyAssignments.length > 0) {
      const assignmentIds = weeklyAssignments.map(a => a.id);
      const { data: completions } = await supabase
        .from('gamification_quest_completions')
        .select('quest_assignment_id, status')
        .eq('chatter_id', user.id)
        .in('quest_assignment_id', assignmentIds);

      const statuses: QuestCompletionStatus[] = assignmentIds.map(assignmentId => {
        const completion = completions?.find(c => c.quest_assignment_id === assignmentId);
        return { assignmentId, status: completion?.status as 'pending' | 'verified' | 'rejected' | null };
      });
      setCompletionStatuses(statuses);
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

  if (weeklyAssignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Medal className="h-5 w-5 text-blue-500" />
            Your Weekly Quests
          </CardTitle>
          <CardDescription>
            No weekly quests available. Check back when an admin adds weekly quests!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const completedCount = weeklyAssignments.filter(a => getAssignmentStatus(a.id) === 'verified').length;

  return (
    <>
      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Medal className="h-5 w-5 text-blue-500" />
                Your Weekly Quests
              </CardTitle>
              <CardDescription>
                {format(new Date(weekStart), 'MMM d')} - {format(new Date(weekEnd), 'MMM d')}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {completedCount}/{weeklyAssignments.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {weeklyAssignments.map((assignment) => {
            const quest = assignment.quest;
            if (!quest) return null;
            
            const status = getAssignmentStatus(assignment.id);
            const isVerified = status === 'verified';
            const isPending = status === 'pending';
            const isRejected = status === 'rejected';

            return (
              <div
                key={assignment.id}
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
                    <h4 className="font-medium truncate">{quest.title}</h4>
                    {quest.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{quest.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>+{quest.xp_reward} XP</span>
                      <span>🍌 +{quest.banana_reward}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
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
                          onClick={() => handleViewQuest(assignment)}
                        >
                          Retry
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleViewQuest(assignment)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Quest Completion Modal */}
      {selectedAssignment && (
        <QuestCompletionModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          assignment={selectedAssignment}
          onSubmitComplete={handleSubmitComplete}
        />
      )}
    </>
  );
};

export default WeeklyQuestSlots;
