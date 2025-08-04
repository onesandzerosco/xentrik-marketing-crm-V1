import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get the Thursday of the week containing today (current week's start date)
// Week runs Thursday to Wednesday, so we always go back to the most recent Thursday
export function getCurrentWeekStart(): string {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const thursday = new Date(today);
  
  // Calculate days to subtract to get to the most recent Thursday
  // Thursday=0, Friday=1, Saturday=2, Sunday=3, Monday=4, Tuesday=5, Wednesday=6
  const daysToSubtract = (dayOfWeek - 4 + 7) % 7;
  thursday.setDate(today.getDate() - daysToSubtract);
  
  return thursday.toISOString().split('T')[0];
}

// Get the Thursday of the week containing the given date
// Week runs Thursday to Wednesday, so we always go back to the most recent Thursday
export function getWeekStartFromDate(date: Date): string {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const thursday = new Date(date);
  
  // Calculate days to subtract to get to the most recent Thursday
  // Thursday=0, Friday=1, Saturday=2, Sunday=3, Monday=4, Tuesday=5, Wednesday=6
  const daysToSubtract = (dayOfWeek - 4 + 7) % 7;
  thursday.setDate(date.getDate() - daysToSubtract);
  
  return thursday.toISOString().split('T')[0];
}
