import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "@/pages/Dashboard";
import { useAuthStore } from "@/store/authStore";
import { useFinanceStore } from "@/store/financeStore";
import type { Transaction } from "@/types";

vi.mock("@/services/api", () => ({
  fetchTransactions: vi.fn().mockResolvedValue([]),
  default: {},
}));

const creditTx: Transaction = {
  id: "c1",
  type: "credit",
  description: "Salário recebido",
  amount: 5000,
  date: new Date().toISOString(),
  category: "salary",
};

const debitTx: Transaction = {
  id: "d1",
  type: "debit",
  description: "Supermercado",
  amount: 200,
  date: new Date().toISOString(),
  category: "shopping",
};

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Dashboard — transaction filter", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: { email: "test@onda.finance", name: "Test" },
      isAuthenticated: true,
    });
    useFinanceStore.setState({ balance: 15000, transactions: [creditTx, debitTx] });
  });

  afterEach(() => {
    useFinanceStore.setState({ balance: 15000, transactions: [] });
  });

  it("shows all transactions by default", async () => {
    renderDashboard();
    expect(await screen.findByText("Salário recebido")).toBeInTheDocument();
    expect(screen.getByText("Supermercado")).toBeInTheDocument();
  });

  it("shows only credits when Entradas is clicked", async () => {
    renderDashboard();
    await screen.findByText("Salário recebido");

    fireEvent.click(screen.getByText("Entradas"));

    expect(screen.getByText("Salário recebido")).toBeInTheDocument();
    expect(screen.queryByText("Supermercado")).not.toBeInTheDocument();
  });

  it("shows only debits when Saídas is clicked", async () => {
    renderDashboard();
    await screen.findByText("Supermercado");

    fireEvent.click(screen.getByText("Saídas"));

    expect(screen.getByText("Supermercado")).toBeInTheDocument();
    expect(screen.queryByText("Salário recebido")).not.toBeInTheDocument();
  });

  it("shows empty state when no transactions match the active filter", async () => {
    useFinanceStore.setState({ balance: 15000, transactions: [debitTx] });
    renderDashboard();
    await screen.findByText("Supermercado");

    fireEvent.click(screen.getByText("Entradas"));

    expect(screen.getByText("Nenhuma transação encontrada.")).toBeInTheDocument();
  });

  it("restores all transactions when Todas is clicked after filtering", async () => {
    renderDashboard();
    await screen.findByText("Salário recebido");

    fireEvent.click(screen.getByText("Saídas"));
    expect(screen.queryByText("Salário recebido")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Todas"));
    expect(screen.getByText("Salário recebido")).toBeInTheDocument();
    expect(screen.getByText("Supermercado")).toBeInTheDocument();
  });
});
