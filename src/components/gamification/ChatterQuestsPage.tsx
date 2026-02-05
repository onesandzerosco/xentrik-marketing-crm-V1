import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Trophy, Medal, Crown, Swords } from 'lucide-react';
import { useGamification, QuestAssignment } from '@/hooks/useGamification';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import QuestDetailsModal from './QuestDetailsModal';
import QuestSlotCard from './QuestSlotCard';
import { useDailyQuestSlots } from '@/hooks/useDailyQuestSlots';
import { useWeeklyQuestSlots } from '@/hooks/useWeeklyQuestSlots';
import { useMonthlyQuestSlots } from '@/hooks/useMonthlyQuestSlots';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

type QuestType = 'daily' | 'weekly' | 'monthly';

type CompletionStatus = 'pending' | 'verified' | 'rejected' | null;

interface SlotStatus {
  questId: string;
  status: CompletionStatus;
}

const ChatterQuestsPage: React.FC = () => {
  const { user } = useAuth();
  const { myCompletions, isLoading, refetch } = useGamification();

  // Per-user quest sources (support per-player re-roll without affecting others)
  const daily = useDailyQuestSlots();
  const weekly = useWeeklyQuestSlots();
  const monthly = useMonthlyQuestSlots();

  const [activeTab, setActiveTab] = useState<QuestType>('daily');
  const [selectedAssignment, setSelectedAssignment] = useState<QuestAssignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slotStatuses, setSlotStatuses] = useState<Record<string, CompletionStatus>>({});

  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const weekStart = useMemo(() => format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'), []);
  const weekEnd = useMemo(() => format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'), []);
  const monthStart = useMemo(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'), []);
  const monthEnd = useMemo(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'), []);

  const allSlots = useMemo(() => {
    return {
      daily: daily.slots,
      weekly: weekly.slots,
      monthly: monthly.slots,
    } as const;
  }, [daily.slots, weekly.slots, monthly.slots]);

  const activeSlots = allSlots[activeTab];

  // Fetch completion statuses for all currently shown slots
  const refreshSlotStatuses = async () => {
    if (!user) return;

    const questIds = [
      ...daily.slots.map(s => s.quest_id),
      ...weekly.slots.map(s => s.quest_id),
      ...monthly.slots.map(s => s.quest_id),
    ].filter(Boolean);

    if (questIds.length === 0) {
      setSlotStatuses({});
      return;
    }

    // Assignments that are active "today" (covers daily/weekly/monthly in one query)
    const { data: assignments, error: aErr } = await supabase
      .from('gamification_quest_assignments')
      .select('id, quest_id')
      .in('quest_id', questIds)
      .lte('start_date', today)
      .gte('end_date', today);

    if (aErr) {
      console.error('Error fetching quest assignments for status:', aErr);
      return;
    }

    if (!assignments || assignments.length === 0) {
      setSlotStatuses({});
      return;
    }

    const assignmentIds = assignments.map(a => a.id);

    const { data: completions, error: cErr } = await supabase
      .from('gamification_quest_completions')
      .select('quest_assignment_id, status')
      .eq('chatter_id', user.id)
      .in('quest_assignment_id', assignmentIds);

    if (cErr) {
      console.error('Error fetching completions for status:', cErr);
      return;
    }

    const statusMap: Record<string, CompletionStatus> = {};

    for (const qId of questIds) {
      const assignment = assignments.find(a => a.quest_id === qId);
      if (!assignment) {
        statusMap[qId] = null;
        continue;
      }
      const completion = completions?.find(c => c.quest_assignment_id === assignment.id);
      statusMap[qId] = (completion?.status as CompletionStatus) ?? null;
    }

    setSlotStatuses(statusMap);
  };

  useEffect(() => {
    refreshSlotStatuses();
  }, [user, today, daily.slots, weekly.slots, monthly.slots]);

  const getSlotStatus = (questId: string): CompletionStatus => {
    return slotStatuses[questId] ?? null;
  };

  const ensureAssignmentForQuest = async (questId: string, questType: QuestType) => {
    if (!user) return null;

    const period = (() => {
      if (questType === 'daily') return { start: today, end: today };
      if (questType === 'weekly') return { start: weekStart, end: weekEnd };
      return { start: monthStart, end: monthEnd };
    })();

    // Try exact match first (how admin assignments are stored)
    const { data: existing, error: eErr } = await supabase
      .from('gamification_quest_assignments')
      .select(`*, quest:gamification_quests (*)`)
      .eq('quest_id', questId)
      .eq('start_date', period.start)
      .eq('end_date', period.end)
      .maybeSingle();

    if (eErr) {
      console.error('Error looking up assignment:', eErr);
    }

    if (existing?.id) {
      return existing as any as QuestAssignment;
    }

    // Create a personal assignment so progress slots (quest_progress) can be tracked.
    // This remains isolated in the UI because activeAssignments are filtered to admin-created assignments.
    const { data: created, error: cErr } = await supabase
      .from('gamification_quest_assignments')
      .insert({
        quest_id: questId,
        start_date: period.start,
        end_date: period.end,
        assigned_by: user.id,
      })
      .select(`*, quest:gamification_quests (*)`)
      .single();

    if (cErr) {
      console.error('Error creating personal assignment:', cErr);
      return null;
    }

    return created as any as QuestAssignment;
  };

  const handleViewQuest = async (questId: string, questType: QuestType) => {
    const assignment = await ensureAssignmentForQuest(questId, questType);
    if (!assignment) return;

    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleQuestComplete = () => {
    refetch.myCompletions();
    refetch.activeAssignments();
    refetch.myProgress();

    // Also refresh slot status map
    daily.refetch();
    weekly.refetch();
    monthly.refetch();
    
    // Force refresh statuses after state updates
    setTimeout(() => refreshSlotStatuses(), 100);
  };

  const dailyStats = {
    total: daily.slots.length,
    completed: daily.slots.filter(s => getSlotStatus(s.quest_id) === 'verified').length,
  };

  const weeklyStats = {
    total: weekly.slots.length,
    completed: weekly.slots.filter(s => getSlotStatus(s.quest_id) === 'verified').length,
  };

  const monthlyStats = {
    total: monthly.slots.length,
    completed: monthly.slots.filter(s => getSlotStatus(s.quest_id) === 'verified').length,
  };

  if (isLoading || daily.isLoading || weekly.isLoading || monthly.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2" style={{ fontFamily: "'Pixellari', sans-serif" }}>Loading quests...</span>
      </div>
    );
  }

  const renderSlotCards = (questType: QuestType) => {
    const slots = allSlots[questType];

    if (slots.length === 0) {
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

    return slots.map((slot) => {
      const status = getSlotStatus(slot.quest_id);
      const isRerolling = questType === 'daily'
        ? daily.isRerolling === slot.slot_number
        : questType === 'weekly'
          ? weekly.isRerolling
          : monthly.isRerolling;

      const handleReroll = async () => {
        const rerollFn = questType === 'daily'
          ? () => daily.rerollSlot(slot.slot_number)
          : questType === 'weekly'
            ? () => weekly.rerollSlot()
            : () => monthly.rerollSlot();
        
        const success = await rerollFn();
        if (success) {
          // After successful re-roll, refresh slot statuses so Log Activity works correctly
          setTimeout(() => refreshSlotStatuses(), 100);
        }
      };

      return (
        <QuestSlotCard
          key={slot.id}
          quest={slot.quest}
          questType={questType}
          status={status}
          hasRerolled={slot.has_rerolled}
          isRerolling={isRerolling}
          onReroll={handleReroll}
          onViewQuest={() => handleViewQuest(slot.quest_id, questType)}
          isAdminView={false}
        />
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
          Complete missions to earn XP and Bananas.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as QuestType)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/80 border border-border/50 h-auto p-1">
          <TabsTrigger 
            value="daily" 
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/50 flex items-center gap-2 py-3"
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
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/50 flex items-center gap-2 py-3"
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
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/50 flex items-center gap-2 py-3"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderSlotCards('daily')}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <div className="grid grid-cols-1 gap-3">
            {renderSlotCards('weekly')}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <div className="grid grid-cols-1 gap-3">
            {renderSlotCards('monthly')}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quest Details Modal */}
      {selectedAssignment && (
        <QuestDetailsModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          assignment={selectedAssignment}
          completionStatus={myCompletions.find(c => c.quest_assignment_id === selectedAssignment.id)?.status || null}
          onSubmitComplete={handleQuestComplete}
        />
      )}
    </div>
  );
};

export default ChatterQuestsPage;
