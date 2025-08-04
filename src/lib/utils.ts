import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get the Thursday of the week containing today (current week's start date)
export function getCurrentWeekStart(): string {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const thursday = new Date(today);
  
  // Calculate days to add/subtract to get to Thursday (day 4)
  // Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6
  const daysToAdd = (4 - dayOfWeek + 7) % 7;
  if (dayOfWeek === 0) { // Sunday
    thursday.setDate(today.getDate() + 4); // Go to Thursday of same week
  } else if (dayOfWeek <= 4) { // Monday to Thursday
    thursday.setDate(today.getDate() + (4 - dayOfWeek)); // Go to Thursday of same week
  } else { // Friday, Saturday
    thursday.setDate(today.getDate() + (11 - dayOfWeek)); // Go to Thursday of next week
  }
  
  return thursday.toISOString().split('T')[0];
}

// Get the Thursday of the week containing the given date
export function getWeekStartFromDate(date: Date): string {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const thursday = new Date(date);
  
  // Calculate days to add/subtract to get to Thursday (day 4)
  if (dayOfWeek === 0) { // Sunday
    thursday.setDate(date.getDate() + 4); // Go to Thursday of same week
  } else if (dayOfWeek <= 4) { // Monday to Thursday
    thursday.setDate(date.getDate() + (4 - dayOfWeek)); // Go to Thursday of same week
  } else { // Friday, Saturday
    thursday.setDate(date.getDate() + (11 - dayOfWeek)); // Go to Thursday of next week
  }
  
  return thursday.toISOString().split('T')[0];
}
