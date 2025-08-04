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
  // JavaScript getDay(): 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  // We want to get to Thursday (4)
  let daysToThursday;
  if (dayOfWeek <= 4) {
    // If today is Thursday or before, go to this week's Thursday
    daysToThursday = 4 - dayOfWeek;
  } else {
    // If today is Friday or after, go to next week's Thursday
    daysToThursday = (7 - dayOfWeek) + 4;
  }
  
  thursday.setDate(today.getDate() + daysToThursday);
  
  return thursday.toISOString().split('T')[0];
}

// Get the Thursday of the week containing the given date
export function getWeekStartFromDate(date: Date): string {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const thursday = new Date(date);
  
  // Calculate days to get to Thursday of the week containing this date
  let daysToThursday;
  if (dayOfWeek <= 4) {
    // If the date is Thursday or before, go to this week's Thursday
    daysToThursday = 4 - dayOfWeek;
  } else {
    // If the date is Friday or after, go to next week's Thursday
    daysToThursday = (7 - dayOfWeek) + 4;
  }
  
  thursday.setDate(date.getDate() + daysToThursday);
  
  return thursday.toISOString().split('T')[0];
}
