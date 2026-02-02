import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Crown } from 'lucide-react';
import { useGamification, QuestAssignment } from '@/hooks/useGamification';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import QuestCompletionModal from './QuestCompletionModal';
import QuestSlotCard from './QuestSlotCard';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface MonthlyQuestSlotsProps {
  onQuestComplete?: () => void;
}

interface QuestCompletionStatus {
  assignmentId: string;
  status: 'pending' | 'verified' | 'rejected' | null;
}

const MonthlyQuestSlots: React.FC<MonthlyQuestSlotsProps> = ({ onQuestComplete }) => {
  const { user } = useAuth();
  const { activeAssignments, isLoading, refetch } = useGamification();
  const [selectedAssignment, setSelectedAssignment] = useState<QuestAssignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completionStatuses, setCompletionStatuses] = useState<QuestCompletionStatus[]>([]);

  const today = new Date();
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');

  // Filter to only monthly quests for this month
  const monthlyAssignments = activeAssignments.filter(
    a => a.quest?.quest_type === 'monthly' && 
         a.start_date <= monthEnd && 
         a.end_date >= monthStart
  );

  // Fetch completion statuses for monthly quests
  useEffect(() => {
    const fetchCompletionStatuses = async () => {
      if (!user || monthlyAssignments.length === 0) return;

      const assignmentIds = monthlyAssignments.map(a => a.id);

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
  }, [user, monthlyAssignments.length, activeAssignments]);

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
    if (user && monthlyAssignments.length > 0) {
      const assignmentIds = monthlyAssignments.map(a => a.id);
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

  if (monthlyAssignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-500" />
            Special Ops
          </CardTitle>
          <CardDescription>
            No special ops available. Check back when an admin adds monthly quests!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const completedCount = monthlyAssignments.filter(a => getAssignmentStatus(a.id) === 'verified').length;

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
              <Crown className="h-5 w-5 text-purple-500" />
              Special Ops
            </h2>
            <p className="text-sm text-muted-foreground">
              {format(new Date(monthStart), 'MMMM yyyy')}
            </p>
          </div>
          <Badge 
            variant="outline" 
            className="text-base px-3 py-1 border-purple-500/30 font-bold"
            style={{ fontFamily: "'Macs Minecraft', sans-serif" }}
          >
            {completedCount}/{monthlyAssignments.length}
          </Badge>
        </div>

        {/* Quest Cards Grid - Tighter gap */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {monthlyAssignments.map((assignment) => {
            const quest = assignment.quest;
            if (!quest) return null;

            return (
              <QuestSlotCard
                key={assignment.id}
                quest={quest}
                questType="monthly"
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

export default MonthlyQuestSlots;
