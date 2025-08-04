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
  // For Thursday-to-Wednesday weeks:
  // Sun(0)->3 days back, Mon(1)->4 days back, Tue(2)->5 days back, Wed(3)->6 days back
  // Thu(4)->0 days back, Fri(5)->1 day back, Sat(6)->2 days back
  let daysToSubtract;
  if (dayOfWeek >= 4) { // Thursday to Saturday
    daysToSubtract = dayOfWeek - 4;
  } else { // Sunday to Wednesday  
    daysToSubtract = dayOfWeek + 3;
  }
  
  thursday.setDate(today.getDate() - daysToSubtract);
  
  return thursday.toISOString().split('T')[0];
}

// Get the Thursday of the week containing the given date
export function getWeekStartFromDate(date: Date): string {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const thursday = new Date(date);
  
  // Calculate days to subtract to get to the Thursday of the current week
  // For Thursday-to-Wednesday weeks:
  let daysToSubtract;
  if (dayOfWeek >= 4) { // Thursday to Saturday
    daysToSubtract = dayOfWeek - 4;
  } else { // Sunday to Wednesday  
    daysToSubtract = dayOfWeek + 3;
  }
  
  thursday.setDate(date.getDate() - daysToSubtract);
  
  return thursday.toISOString().split('T')[0];
}
