import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useFinanceStore } from "@/store/financeStore";
import { submitTransfer } from "@/services/api";
import { OndaLogo } from "@/components/OndaLogo";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

export function createTransferSchema(maxBalance: number) {
  return z.object({
    recipientName: z.string().trim().min(1, "Nome do destinatário é obrigatório"),
    recipientKey: z.string().trim().min(1, "Chave Pix é obrigatória"),
    amount: z
      .number({ invalid_type_error: "Insira um valor" })
      .gt(0, "Valor deve ser maior que zero")
      .max(maxBalance, "Saldo insuficiente"),
    description: z.string().optional(),
  });
}

export type TransferFormData = z.infer<ReturnType<typeof createTransferSchema>>;

export default function Transfer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { balance, makeTransfer } = useFinanceStore();
  const [loading, setLoading] = useState(false);

  const schema = createTransferSchema(balance);

  const { register, handleSubmit, formState: { errors } } = useForm<TransferFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: TransferFormData) => {
    setLoading(true);
    try {
      const payload = {
        recipientName: data.recipientName!,
        recipientKey: data.recipientKey!,
        amount: data.amount!,
        description: data.description,
      };
      await submitTransfer(payload);
      makeTransfer(payload);
      toast({
        title: "Transferência realizada!",
        description: `R$ ${data.amount.toFixed(2).replace(".", ",")} enviados para ${data.recipientName}`,
      });
      navigate("/dashboard");
    } catch {
      toast({ title: "Erro", description: "Falha ao realizar transferência", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-6">
      <header className="mb-6 flex items-center gap-4 animate-fade-in">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </Button>
        <OndaLogo size="small" />
      </header>

      <div className="gradient-border rounded-xl bg-card p-6 glow animate-fade-in">
        <h1 className="mb-6 font-display text-xl font-semibold text-foreground">
          Nova Transferência
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label>Nome do destinatário</Label>
            <Input {...register("recipientName")} placeholder="João da Silva" className="bg-secondary border-border" />
            {errors.recipientName && <p className="text-sm text-destructive">{errors.recipientName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Chave Pix</Label>
            <Input {...register("recipientKey")} placeholder="email@exemplo.com" className="bg-secondary border-border" />
            {errors.recipientKey && <p className="text-sm text-destructive">{errors.recipientKey.message}</p>}
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
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            <p className="text-xs text-muted-foreground">
              Saldo disponível: R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea {...register("description")} placeholder="Ex: Almoço de ontem" className="bg-secondary border-border resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
              Voltar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 gradient-bg gradient-bg-hover text-primary-foreground font-semibold">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Transferir"}
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}