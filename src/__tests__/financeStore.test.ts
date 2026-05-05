import { useFinanceStore } from "@/store/financeStore";
import type { Transaction } from "@/types";

describe("financeStore — makeTransfer", () => {
  beforeEach(() => {
    localStorage.clear();
    useFinanceStore.setState({ balance: 15000, transactions: [] });
  });

  it("deducts the transferred amount from the balance", () => {
    useFinanceStore.getState().makeTransfer({
      recipientName: "João",
      recipientKey: "joao@test.com",
      amount: 500,
    });
    expect(useFinanceStore.getState().balance).toBe(14500);
  });

  it("prepends a debit transaction with the correct shape", () => {
    useFinanceStore.getState().makeTransfer({
      recipientName: "Maria",
      recipientKey: "maria@test.com",
      amount: 200,
    });
    const { transactions } = useFinanceStore.getState();
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({
      type: "debit",
      amount: 200,
      description: "Pix enviado - Maria",
      category: "transfer",
    });
  });

  it("inserts the new transaction before existing ones", () => {
    const existing: Transaction = {
      id: "existing",
      type: "credit",
      description: "Salário",
      amount: 8000,
      date: new Date().toISOString(),
      category: "salary",
    };
    useFinanceStore.setState({ balance: 15000, transactions: [existing] });

    useFinanceStore.getState().makeTransfer({
      recipientName: "Ana",
      recipientKey: "ana@test.com",
      amount: 300,
    });

    const { transactions } = useFinanceStore.getState();
    expect(transactions).toHaveLength(2);
    expect(transactions[0].type).toBe("debit");
    expect(transactions[1].id).toBe("existing");
  });

  it("balance reaches zero when the full amount is transferred", () => {
    useFinanceStore.getState().makeTransfer({
      recipientName: "Test",
      recipientKey: "test@test.com",
      amount: 15000,
    });
    expect(useFinanceStore.getState().balance).toBe(0);
  });

  it("each transfer generates a unique transaction id", () => {
    useFinanceStore.getState().makeTransfer({ recipientName: "A", recipientKey: "a@test.com", amount: 10 });
    useFinanceStore.getState().makeTransfer({ recipientName: "B", recipientKey: "b@test.com", amount: 10 });
    const { transactions } = useFinanceStore.getState();
    expect(transactions[0].id).not.toBe(transactions[1].id);
  });
});
