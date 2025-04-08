
// Activity type definitions
export type ActivityType = "create" | "update" | "alert" | "bulk-update";

export interface ChangeDetail {
  field: string;
  oldValue?: string;
  newValue?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: number;
  creatorId?: string;
  changeDetails?: ChangeDetail[];
}
