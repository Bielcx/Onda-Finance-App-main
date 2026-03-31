import { Waves } from "lucide-react";

export function OndaLogo({ size = "default" }: { size?: "default" | "small" }) {
  const iconSize = size === "small" ? 20 : 28;
  const textClass = size === "small" ? "text-lg" : "text-2xl";

  return (
    <div className="flex items-center gap-2">
      <div className="gradient-bg rounded-lg p-1.5">
        <Waves className="text-primary-foreground" size={iconSize} />
      </div>
      <span className={`font-display font-bold gradient-text ${textClass}`}>
        Onda Finance
      </span>
    </div>
  );
}
