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
  
  // Calculate days to subtract to get to the Thursday of the current week
  const daysToSubtract = (dayOfWeek + 3) % 7;
  thursday.setDate(today.getDate() - daysToSubtract);
  
  return thursday.toISOString().split('T')[0];
}

// Get the Thursday of the week containing the given date
export function getWeekStartFromDate(date: Date): string {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const thursday = new Date(date);
  
  // Calculate days to subtract to get to the Thursday of the current week
  const daysToSubtract = (dayOfWeek + 3) % 7;
  thursday.setDate(date.getDate() - daysToSubtract);
  
  return thursday.toISOString().split('T')[0];
}
