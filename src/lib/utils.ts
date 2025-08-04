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
  
  // For Thursday-to-Wednesday weeks, calculate days to get to Thursday
  if (dayOfWeek === 0) { // Sunday
    thursday.setDate(today.getDate() - 3); // Go back to Thursday
  } else if (dayOfWeek === 1) { // Monday  
    thursday.setDate(today.getDate() - 4); // Go back to Thursday
  } else if (dayOfWeek === 2) { // Tuesday
    thursday.setDate(today.getDate() - 5); // Go back to Thursday  
  } else if (dayOfWeek === 3) { // Wednesday
    thursday.setDate(today.getDate() - 6); // Go back to Thursday
  } else if (dayOfWeek === 4) { // Thursday
    // Already Thursday, keep same date
  } else if (dayOfWeek === 5) { // Friday
    thursday.setDate(today.getDate() - 1); // Go back to Thursday
  } else if (dayOfWeek === 6) { // Saturday
    thursday.setDate(today.getDate() - 2); // Go back to Thursday
  }
  
  return thursday.toISOString().split('T')[0];
}

// Get the Thursday of the week containing the given date
export function getWeekStartFromDate(date: Date): string {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const thursday = new Date(date);
  
  // For Thursday-to-Wednesday weeks, calculate days to get to Thursday
  if (dayOfWeek === 0) { // Sunday
    thursday.setDate(date.getDate() - 3); // Go back to Thursday
  } else if (dayOfWeek === 1) { // Monday  
    thursday.setDate(date.getDate() - 4); // Go back to Thursday
  } else if (dayOfWeek === 2) { // Tuesday
    thursday.setDate(date.getDate() - 5); // Go back to Thursday  
  } else if (dayOfWeek === 3) { // Wednesday
    thursday.setDate(date.getDate() - 6); // Go back to Thursday
  } else if (dayOfWeek === 4) { // Thursday
    // Already Thursday, keep same date
  } else if (dayOfWeek === 5) { // Friday
    thursday.setDate(date.getDate() - 1); // Go back to Thursday
  } else if (dayOfWeek === 6) { // Saturday
    thursday.setDate(date.getDate() - 2); // Go back to Thursday
  }
  
  return thursday.toISOString().split('T')[0];
}
