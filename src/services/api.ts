import axios from "axios";
import { subDays } from "date-fns";
import type { Transaction } from "@/types";

const api = axios.create({ baseURL: "" });

// Mock — intercepts requests and returns fake data

function daysAgo(n: number) {
  return subDays(new Date(), n).toISOString();
}

const mockTransactions: Transaction[] = [
  { id: "1", type: "credit",  description: "Pix recebido - João Silva",      amount: 1500.00, date: daysAgo(7),  category: "pix" },
  { id: "2", type: "debit",   description: "Pagamento Netflix",               amount: 55.90,   date: daysAgo(8),  category: "subscription" },
  { id: "3", type: "credit",  description: "Salário - Empresa XYZ",           amount: 8500.00, date: daysAgo(10), category: "salary" },
  { id: "4", type: "debit",   description: "Supermercado Pão de Açúcar",      amount: 342.67,  date: daysAgo(11), category: "shopping" },
  { id: "5", type: "debit",   description: "Uber - Corrida",                  amount: 28.50,   date: daysAgo(12), category: "transport" },
  { id: "6", type: "credit",  description: "Pix recebido - Maria Santos",     amount: 250.00,  date: daysAgo(13), category: "pix" },
  { id: "7", type: "debit",   description: "iFood - Jantar",                  amount: 67.80,   date: daysAgo(14), category: "food" },
  { id: "8", type: "debit",   description: "Spotify Premium",                 amount: 21.90,   date: daysAgo(15), category: "subscription" },
  { id: "9", type: "credit",  description: "Cashback - Cartão Onda",          amount: 45.30,   date: daysAgo(16), category: "cashback" },
  { id: "10", type: "debit",  description: "Farmácia Drogasil",               amount: 89.00,   date: daysAgo(17), category: "health" },
];

export async function fetchTransactions(): Promise<Transaction[]> {
  await new Promise((res) => setTimeout(res, 500));
  return mockTransactions;
}

export async function loginRequest(email: string, password: string) {
  await new Promise((res) => setTimeout(res, 400));
  if (email === "gabriel@onda.finance" && password === "senha123") {
    return { user: { email, name: "Gabriel" } };
  }
  throw new Error("Credenciais inválidas");
}

export async function submitTransfer(payload: {
  recipientName: string;
  recipientKey: string;
  amount: number;
  description?: string;
}) {
  await new Promise((res) => setTimeout(res, 800));
  return { success: true };
}

export default api;
