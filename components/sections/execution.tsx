"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock3, PauseCircle, PlayCircle, ShieldCheck } from "lucide-react";
import { ClaudeActionBar } from "@/components/ui/claude-action-bar";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";
import { useToast } from "@/app/context/toast-context";
import { isStale } from "@/lib/deal-health";
import type { Account, Competitor, ExecutionItem } from "@/types";

interface ExecutionProps {
  account: Account;
  competitors: Competitor[];
  executionItems: ExecutionItem[];
  lastDecisionTitle: string | null;
  clearLastDecision: () => void;
  onApproveDecision: (itemId: string) => void;
  onDeferDecision: (itemId: string) => void;
  onUpdateExecutionStatus: (
    itemId: string,
    status: ExecutionItem["status"]
  ) => void;
}

const statusStyles: Record<ExecutionItem["status"], string> = {
  in_progress: "border-sky-400/20 bg-sky-400/[0.08] text-sky-300",
  ready: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
  blocked: "border-rose-400/20 bg-rose-500/[0.10] text-rose-300",
  complete: "border-white/10 bg-white/[0.05] text-text-secondary",
};

export function Execution({
  account,
  competitors,
  executionItems,
  lastDecisionTitle,
  clearLastDecision,
  onApproveDecision,
  onDeferDecision,
  onUpdateExecutionStatus,
}: ExecutionProps) {
  const { showToast } = useToast();
  const pendingDecisions = executionItems.filter(
    (item) => item.decisionRequired && item.decisionStatus === "pending"
  );

  const handleApprove = (itemId: string) => {
    onApproveDecision(itemId);
    showToast("Decision recorded");
  };

  const handleDefer = (itemId: string) => {
    onDeferDecision(itemId);
    showToast("Deferred");
  };

  useEffect(() => {
    if (!lastDecisionTitle) {
      return;
    }

    const timeout = setTimeout(clearLastDecision, 2500);
    return () => clearTimeout(timeout);
  }, [clearLastDecision, lastDecisionTitle]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="space-y-8 sm:space-y-10"
    >
      <SectionHeader
        title="Deal plan"
        subtitle="The sequence I would run: land the pilot, clear governance, tighten the executive story, start commercial work early, then expand."
      />

      <ClaudeActionBar
        title="Ask Claude from inside the deal plan"
        subtitle="Use Claude for mutual action planning, pilot design, and unblockers while you are actively running the deal."
        account={account}
        competitors={competitors}
        actions={[
          {
            id: "map",
            label: "Build MAP",
            prompt: `Build a mutual action plan for ${account.name} based on this first wedge: ${account.firstWedge}. Include pilot scope, security review, executive check-ins, commercial milestones, and expansion sequencing.`,
          },
          {
            id: "success-criteria",
            label: "Success criteria",
            prompt: `Write pilot success criteria for ${account.name} around ${account.firstWedge}. I need measurable outcomes, executive framing, and what proof points will unlock expansion.`,
          },
          {
            id: "unblock-plan",
            label: "Unblock risks",
            prompt: `Given these blockers at ${account.name}: ${account.topBlockers.join("; ")}, tell me how I should sequence conversations and materials to keep the deal moving.`,
          },
        ]}
      />

      <AnimatePresence>
        {lastDecisionTitle && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-3 rounded-[24px] border border-claude-coral/20 bg-claude-coral/[0.05] px-5 py-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-claude-coral/15">
              <Check className="h-4 w-4 text-claude-coral" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-text-primary">Decision recorded</p>
              <p className="text-[12px] text-text-secondary">{lastDecisionTitle}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {pendingDecisions.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-claude-coral/80" strokeWidth={1.8} />
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-claude-coral/70">
              Decisions I would force early
            </p>
          </div>
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {pendingDecisions.map((item) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-claude-coral/20 bg-white/[0.02] px-4 py-4"
              >
                <p className="text-[14px] font-medium text-text-primary">{item.title}</p>
                <p className="mt-2 text-[12px] text-text-muted">
                  {item.owner} · {item.dueLabel}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">
                  {item.detail}
                </p>
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Checkpoint</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                    {item.checkpoint}
                  </p>
                </div>
                {item.blockerDetail && (
                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-rose-400/90">Current blocker</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                      {item.blockerDetail}
                    </p>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="rounded-full border border-claude-coral/20 bg-claude-coral/[0.10] px-3 py-1.5 text-[12px] font-medium text-claude-coral"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDefer(item.id)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-text-secondary"
                  >
                    Defer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        {executionItems.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
            className="rounded-[28px] border border-claude-coral/20 bg-white/[0.02] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[16px] font-medium text-text-primary">{item.title}</p>
                <p className="mt-1 text-[12px] text-text-muted">
                  {item.phase} · {item.owner} · {item.dueLabel}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] ${statusStyles[item.status]}`}
              >
                {item.status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-text-secondary">
              {item.detail}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Checkpoint</p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  {item.checkpoint}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Last updated</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-[13px] leading-relaxed text-text-secondary">
                    {item.lastUpdated}
                  </p>
                  {isStale(item.lastUpdated) && (
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400/95">
                      Stale
                    </span>
                  )}
                </div>
              </div>
            </div>
            {item.blockerDetail && (
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-rose-400/90">Blocker detail</p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  {item.blockerDetail}
                </p>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {(["ready", "in_progress", "blocked", "complete"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onUpdateExecutionStatus(item.id, status)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12px] transition-colors",
                    item.status === status
                      ? "border-claude-coral/20 bg-claude-coral/[0.10] text-claude-coral"
                      : "border-white/10 bg-white/[0.04] text-text-secondary hover:bg-white/[0.06]"
                  )}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
            {item.decisionStatus === "approved" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-text-secondary">
                <PlayCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
                Approved and in motion
              </div>
            )}
            {item.decisionStatus === "deferred" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-text-secondary">
                <PauseCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
                Deferred for later review
              </div>
            )}
            {!item.decisionRequired && item.status === "in_progress" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-text-secondary">
                <Clock3 className="h-3.5 w-3.5" strokeWidth={1.8} />
                Active owner, active thread
              </div>
            )}
          </motion.article>
        ))}
      </section>
    </motion.div>
  );
}
