import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useFinanceStore } from "@/store/financeStore";
import { fetchTransactions } from "@/services/api";
import { formatBRL, formatDatePtBR } from "@/utils/currency";
import { OndaLogo } from "@/components/OndaLogo";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye, EyeOff, LogOut, ArrowUpRight, ArrowDownLeft,
  CreditCard, ShoppingBag, Car, Utensils, Music, Heart,
  Gift, Send,
} from "lucide-react";
import type { Transaction } from "@/types";

const categoryIcons: Record<string, React.ElementType> = {
  pix: ArrowDownLeft,
  salary: ArrowDownLeft,
  cashback: Gift,
  subscription: Music,
  shopping: ShoppingBag,
  transport: Car,
  food: Utensils,
  health: Heart,
  transfer: Send,
  default: CreditCard,
};

type FilterType = "all" | "credit" | "debit";

function TransactionRow({ tx }: { tx: Transaction }) {
  const Icon = categoryIcons[tx.category] || categoryIcons.default;
  const isCredit = tx.type === "credit";

  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary animate-fade-in">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isCredit ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
        <p className="text-xs text-muted-foreground">{formatDatePtBR(tx.date)}</p>
      </div>
      <span className={`text-sm font-semibold whitespace-nowrap ${isCredit ? "text-accent" : "text-foreground"}`}>
        {isCredit ? "+ " : "- "}
        {formatBRL(tx.amount)}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const { balance, transactions, setTransactions } = useFinanceStore();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const { isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const data = await fetchTransactions();
      // Só popula se ainda não tiver transações salvas (evita sobrescrever após transferências)
      if (transactions.length === 0) setTransactions(data);
      return data;
    },
    staleTime: Infinity,
  });

  const filteredTx = transactions.filter((tx) =>
    filter === "all" ? true : tx.type === filter
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filterLabels: Record<FilterType, string> = {
    all: "Todas",
    credit: "Entradas",
    debit: "Saídas",
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between animate-fade-in">
        <OndaLogo size="small" />
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Olá, {user?.name}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut size={18} />
          </Button>
        </div>
      </header>

      {/* Balance Card */}
      <div className="gradient-border mb-6 rounded-xl bg-card p-6 glow animate-fade-in">
        <p className="mb-1 text-sm text-muted-foreground">Saldo disponível</p>
        <div className="flex items-center gap-3">
          <span className="font-display text-3xl font-bold text-foreground">
            {showBalance ? formatBRL(balance) : "R$ ••••••"}
          </span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Transfer Button */}
      <Button
        onClick={() => navigate("/transfer")}
        className="mb-6 w-full gradient-bg gradient-bg-hover text-primary-foreground font-semibold animate-fade-in"
      >
        <Send size={16} className="mr-2" />
        Nova Transferência
      </Button>

      {/* Transactions */}
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Últimas transações
          </h2>
          {/* Filtros */}
          <div className="flex gap-1 rounded-lg bg-secondary p-1">
            {(["all", "credit", "debit"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg bg-secondary" />
            ))
          ) : filteredTx.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma transação encontrada.
            </div>
          ) : (
            filteredTx.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}