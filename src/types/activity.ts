
// Activity type definitions
export type ActivityType = "create" | "update" | "alert";

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: number;
  creatorId?: string;
}
