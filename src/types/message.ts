
export interface Recipient {
  id: string;
  name: string;
  profileImage?: string;
  role?: string;
  type: 'creator' | 'employee';
}

export interface MessagePayload {
  message: string;
  recipients: Recipient[];
  timestamp: string;
}
