
export interface Recipient {
  id: string;
  name: string;
  profileImage?: string;
  role?: string;
  type: 'creator' | 'employee';
}
