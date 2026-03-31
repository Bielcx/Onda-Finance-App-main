import { useNavigate } from "react-router-dom";
import { OndaLogo } from "@/components/OndaLogo";
import { Button } from "@/components/ui/button";
import { Home, Waves } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="mb-8 flex justify-center">
          <OndaLogo />
        </div>

        <div className="gradient-border rounded-xl bg-card p-10 glow">
          <div className="mb-4 flex justify-center">
            <Waves size={48} className="text-muted-foreground opacity-40" />
          </div>
          <h1 className="mb-2 font-display text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            404
          </h1>
          <p className="mb-1 text-lg font-semibold text-foreground">
            Página não encontrada
          </p>
          <p className="mb-8 text-sm text-muted-foreground">
            A página que você tentou acessar não existe ou foi movida.
          </p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="gradient-bg gradient-bg-hover text-primary-foreground font-semibold"
          >
            <Home size={16} className="mr-2" />
            Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  );
}