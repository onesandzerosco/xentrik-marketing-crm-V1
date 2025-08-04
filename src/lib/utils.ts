import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get today's date as week start
export function getCurrentWeekStart(): string {
  return new Date().toISOString().split('T')[0];
}

// Get the exact date as week start (no calculations)
export function getWeekStartFromDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
