
export interface IncomeEntry {
  date: string;
  subscriptions: number;
  tips: number;
  posts: number;
  messages: number;
  referrals: number;
  streams: number;
  total: number;
}

export interface IncomeSource {
  total: number;
  average: number;
  highest: number;
}
