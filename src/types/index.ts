export interface User {
  email: string;
  name: string;
}

export interface Transaction {
  id: string;
  type: "credit" | "debit";
  description: string;
  amount: number;
  date: string;
  category: string;
}

export interface TransferPayload {
  recipientName: string;
  recipientKey: string;
  amount: number;
  description?: string;
}
