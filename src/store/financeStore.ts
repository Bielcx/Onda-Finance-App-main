import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Transaction, TransferPayload } from "@/types";

function generateId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substring(2) + Date.now().toString(36);
}

interface FinanceState {
  balance: number;
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;
  makeTransfer: (payload: TransferPayload) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      balance: 15000.0, //valor fixo no estado inicial
      transactions: [],
      setTransactions: (transactions) => set({ transactions }),
      makeTransfer: (payload) =>
        set((state) => {
          const newTx: Transaction = {
            id: generateId(),
            type: "debit",
            description: `Pix enviado - ${payload.recipientName}`,
            amount: payload.amount,
            date: new Date().toISOString(),
            category: "transfer",
          };
          return {
            balance: state.balance - payload.amount,
            transactions: [newTx, ...state.transactions],
          };
        }),
    }),
    { name: "onda-finance" }
  )
);