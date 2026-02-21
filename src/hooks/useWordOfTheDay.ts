import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DailyWord {
  id: string;
  word: string;
  definition: string | null;
  part_of_speech: string | null;
  date: string;
  created_at: string;
}

/**
 * Fetch the word to display for a quest.
 * 
 * Priority:
 * 1. Custom word set by admin on the assignment (custom_word / custom_word_description)
 * 2. Fallback to auto-generated word from gamification_daily_words table
 * 
 * @param assignmentId - optional quest assignment ID to check for custom word
 */
export const useWordOfTheDay = (assignmentId?: string) => {
  const [dailyWord, setDailyWord] = useState<DailyWord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWord = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. If we have an assignmentId, check for a custom word on the assignment
        if (assignmentId) {
          const { data: assignment, error: aErr } = await supabase
            .from('gamification_quest_assignments')
            .select('custom_word, custom_word_description')
            .eq('id', assignmentId)
            .maybeSingle();

          if (!aErr && assignment?.custom_word) {
            setDailyWord({
              id: assignmentId,
              word: assignment.custom_word,
              definition: assignment.custom_word_description || null,
              part_of_speech: null,
              date: new Date().toISOString().split('T')[0],
              created_at: new Date().toISOString(),
            });
            setIsLoading(false);
            return;
          }
        }

        // 2. Fallback: fetch from gamification_daily_words
        const today = new Date().toISOString().split('T')[0];
        const { data: existingWord, error: fetchError } = await supabase
          .from('gamification_daily_words')
          .select('*')
          .eq('date', today)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (existingWord) {
          setDailyWord(existingWord as DailyWord);
          setIsLoading(false);
          return;
        }

        // If no word exists for today, call the edge function to generate one
        const { data, error: fnError } = await supabase.functions.invoke('word-of-the-day');
        
        if (fnError) {
          throw fnError;
        }

        setDailyWord(data as DailyWord);
      } catch (err) {
        console.error('Error fetching word of the day:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch word of the day');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWord();
  }, [assignmentId]);

  return { dailyWord, isLoading, error };
};
