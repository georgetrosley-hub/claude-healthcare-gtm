"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  BrainCircuit,
  Building2,
  CircleDollarSign,
  Code2,
  Cog,
  Headphones,
  Laptop2,
  Network,
  Package,
  Scale,
  ShieldCheck,
  Boxes,
} from "lucide-react";
import { ClaudeSparkle } from "@/components/ui/claude-logo";
import { cn } from "@/lib/utils";
import type { OrgNode } from "@/types";

interface OrgNodeCardProps {
  node: OrgNode;
  index?: number;
  className?: string;
  rank?: number;
  onGeneratePitch?: () => void;
}

const departmentIcons: Record<string, LucideIcon> = {
  Engineering: Code2,
  "Platform Engineering": Boxes,
  Security: ShieldCheck,
  IT: Laptop2,
  Finance: CircleDollarSign,
  Legal: Scale,
  Operations: Cog,
  "Customer Support": Headphones,
  Product: Package,
  "Data / AI": BrainCircuit,
  "Executive Leadership": Building2,
};

const statusStyles: Record<
  OrgNode["status"],
  {
    label: string;
    badge: string;
    accent: string;
    iconTone: string;
    meter: string;
    card: string;
  }
> = {
  latent: {
    label: "Latent",
    badge: "border-white/10 bg-white/5 text-text-muted",
    accent: "from-white/30 via-white/10 to-transparent",
    iconTone: "border-white/10 bg-white/5 text-text-muted",
    meter: "bg-white/25",
    card: "border-white/5 bg-surface-elevated/55",
  },
  identified: {
    label: "Identified",
    badge: "border-sky-400/15 bg-sky-400/10 text-sky-200",
    accent: "from-sky-300/70 via-sky-300/20 to-transparent",
    iconTone: "border-sky-400/15 bg-sky-400/10 text-sky-200",
    meter: "bg-sky-300/70",
    card: "border-sky-400/10 bg-surface-elevated/62",
  },
  engaged: {
    label: "Engaged",
    badge: "border-claude-coral/15 bg-claude-coral/10 text-claude-coral/90",
    accent: "from-claude-coral via-claude-coral/20 to-transparent",
    iconTone: "border-claude-coral/15 bg-claude-coral/10 text-claude-coral/90",
    meter: "bg-claude-coral/75",
    card: "border-claude-coral/12 bg-surface-elevated/68",
  },
  pilot: {
    label: "Pilot",
    badge: "border-emerald-400/15 bg-emerald-400/10 text-emerald-200",
    accent: "from-emerald-300 via-emerald-300/20 to-transparent",
    iconTone: "border-emerald-400/15 bg-emerald-400/10 text-emerald-200",
    meter: "bg-emerald-300/75",
    card: "border-emerald-400/12 bg-surface-elevated/72",
  },
  deployed: {
    label: "Deployed",
    badge: "border-violet-400/15 bg-violet-400/10 text-violet-200",
    accent: "from-violet-300 via-violet-300/20 to-transparent",
    iconTone: "border-violet-400/15 bg-violet-400/10 text-violet-200",
    meter: "bg-violet-300/75",
    card: "border-violet-400/12 bg-surface-elevated/72",
  },
};

export function OrgNodeCard({
  node,
  index = 0,
  className,
  rank,
  onGeneratePitch,
}: OrgNodeCardProps) {
  const isActive =
    node.status === "engaged" || node.status === "pilot" || node.status === "deployed";
  const Icon = departmentIcons[node.name] ?? Network;
  const style = statusStyles[node.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.02,
        duration: 0.45,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={cn(
        "group relative overflow-hidden rounded-[20px] border p-3 shadow-[0_24px_60px_rgba(0,0,0,0.12)] transition-all duration-300 sm:rounded-[24px] sm:p-4",
        style.card,
        isActive && "shadow-[0_24px_70px_rgba(218,119,86,0.12)]",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-80",
          style.accent
        )}
      />

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
            style.iconTone
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {rank ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-text-faint">
                    #{rank} priority
                  </span>
                ) : null}
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]", style.badge)}>
                  {style.label}
                </span>
              </div>

              <h3
                className={cn(
                  "mt-3 text-[15px] font-semibold leading-snug",
                  isActive ? "text-text-primary" : "text-text-secondary"
                )}
              >
                {node.name}
              </h3>
              <p className="mt-1 text-[12px] leading-relaxed text-text-muted">
                {node.useCase}
              </p>
            </div>

            {onGeneratePitch ? (
              <button
                onClick={onGeneratePitch}
                className="self-start rounded-full border border-claude-coral/15 bg-claude-coral/[0.08] p-2 text-claude-coral/80 transition-colors hover:bg-claude-coral/[0.14] sm:self-auto"
                title={`Generate expansion pitch for ${node.name}`}
              >
                <ClaudeSparkle size={12} />
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-black/10 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-faint">
                ARR potential
              </p>
              <p className={cn("mt-1 text-[14px] font-semibold tabular-nums", isActive ? "text-claude-coral" : "text-text-secondary")}>
                ${node.arrPotential.toFixed(2)}M
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-black/10 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-faint">
                Likelihood
              </p>
              <p className="mt-1 text-[14px] font-semibold tabular-nums text-text-secondary">
                {node.buyingLikelihood}%
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.08em] text-text-faint">
              <span>Momentum</span>
              <span>{node.buyingLikelihood}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className={cn("h-full rounded-full", style.meter)}
                style={{ width: `${Math.max(node.buyingLikelihood, 8)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 border-t border-white/5 pt-3">
            <p className="text-[10px] uppercase tracking-[0.08em] text-text-faint">
              Next move
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-text-secondary">
              {node.recommendedNextStep}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
