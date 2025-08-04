import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get the Thursday of the week containing today (current week's start date)
// Week runs Thursday to Wednesday, so we go to the Thursday of the current week
export function getCurrentWeekStart(): string {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const thursday = new Date(today);
  
  // For August 4 (Monday), we want Thursday August 7th
  // Sunday-Wednesday: go to Thursday of same week (add days)
  // Thursday-Saturday: it's already the current week's Thursday or later
  if (dayOfWeek === 0) { // Sunday
    thursday.setDate(today.getDate() + 4);
  } else if (dayOfWeek <= 3) { // Monday-Wednesday
    thursday.setDate(today.getDate() + (4 - dayOfWeek));
  } else { // Thursday-Saturday (current week)
    thursday.setDate(today.getDate() - (dayOfWeek - 4));
  }
  
  return thursday.toISOString().split('T')[0];
}

// Get the Thursday of the week containing the given date
// Week runs Thursday to Wednesday, so we go to the Thursday of the current week
export function getWeekStartFromDate(date: Date): string {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const thursday = new Date(date);
  
  // Sunday-Wednesday: go to Thursday of same week (add days)
  // Thursday-Saturday: it's already the current week's Thursday or later
  if (dayOfWeek === 0) { // Sunday
    thursday.setDate(date.getDate() + 4);
  } else if (dayOfWeek <= 3) { // Monday-Wednesday
    thursday.setDate(date.getDate() + (4 - dayOfWeek));
  } else { // Thursday-Saturday (current week)
    thursday.setDate(date.getDate() - (dayOfWeek - 4));
  }
  
  return thursday.toISOString().split('T')[0];
}
