import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Quest } from '@/hooks/useGamification';
import { format } from 'date-fns';

export interface DailyQuestSlot {
  id: string;
  chatter_id: string;
  slot_number: number;
  quest_id: string;
  date: string;
  has_rerolled: boolean;
  completed: boolean;
  created_at: string;
  updated_at: string;
  quest?: Quest;
}

export const useDailyQuestSlots = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [slots, setSlots] = useState<DailyQuestSlot[]>([]);
  const [allDailyQuests, setAllDailyQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRerolling, setIsRerolling] = useState<number | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch ALL active daily quests (for re-roll pool)
  const fetchAllDailyQuests = useCallback(async () => {
    const { data, error } = await supabase
      .from('gamification_quests')
      .select('*')
      .eq('quest_type', 'daily')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching all daily quests:', error);
      return [];
    }
    
    setAllDailyQuests((data as Quest[]) || []);
    return (data as Quest[]) || [];
  }, []);

  // Fetch user's daily quest slots
  const fetchSlots = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('gamification_daily_quest_slots')
      .select(`
        *,
        quest:gamification_quests (*)
      `)
      .eq('chatter_id', user.id)
      .eq('date', today)
      .order('slot_number');

    if (error) {
      console.error('Error fetching daily quest slots:', error);
      return;
    }

    setSlots((data as any) || []);
  }, [user, today]);

  // Fetch today's admin-assigned quests and populate user slots
  const populateSlotsFromAdminAssignments = useCallback(async () => {
    if (!user) return;

    // Check if user already has slots for today
    const { data: existingSlots } = await supabase
      .from('gamification_daily_quest_slots')
      .select('slot_number')
      .eq('chatter_id', user.id)
      .eq('date', today);

    // If user already has 3 slots for today, no need to populate
    if (existingSlots && existingSlots.length >= 3) {
      return;
    }

    const filledSlots = new Set((existingSlots || []).map(s => s.slot_number));

    // Fetch today's ADMIN-assigned daily quests (assigned_by is null)
    // Personal assignments (assigned_by = user.id) are NOT included to prevent re-rolls from propagating
    const { data: todayAssignments, error: assignmentError } = await supabase
      .from('gamification_quest_assignments')
      .select(`
        quest_id,
        quest:gamification_quests (*)
      `)
      .eq('start_date', today)
      .eq('end_date', today)
      .is('assigned_by', null)
      .order('created_at');

    if (assignmentError) {
      console.error('Error fetching admin assignments:', assignmentError);
      return;
    }

    // Filter to only daily quests
    const dailyAssignments = (todayAssignments || []).filter(
      (a: any) => a.quest?.quest_type === 'daily'
    );

    if (dailyAssignments.length === 0) {
      return; // No admin-assigned quests for today
    }

    // Assign admin quests to empty slots (up to 3)
    const inserts: any[] = [];
    let slotNumber = 1;

    for (const assignment of dailyAssignments) {
      // Find the next empty slot
      while (filledSlots.has(slotNumber) && slotNumber <= 3) {
        slotNumber++;
      }
      
      if (slotNumber > 3) break; // All slots filled

      inserts.push({
        chatter_id: user.id,
        slot_number: slotNumber,
        quest_id: assignment.quest_id,
        date: today,
        has_rerolled: false,
        completed: false
      });

      filledSlots.add(slotNumber);
      slotNumber++;
    }

    if (inserts.length > 0) {
      const { error } = await supabase
        .from('gamification_daily_quest_slots')
        .insert(inserts);

      if (error) {
        console.error('Error populating daily quest slots:', error);
      }
    }
  }, [user, today]);

  // Re-roll a quest slot - picks from ALL active daily quests
  const rerollSlot = async (slotNumber: number) => {
    if (!user) return false;

    const slot = slots.find(s => s.slot_number === slotNumber);
    if (!slot) {
      toast({
        title: "Error",
        description: "Quest slot not found",
        variant: "destructive"
      });
      return false;
    }

    if (slot.has_rerolled) {
      toast({
        title: "Already Re-rolled",
        description: "You can only re-roll each quest once per day",
        variant: "destructive"
      });
      return false;
    }

    if (slot.completed) {
      toast({
        title: "Cannot Re-roll",
        description: "You cannot re-roll a completed quest",
        variant: "destructive"
      });
      return false;
    }

    setIsRerolling(slotNumber);

    try {
      // Get current quest IDs in user's slots to avoid duplicates
      const currentQuestIds = slots.map(s => s.quest_id);
      
      // Filter ALL active daily quests to exclude current ones if possible
      const filteredQuests = allDailyQuests.filter(q => !currentQuestIds.includes(q.id));
      const questPool = filteredQuests.length > 0 ? filteredQuests : allDailyQuests.filter(q => q.id !== slot.quest_id);
      
      if (questPool.length === 0) {
        toast({
          title: "No Quests Available",
          description: "There are no other quests to re-roll to",
          variant: "destructive"
        });
        return false;
      }

      // Pick a random quest from the pool
      const randomIndex = Math.floor(Math.random() * questPool.length);
      const newQuest = questPool[randomIndex];

      // Update the slot - this only affects THIS chatter
      const { error } = await supabase
        .from('gamification_daily_quest_slots')
        .update({
          quest_id: newQuest.id,
          has_rerolled: true
        })
        .eq('id', slot.id);

      if (error) throw error;

      toast({
        title: "Quest Re-rolled! 🎲",
        description: `New quest: ${newQuest.title}`,
      });

      await fetchSlots();
      return true;
    } catch (error) {
      console.error('Error re-rolling quest:', error);
      toast({
        title: "Error",
        description: "Failed to re-roll quest",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsRerolling(null);
    }
  };

  // Mark slot as completed
  const markSlotCompleted = async (slotNumber: number) => {
    if (!user) return false;

    const slot = slots.find(s => s.slot_number === slotNumber);
    if (!slot) return false;

    const { error } = await supabase
      .from('gamification_daily_quest_slots')
      .update({ completed: true })
      .eq('id', slot.id);

    if (error) {
      console.error('Error marking slot completed:', error);
      return false;
    }

    await fetchSlots();
    return true;
  };

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      if (!user) return;
      
      setIsLoading(true);
      
      // Fetch all active daily quests (for re-roll pool)
      await fetchAllDailyQuests();
      
      // Populate slots from admin assignments if needed
      await populateSlotsFromAdminAssignments();
      
      // Fetch the user's slots
      await fetchSlots();
      
      setIsLoading(false);
    };

    init();
  }, [user, fetchAllDailyQuests, populateSlotsFromAdminAssignments, fetchSlots]);

  return {
    slots,
    allDailyQuests,
    isLoading,
    isRerolling,
    rerollSlot,
    markSlotCompleted,
    refetch: fetchSlots
  };
};
