import { format } from 'date-fns';

/**
 * Get the effective daily quest date based on a 10pm cutoff.
 * 
 * Daily quests reset at 10pm (22:00), not midnight.
 * - Before 10pm: the quest date is the current calendar date
 * - At/after 10pm: the quest date advances to the next calendar date
 * 
 * Example: At 10pm Monday, the quest date becomes Tuesday.
 * The Tuesday quests then remain active until 10pm Tuesday.
 * 
 * @param now - Optional date to calculate from (defaults to current time)
 * @returns The effective quest date string in 'yyyy-MM-dd' format
 */
export const getDailyQuestDate = (now?: Date): string => {
  const date = now ? new Date(now) : new Date();
  
  // If it's 10pm (22:00) or later, shift to the next day
  if (date.getHours() >= 22) {
    date.setDate(date.getDate() + 1);
  }
  
  return format(date, 'yyyy-MM-dd');
};
