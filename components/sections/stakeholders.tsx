"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Handshake, ShieldAlert, Star, Users } from "lucide-react";
import { ClaudeActionBar } from "@/components/ui/claude-action-bar";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";
import type { Account, Competitor, Stakeholder } from "@/types";

interface StakeholdersProps {
  account: Account;
  competitors: Competitor[];
  stakeholders: Stakeholder[];
  onUpdateStakeholderStance: (stakeholderId: string, stance: Stakeholder["stance"]) => void;
}

const stanceStyles: Record<Stakeholder["stance"], string> = {
  champion: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300",
  ally: "border-sky-400/20 bg-sky-400/[0.08] text-sky-300",
  neutral: "border-white/10 bg-white/[0.04] text-text-secondary",
  blocker: "border-rose-400/20 bg-rose-500/[0.10] text-rose-300",
  executive: "border-claude-coral/20 bg-claude-coral/[0.08] text-claude-coral/90",
};

export function Stakeholders({
  account,
  competitors,
  stakeholders,
  onUpdateStakeholderStance,
}: StakeholdersProps) {
  const [pendingStance, setPendingStance] = useState<Record<string, Stakeholder["stance"]>>({});

  const champions = stakeholders.filter((stakeholder) => stakeholder.stance === "champion" || stakeholder.stance === "ally");
  const blockers = stakeholders.filter((stakeholder) => stakeholder.stance === "blocker");
  const executiveCount = stakeholders.filter((stakeholder) => stakeholder.stance === "executive").length;

  const handleStanceClick = (stakeholderId: string, stance: Stakeholder["stance"], currentStance: Stakeholder["stance"]) => {
    if (stance === currentStance) {
      setPendingStance((prev) => {
        const next = { ...prev };
        delete next[stakeholderId];
        return next;
      });
    } else {
      setPendingStance((prev) => ({ ...prev, [stakeholderId]: stance }));
    }
  };

  const handleSaveStance = (stakeholderId: string, stance: Stakeholder["stance"]) => {
    onUpdateStakeholderStance(stakeholderId, stance);
    setPendingStance((prev) => {
      const next = { ...prev };
      delete next[stakeholderId];
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="space-y-8 sm:space-y-10"
    >
      <SectionHeader
        title="Stakeholder map"
        subtitle="The relationship plan I would build around the first wedge. This is a working map, not a claimed source-of-truth org chart."
      />

      <ClaudeActionBar
        title="Ask Claude from inside the stakeholder map"
        subtitle="Use Claude to help multi-thread the account, coach the champion, and prep internal influence paths."
        account={account}
        competitors={competitors}
        actions={[
          {
            id: "champion-plan",
            label: "Champion plan",
            prompt: `Based on the current stakeholder map for ${account.name}, tell me how I should build and coach the likely champion, what proof they need, and what they should say internally.`,
          },
          {
            id: "multi-thread",
            label: "Multi-thread strategy",
            prompt: `For ${account.name}, tell me who I should multi-thread next beyond the current stakeholder map and how I should sequence those conversations.`,
          },
          {
            id: "sponsor-note",
            label: "Write sponsor note",
            prompt: `Draft an internal-style note I could send to an executive sponsor at ${account.name} to summarize the first wedge, the pilot logic, and the business case for moving now.`,
          },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-claude-coral/20 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Users className="h-4 w-4 text-claude-coral/75" strokeWidth={1.8} />
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
              Mapped threads
            </p>
          </div>
          <p className="mt-3 text-[28px] font-semibold tracking-tight text-text-primary">
            {stakeholders.length}
          </p>
        </div>
        <div className="rounded-[24px] border border-claude-coral/20 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Handshake className="h-4 w-4 text-claude-coral/75" strokeWidth={1.8} />
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
              Champion paths
            </p>
          </div>
          <p className="mt-3 text-[28px] font-semibold tracking-tight text-text-primary">
            {champions.length}
          </p>
        </div>
        <div className="rounded-[24px] border border-claude-coral/20 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Star className="h-4 w-4 text-claude-coral/75" strokeWidth={1.8} />
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
              Executive coverage
            </p>
          </div>
          <p className="mt-3 text-[28px] font-semibold tracking-tight text-text-primary">
            {executiveCount}
          </p>
        </div>
        <div className="rounded-[24px] border border-claude-coral/20 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <ShieldAlert className="h-4 w-4 text-claude-coral/75" strokeWidth={1.8} />
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
              Likely blockers
            </p>
          </div>
          <p className="mt-3 text-[28px] font-semibold tracking-tight text-text-primary">
            {blockers.length}
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {stakeholders.map((stakeholder, index) => (
          <motion.article
            key={stakeholder.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
            className="rounded-[28px] border border-claude-coral/20 bg-white/[0.02] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[16px] font-medium text-text-primary">{stakeholder.name}</p>
                <p className="mt-1 text-[13px] text-text-secondary">
                  {stakeholder.title} · {stakeholder.team}
                </p>
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] ${stanceStyles[pendingStance[stakeholder.id] ?? stakeholder.stance]}`}
              >
                {pendingStance[stakeholder.id] ?? stakeholder.stance}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-faint">Influence</p>
                <p className="mt-1 text-[13px] font-medium capitalize text-text-primary">
                  {stakeholder.influence}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-faint">Relationship</p>
                <p className="mt-1 text-[13px] font-medium text-text-primary">
                  {stakeholder.relationshipStrength}/100
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-faint">Last touch</p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  {stakeholder.lastTouch}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-faint">Proof needed</p>
                <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                  {stakeholder.proofNeeded}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-faint">Next step</p>
              <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                {stakeholder.nextStep}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-faint">Recent moment</p>
              <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                {stakeholder.recentMoment}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {(["champion", "ally", "neutral", "blocker"] as const).map((stance) => {
                const displayedStance = pendingStance[stakeholder.id] ?? stakeholder.stance;
                const isSelected = displayedStance === stance;
                return (
                  <button
                    key={stance}
                    type="button"
                    onClick={() => handleStanceClick(stakeholder.id, stance, stakeholder.stance)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[12px] transition-colors",
                      isSelected
                        ? "border-claude-coral/20 bg-claude-coral/[0.10] text-claude-coral"
                        : "border-white/10 bg-white/[0.04] text-text-secondary hover:bg-white/[0.06]"
                    )}
                  >
                    {stance}
                  </button>
                );
              })}
              {pendingStance[stakeholder.id] != null && pendingStance[stakeholder.id] !== stakeholder.stance && (
                <button
                  type="button"
                  onClick={() => handleSaveStance(stakeholder.id, pendingStance[stakeholder.id]!)}
                  className="rounded-full border-2 border-claude-coral/40 bg-claude-coral/15 px-3 py-1.5 text-[12px] font-medium text-claude-coral transition-colors hover:bg-claude-coral/25"
                >
                  Save
                </button>
              )}
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-text-muted">
              {stakeholder.note}
            </p>
            <p className="mt-3 text-[13px] font-semibold text-text-primary">
              Risk: <span className="text-rose-500">{stakeholder.risk}</span>
            </p>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}
