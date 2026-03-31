import axios from "axios";
import type { Transaction } from "@/types";

const api = axios.create({ baseURL: "" });

// Mock — intercepts requests and returns fake data

const mockTransactions: Transaction[] = [
  { id: "1", type: "credit", description: "Pix recebido - João Silva", amount: 1500.0, date: "2025-03-28T10:30:00", category: "pix" },
  { id: "2", type: "debit", description: "Pagamento Netflix", amount: 55.9, date: "2025-03-27T08:00:00", category: "subscription" },
  { id: "3", type: "credit", description: "Salário - Empresa XYZ", amount: 8500.0, date: "2025-03-25T06:00:00", category: "salary" },
  { id: "4", type: "debit", description: "Supermercado Pão de Açúcar", amount: 342.67, date: "2025-03-24T15:20:00", category: "shopping" },
  { id: "5", type: "debit", description: "Uber - Corrida", amount: 28.5, date: "2025-03-23T22:15:00", category: "transport" },
  { id: "6", type: "credit", description: "Pix recebido - Maria Santos", amount: 250.0, date: "2025-03-22T14:00:00", category: "pix" },
  { id: "7", type: "debit", description: "iFood - Jantar", amount: 67.8, date: "2025-03-21T20:30:00", category: "food" },
  { id: "8", type: "debit", description: "Spotify Premium", amount: 21.9, date: "2025-03-20T08:00:00", category: "subscription" },
  { id: "9", type: "credit", description: "Cashback - Cartão Onda", amount: 45.3, date: "2025-03-19T12:00:00", category: "cashback" },
  { id: "10", type: "debit", description: "Farmácia Drogasil", amount: 89.0, date: "2025-03-18T11:45:00", category: "health" },
];

export async function fetchTransactions(): Promise<Transaction[]> {
  // Simula network delay
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
  description?: string 
}) {
  await new Promise((res) => setTimeout(res, 800));
  // Simula sucesso sempre — sem chamar nenhuma URL real
  return { success: true };
}

export default api;
