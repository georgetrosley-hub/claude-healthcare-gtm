"use client";

import { motion } from "framer-motion";
import { Activity, Radar, ShieldCheck } from "lucide-react";
import { ClaudeActionBar } from "@/components/ui/claude-action-bar";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";
import type { Account, AccountSignal, Competitor } from "@/types";

interface SignalsProps {
  account: Account;
  competitors: Competitor[];
  signals: AccountSignal[];
  onUpdateSignalDisposition: (
    signalId: string,
    disposition: AccountSignal["disposition"]
  ) => void;
}

const priorityStyles = {
  critical: "border-rose-400/20 bg-rose-500/[0.10] text-rose-300",
  high: "border-claude-coral/20 bg-claude-coral/[0.08] text-claude-coral/90",
  medium: "border-sky-400/20 bg-sky-400/[0.08] text-sky-300",
  low: "border-white/10 bg-white/[0.04] text-text-secondary",
} as const;

const dispositionStyles: Record<AccountSignal["disposition"], string> = {
  watch: "border-white/10 bg-white/[0.04] text-text-secondary",
  validated: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
  challenged: "border-rose-400/20 bg-rose-500/[0.10] text-rose-300",
};

export function Signals({
  account,
  competitors,
  signals,
  onUpdateSignalDisposition,
}: SignalsProps) {
  const averageConfidence = Math.round(
    signals.reduce((total, signal) => total + signal.confidence, 0) / signals.length
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="space-y-8 sm:space-y-10"
    >
      <SectionHeader
        title="Deal signals"
        subtitle="The hypotheses I would pressure-test in discovery, pilot design, security review, and executive conversations."
      />

      <ClaudeActionBar
        title="Ask Claude from inside the signal desk"
        subtitle="Use Claude to challenge assumptions, generate discovery questions, and sharpen the competitive point of view."
        account={account}
        competitors={competitors}
        actions={[
          {
            id: "pressure-test",
            label: "Pressure-test assumptions",
            prompt: `Challenge my current deal assumptions for ${account.name}. Tell me which hypotheses are weak, what evidence I need, and what questions I should ask next.`,
          },
          {
            id: "discovery-questions",
            label: "Discovery questions",
            prompt: `Give me the best discovery questions to validate the current deal hypotheses for ${account.name}, especially around champion strength, pilot value, competitive threat, and security blockers.`,
          },
          {
            id: "competitor-memo",
            label: "Competitor memo",
            prompt: `Write a concise competitor memo for ${account.name}: who the most dangerous competitor is, how they will position, and how I should keep the deal focused on where Claude wins.`,
          },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-claude-coral/20 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Activity className="h-4 w-4 text-claude-coral/75" strokeWidth={1.8} />
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
              Working hypotheses
            </p>
          </div>
          <p className="mt-3 text-[28px] font-semibold tracking-tight text-text-primary">
            {signals.length}
          </p>
        </div>
        <div className="rounded-[24px] border border-claude-coral/20 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Radar className="h-4 w-4 text-claude-coral/75" strokeWidth={1.8} />
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
              Conviction level
            </p>
          </div>
          <p className="mt-3 text-[28px] font-semibold tracking-tight text-text-primary">
            {averageConfidence}%
          </p>
        </div>
        <div className="rounded-[24px] border border-claude-coral/20 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <ShieldCheck className="h-4 w-4 text-claude-coral/75" strokeWidth={1.8} />
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
              Use
            </p>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-text-secondary">
            These are starting points for capture planning, not claims of live telemetry from the account.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {signals.map((signal, index) => (
          <motion.article
            key={signal.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
            className="rounded-[28px] border border-claude-coral/20 bg-white/[0.02] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] ${priorityStyles[signal.priority]}`}
                  >
                    {signal.priority}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] ${dispositionStyles[signal.disposition]}`}
                  >
                    {signal.disposition}
                  </span>
                  <span className="text-[11px] text-text-faint">
                    {signal.sourceType} · {signal.sourceLabel} · {signal.sourceFreshness}
                  </span>
                </div>
                <p className="mt-3 text-[16px] font-medium text-text-primary">{signal.title}</p>
              </div>
              <div className="px-1 py-1 text-right">
                <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Confidence</p>
                <p className="mt-2 text-[16px] font-medium text-text-primary">{signal.confidence}%</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
              <div>
                <p className="text-[13px] leading-relaxed text-text-secondary">
                  {signal.summary}
                </p>
                <p className="mt-4 text-[12px] font-medium text-claude-coral/85">
                  {signal.recommendedAction}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Owner</p>
                <p className="mt-1 text-[13px] font-medium text-text-primary">{signal.owner}</p>
                <p className="mt-4 text-[10px] uppercase tracking-[0.12em] text-text-faint">Impact</p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{signal.impact}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["watch", "validated", "challenged"] as const).map((disposition) => (
                <button
                  key={disposition}
                  type="button"
                  onClick={() => onUpdateSignalDisposition(signal.id, disposition)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12px] transition-colors",
                    signal.disposition === disposition
                      ? "border-claude-coral/20 bg-claude-coral/[0.10] text-claude-coral"
                      : "border-white/10 bg-white/[0.04] text-text-secondary hover:bg-white/[0.06]"
                  )}
                >
                  Mark {disposition}
                </button>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
