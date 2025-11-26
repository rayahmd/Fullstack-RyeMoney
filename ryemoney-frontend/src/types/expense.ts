export type Expense = {
  _id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO string dari backend
  paymentMethod: string;

  receiptUrl?: string; // "/uploads/xxx.png"
  aiCategory?: string;
  aiNote?: string;

  userId: string;

  createdAt?: string;
  updatedAt?: string;
};

export type MonthlyInsight = {
  month: number;
  year: number;
  grandTotal: number;
  byCategory: { category: string; total: number }[];
  count: number;
};
