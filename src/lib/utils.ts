import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get July 31st as the default week start (where the data exists)
export function getCurrentWeekStart(): string {
  return '2025-07-31';
}

// Get the date as week start - NO CALCULATIONS
export function getWeekStartFromDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
