
// Export the toast functionality from the UI component
import { toast as sonnerToast, type ToastT } from "sonner";
import { useToast as useToastUI } from "@/components/ui/use-toast";

// Re-export the useToast hook
export const useToast = useToastUI;

// Re-export the toast function
export const toast = sonnerToast;

// Export the toast types
export type Toast = ToastT;
