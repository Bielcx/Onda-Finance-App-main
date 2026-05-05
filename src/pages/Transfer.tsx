import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFinanceStore } from "@/store/financeStore";
import { submitTransfer } from "@/services/api";
import { formatBRL } from "@/utils/currency";
import { OndaLogo } from "@/components/OndaLogo";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, User } from "lucide-react";

// ─── Schema ──────────────────────────────────────────────────────────────────

export function createTransferSchema(maxBalance: number) {
  return z.object({
    recipientName: z.string().trim().min(1, "Nome do destinatário é obrigatório"),
    recipientKey:  z.string().trim().min(1, "Chave Pix é obrigatória"),
    amount: z
      .number({ invalid_type_error: "Insira um valor" })
      .gt(0, "Valor deve ser maior que zero")
      .max(maxBalance, "Saldo insuficiente"),
    description: z.string().optional(),
  });
}

export type TransferFormData = z.infer<ReturnType<typeof createTransferSchema>>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Transfer() {
  const navigate             = useNavigate();
  const { toast }            = useToast();
  const { balance, makeTransfer } = useFinanceStore();

  const [step, setStep]       = useState<"form" | "confirm">("form");
  const [pending, setPending] = useState<TransferFormData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = "Nova Transferência — Onda Finance"; }, []);

  const schema = createTransferSchema(balance);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<TransferFormData>({
    resolver: zodResolver(schema),
  });

  const recipientName = watch("recipientName") ?? "";

  // Form step: validate then advance to confirmation
  const goToConfirm = (data: TransferFormData) => {
    setPending(data);
    setStep("confirm");
  };

  // Confirm step: execute transfer
  const onConfirm = async () => {
    if (!pending) return;
    setLoading(true);
    try {
      await submitTransfer(pending);
      makeTransfer(pending);
      toast({
        title: "Transferência realizada!",
        description: `${formatBRL(pending.amount)} enviados para ${pending.recipientName}`,
      });
      navigate("/dashboard");
    } catch {
      toast({ title: "Erro", description: "Falha ao realizar transferência", variant: "destructive" });
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () =>
    step === "confirm" ? setStep("form") : navigate("/dashboard");

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6">
      <header className="mb-6 flex items-center gap-4 animate-fade-in">
        <Button variant="ghost" size="icon" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </Button>
        <OndaLogo size="small" />
      </header>

      {/* ── Form step ────────────────────────────────────────────────────── */}
      {step === "form" && (
        <div className="gradient-border rounded-xl bg-card p-6 glow animate-fade-in">
          <h1 className="mb-6 font-display text-xl font-semibold text-foreground">
            Nova Transferência
          </h1>

          <form onSubmit={handleSubmit(goToConfirm)} className="space-y-5">

            {/* Recipient name + avatar */}
            <div className="space-y-2">
              <Label>Nome do destinatário</Label>
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  recipientName
                    ? "gradient-bg text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {recipientName ? getInitials(recipientName) : <User size={16} />}
                </div>
                <Input
                  {...register("recipientName")}
                  placeholder="João da Silva"
                  className="flex-1 bg-secondary border-border"
                />
              </div>
              {errors.recipientName && (
                <p className="text-sm text-destructive">{errors.recipientName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Chave Pix</Label>
              <Input
                {...register("recipientKey")}
                placeholder="email@exemplo.com"
                className="bg-secondary border-border"
              />
              {errors.recipientKey && (
                <p className="text-sm text-destructive">{errors.recipientKey.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                {...register("amount", {
                  setValueAs: (v) => (v === "" ? undefined : parseFloat(v)),
                })}
                placeholder="0,00"
                className="bg-secondary border-border"
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Saldo disponível: {formatBRL(balance)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                {...register("description")}
                placeholder="Ex: Almoço de ontem"
                className="resize-none bg-secondary border-border"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
                Voltar
              </Button>
              <Button type="submit" className="flex-1 gradient-bg gradient-bg-hover font-semibold text-primary-foreground">
                Continuar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Confirmation step ─────────────────────────────────────────────── */}
      {step === "confirm" && pending && (
        <div className="gradient-border rounded-xl bg-card p-6 glow animate-fade-in">
          <h1 className="mb-1 font-display text-xl font-semibold text-foreground">
            Confirmar transferência
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Revise os dados antes de confirmar
          </p>

          {/* Recipient */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-bg text-xl font-bold text-primary-foreground">
              {getInitials(pending.recipientName)}
            </div>
            <p className="font-display text-base font-semibold text-foreground">
              {pending.recipientName}
            </p>
            <p className="text-xs text-muted-foreground">{pending.recipientKey}</p>
          </div>

          {/* Amount */}
          <div className="mb-6 rounded-xl bg-secondary/50 p-4 text-center">
            <p className="mb-1 text-xs text-muted-foreground">Valor a transferir</p>
            <p className="font-display text-3xl font-bold text-foreground">
              {formatBRL(pending.amount)}
            </p>
            {pending.description && (
              <p className="mt-2 text-xs text-muted-foreground">"{pending.description}"</p>
            )}
          </div>

          {/* Details */}
          <div className="mb-6 space-y-3 rounded-xl bg-secondary/30 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium">Pix</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Chave</span>
              <span className="truncate font-medium">{pending.recipientKey}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo após</span>
              <span className="font-medium">{formatBRL(balance - pending.amount)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep("form")} className="flex-1">
              Editar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 gradient-bg gradient-bg-hover font-semibold text-primary-foreground"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Confirmar transferência"}
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
