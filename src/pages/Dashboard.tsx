import { useState, useEffect } from "react";
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
  Eye, EyeOff, LogOut, Bell,
  CreditCard, ShoppingBag, Car, Utensils, Music, Heart,
  Gift, Send, ArrowDownLeft, ArrowDownToLine, Zap, QrCode,
} from "lucide-react";
import type { Transaction } from "@/types";

// ─── Category config ────────────────────────────────────────────────────────

const categoryIcons: Record<string, React.ElementType> = {
  pix:          ArrowDownLeft,
  salary:       ArrowDownLeft,
  cashback:     Gift,
  subscription: Music,
  shopping:     ShoppingBag,
  transport:    Car,
  food:         Utensils,
  health:       Heart,
  transfer:     Send,
  default:      CreditCard,
};

const categoryColors: Record<string, string> = {
  pix:          "bg-emerald-500/15 text-emerald-400",
  salary:       "bg-emerald-500/15 text-emerald-400",
  cashback:     "bg-purple-500/15 text-purple-400",
  subscription: "bg-red-500/15 text-red-400",
  shopping:     "bg-orange-500/15 text-orange-400",
  transport:    "bg-yellow-500/15 text-yellow-400",
  food:         "bg-orange-400/15 text-orange-300",
  health:       "bg-pink-500/15 text-pink-400",
  transfer:     "bg-blue-500/15 text-blue-400",
  default:      "bg-muted text-muted-foreground",
};

// ─── Quick actions ───────────────────────────────────────────────────────────

const quickActions = [
  { label: "Pix",          icon: Zap,             active: false },
  { label: "Transferência", icon: Send,            active: true  },
  { label: "Pagamento",    icon: QrCode,           active: false },
  { label: "Depósito",     icon: ArrowDownToLine,  active: false },
] as const;

// ─── Date grouping helpers ───────────────────────────────────────────────────

function isSameDay(a: Date, b: Date) {
  return (
    a.getDate()     === b.getDate()     &&
    a.getMonth()    === b.getMonth()    &&
    a.getFullYear() === b.getFullYear()
  );
}

function getDateLabel(dateStr: string): string {
  const date      = new Date(dateStr);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today))     return "Hoje";
  if (isSameDay(date, yesterday)) return "Ontem";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

function groupByDate(txs: Transaction[]): { label: string; items: Transaction[] }[] {
  const groups: { label: string; items: Transaction[] }[] = [];
  const seen = new Map<string, { label: string; items: Transaction[] }>();
  for (const tx of txs) {
    const label = getDateLabel(tx.date);
    if (!seen.has(label)) {
      const group = { label, items: [] as Transaction[] };
      groups.push(group);
      seen.set(label, group);
    }
    seen.get(label)!.items.push(tx);
  }
  return groups;
}

// ─── Transaction row ─────────────────────────────────────────────────────────

function TransactionRow({ tx }: { tx: Transaction }) {
  const Icon       = categoryIcons[tx.category] ?? categoryIcons.default;
  const colorClass = categoryColors[tx.category] ?? categoryColors.default;
  const isCredit   = tx.type === "credit";

  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
        <p className="text-xs text-muted-foreground">{formatDatePtBR(tx.date)}</p>
      </div>
      <span className={`text-sm font-semibold whitespace-nowrap ${isCredit ? "text-emerald-400" : "text-foreground"}`}>
        {isCredit ? "+" : "−"} {formatBRL(tx.amount)}
      </span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type FilterType = "all" | "credit" | "debit";

const filterLabels: Record<FilterType, string> = {
  all:    "Todas",
  credit: "Entradas",
  debit:  "Saídas",
};

export default function Dashboard() {
  const { user, logout }                          = useAuthStore();
  const { balance, transactions, setTransactions } = useFinanceStore();
  const navigate                                  = useNavigate();
  const [showBalance, setShowBalance]             = useState(true);
  const [filter, setFilter]                       = useState<FilterType>("all");

  useEffect(() => { document.title = "Dashboard — Onda Finance"; }, []);

  const { data: fetchedTransactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn:  fetchTransactions,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (fetchedTransactions && transactions.length === 0) {
      setTransactions(fetchedTransactions);
    }
  }, [fetchedTransactions]);

  const filteredTx = transactions.filter((tx) =>
    filter === "all" ? true : tx.type === filter
  );

  const groups = groupByDate(filteredTx);

  const totalCredits = transactions
    .filter((tx) => tx.type === "credit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebits = transactions
    .filter((tx) => tx.type === "debit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6">

      {/* Header — 0ms */}
      <header className="mb-6 flex items-center justify-between animate-fade-in">
        <OndaLogo size="small" />
        <div className="flex items-center gap-1">
          <span className="mr-2 text-sm text-muted-foreground">Olá, {user?.name}</span>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Bell size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut size={18} />
          </Button>
        </div>
      </header>

      {/* Balance Card — 80ms */}
      <div
        className="gradient-border mb-6 rounded-xl bg-card p-6 glow animate-fade-in [animation-fill-mode:backwards]"
        style={{ animationDelay: "80ms" }}
      >
        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
          Conta Digital · Saldo disponível
        </p>
        <div className="flex items-center gap-3">
          <span className="font-display text-3xl font-bold text-foreground">
            {showBalance ? formatBRL(balance) : "R$ ••••••"}
          </span>
          <button
            onClick={() => setShowBalance((v) => !v)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Monthly stats */}
        <div className="mt-4 flex gap-6 border-t border-border/50 pt-4">
          <div>
            <p className="text-xs text-muted-foreground">↑ Entradas</p>
            <p className="text-sm font-semibold text-emerald-400">
              {showBalance ? formatBRL(totalCredits) : "R$ ••••"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">↓ Saídas</p>
            <p className="text-sm font-semibold text-foreground">
              {showBalance ? formatBRL(totalDebits) : "R$ ••••"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions — 160ms */}
      <div
        className="mb-6 grid grid-cols-4 gap-2 animate-fade-in [animation-fill-mode:backwards]"
        style={{ animationDelay: "160ms" }}
      >
        {quickActions.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            onClick={active ? () => navigate("/transfer") : undefined}
            disabled={!active}
            className={`flex flex-col items-center gap-2 rounded-xl py-3 transition-colors ${
              active
                ? "bg-secondary hover:bg-secondary/80 cursor-pointer"
                : "cursor-not-allowed bg-secondary/40 opacity-50"
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? "gradient-bg" : "bg-muted"}`}>
              <Icon size={18} className={active ? "text-primary-foreground" : "text-muted-foreground"} />
            </div>
            <span className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Transfer CTA — 240ms */}
      <Button
        onClick={() => navigate("/transfer")}
        className="mb-6 w-full animate-fade-in [animation-fill-mode:backwards] gradient-bg gradient-bg-hover font-semibold text-primary-foreground"
        style={{ animationDelay: "240ms" }}
      >
        <Send size={16} className="mr-2" />
        Nova Transferência
      </Button>

      {/* Transactions — 320ms */}
      <div
        className="flex-1 animate-fade-in [animation-fill-mode:backwards]"
        style={{ animationDelay: "320ms" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Últimas transações
          </h2>
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

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg bg-secondary" />
            ))
          ) : filteredTx.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma transação encontrada.
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.items.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
