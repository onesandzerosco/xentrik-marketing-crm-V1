import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Medal } from 'lucide-react';
import { useGamification, QuestAssignment } from '@/hooks/useGamification';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import QuestCompletionModal from './QuestCompletionModal';
import QuestSlotCard from './QuestSlotCard';
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
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 
              className="text-xl font-bold flex items-center gap-2"
              style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
            >
              <Medal className="h-5 w-5 text-blue-500" />
              Your Weekly Quests
            </h2>
            <p className="text-sm text-muted-foreground">
              {format(new Date(weekStart), 'MMM d')} - {format(new Date(weekEnd), 'MMM d')}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className="text-base px-3 py-1 border-blue-500/30 font-bold"
            style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
          >
            {completedCount}/{weeklyAssignments.length}
          </Badge>
        </div>

        {/* Quest Cards - Full width for single weekly quest */}
        <div className="grid gap-3">
          {weeklyAssignments.map((assignment) => {
            const quest = assignment.quest;
            if (!quest) return null;

            return (
              <QuestSlotCard
                key={assignment.id}
                quest={quest}
                questType="weekly"
                status={getAssignmentStatus(assignment.id)}
                onViewQuest={() => handleViewQuest(assignment)}
              />
            );
          })}
        </div>
      </div>

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
