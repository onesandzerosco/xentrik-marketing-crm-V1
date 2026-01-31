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
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRerolling, setIsRerolling] = useState<number | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  // Fetch available daily quests
  const fetchAvailableQuests = useCallback(async () => {
    const { data, error } = await supabase
      .from('gamification_quests')
      .select('*')
      .eq('quest_type', 'daily')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching daily quests:', error);
      return [];
    }
    
    setAvailableQuests((data as Quest[]) || []);
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

  // Assign random quests to empty slots
  const assignRandomQuests = useCallback(async (quests: Quest[]) => {
    if (!user || quests.length === 0) return;

    // Check which slots are already filled
    const { data: existingSlots } = await supabase
      .from('gamification_daily_quest_slots')
      .select('slot_number')
      .eq('chatter_id', user.id)
      .eq('date', today);

    const filledSlots = new Set((existingSlots || []).map(s => s.slot_number));
    const emptySlots = [1, 2, 3].filter(n => !filledSlots.has(n));

    if (emptySlots.length === 0) return;

    // Get random quests (avoiding duplicates if possible)
    const shuffled = [...quests].sort(() => Math.random() - 0.5);
    const selectedQuests: Quest[] = [];
    
    for (const slot of emptySlots) {
      // Try to pick a quest not already selected
      const available = shuffled.filter(q => !selectedQuests.find(s => s.id === q.id));
      const quest = available.length > 0 ? available[0] : shuffled[slot % shuffled.length];
      selectedQuests.push(quest);
    }

    // Insert new slots
    const inserts = emptySlots.map((slotNumber, index) => ({
      chatter_id: user.id,
      slot_number: slotNumber,
      quest_id: selectedQuests[index].id,
      date: today,
      has_rerolled: false,
      completed: false
    }));

    const { error } = await supabase
      .from('gamification_daily_quest_slots')
      .insert(inserts);

    if (error) {
      console.error('Error assigning daily quests:', error);
    }

    await fetchSlots();
  }, [user, today, fetchSlots]);

  // Re-roll a quest slot
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
      // Get current quest IDs in slots to avoid duplicates
      const currentQuestIds = slots.map(s => s.quest_id);
      
      // Filter available quests to exclude current ones if possible
      const filteredQuests = availableQuests.filter(q => !currentQuestIds.includes(q.id));
      const questPool = filteredQuests.length > 0 ? filteredQuests : availableQuests;
      
      if (questPool.length === 0) {
        toast({
          title: "No Quests Available",
          description: "There are no other quests to re-roll to",
          variant: "destructive"
        });
        return false;
      }

      // Pick a random quest
      const randomIndex = Math.floor(Math.random() * questPool.length);
      const newQuest = questPool[randomIndex];

      // Update the slot
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

  // Mark slot as completed (for tracking purposes - actual completion is separate)
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
      const quests = await fetchAvailableQuests();
      await fetchSlots();
      
      // Check if we need to assign quests (for new day or first time)
      if (quests.length > 0) {
        await assignRandomQuests(quests);
        await fetchSlots();
      }
      
      setIsLoading(false);
    };

    init();
  }, [user, fetchAvailableQuests, fetchSlots, assignRandomQuests]);

  return {
    slots,
    availableQuests,
    isLoading,
    isRerolling,
    rerollSlot,
    markSlotCompleted,
    refetch: fetchSlots
  };
};
