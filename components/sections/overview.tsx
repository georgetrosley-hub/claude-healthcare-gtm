"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BriefcaseBusiness, Crosshair, Users, Eye, CircleDot, Zap, Target } from "lucide-react";
import { ClaudeActionBar } from "@/components/ui/claude-action-bar";
import { SectionHeader } from "@/components/ui/section-header";
import { MetricCard } from "@/components/ui/metric-card";
import { ClaudeSparkle } from "@/components/ui/claude-logo";
import { getFlagshipDealContext } from "@/data/flagship-deals";
import { useToast } from "@/app/context/toast-context";
import { isStale, isStaleUpdate } from "@/lib/deal-health";
import type {
  Account,
  AccountSignal,
  AccountUpdate,
  Competitor,
  ExecutionItem,
  Stakeholder,
  WorkspaceDraft,
} from "@/types";
import type { DealHealthSummary } from "@/lib/deal-health";

function getTodayLabel() {
  const d = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

interface OverviewProps {
  account: Account;
  competitors: Competitor[];
  signals: AccountSignal[];
  stakeholders: Stakeholder[];
  executionItems: ExecutionItem[];
  accountUpdates: AccountUpdate[];
  workspaceDraft: WorkspaceDraft;
  pipelineTarget: number;
  currentRecommendation: string;
  dealHealth: DealHealthSummary;
  onUpdateWorkspaceField: (field: keyof WorkspaceDraft, value: string) => void;
  onAddAccountUpdate: (
    title: string,
    note: string,
    tag: AccountUpdate["tag"]
  ) => void;
}

export function Overview({
  account,
  competitors,
  signals,
  stakeholders,
  executionItems,
  accountUpdates,
  workspaceDraft,
  pipelineTarget,
  currentRecommendation,
  dealHealth,
  onUpdateWorkspaceField,
  onAddAccountUpdate,
}: OverviewProps) {
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateNote, setUpdateNote] = useState("");
  const [updateTag, setUpdateTag] = useState<AccountUpdate["tag"]>("internal");
  const saveToastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useToast();

  const handleWorkspaceFieldChange = useCallback(
    (field: keyof WorkspaceDraft, value: string) => {
      onUpdateWorkspaceField(field, value);
      if (saveToastRef.current) clearTimeout(saveToastRef.current);
      saveToastRef.current = setTimeout(() => {
        showToast("Saved");
        saveToastRef.current = null;
      }, 600);
    },
    [onUpdateWorkspaceField, showToast]
  );
  const topCompetitor = [...competitors].sort((a, b) => b.accountRiskLevel - a.accountRiskLevel)[0];
  const champion = stakeholders.find((stakeholder) => stakeholder.stance === "champion");
  const championCount = stakeholders.filter((stakeholder) => stakeholder.stance === "champion" || stakeholder.stance === "ally").length;
  const blockedCount = executionItems.filter((item) => item.status === "blocked").length;
  const thisWeek = executionItems.filter((item) => item.status === "in_progress" || item.status === "ready").slice(0, 3);
  const firstDecision = executionItems.find((item) => item.phase === "Land");
  const expansionItem = executionItems.find((item) => item.phase === "Expansion");
  const recentUpdates = accountUpdates.slice(0, 5);

  const handleAddUpdate = () => {
    onAddAccountUpdate(updateTitle, updateNote, updateTag);
    setUpdateTitle("");
    setUpdateNote("");
    setUpdateTag("internal");
    showToast("Update added");
  };

  const todayLabel = useMemo(() => getTodayLabel(), []);
  const topPriority = executionItems.find((i) => i.status === "blocked") ?? executionItems.find((i) => i.status === "in_progress");
  const lastUpdate = accountUpdates[0];
  const flagshipDeal = useMemo(() => getFlagshipDealContext(account.id), [account.id]);

  const blockedItems = executionItems.filter((i) => i.status === "blocked");
  const needsAttention = executionItems.filter(
    (i) => i.decisionRequired && i.decisionStatus === "pending"
  );
  const staleItems = executionItems.filter((i) => isStale(i.lastUpdated));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="space-y-10 sm:space-y-12"
    >
      {/* VP oversight — 30-second scan for Ryan */}
      <section className="rounded-2xl border border-claude-coral/20 bg-white/[0.02] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-text-faint" strokeWidth={1.8} />
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-faint">
            VP oversight · At a glance
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium ${
              dealHealth.status === "healthy"
                ? "bg-emerald-500/10 text-emerald-400/90"
                : dealHealth.status === "attention"
                  ? "bg-claude-coral/10 text-claude-coral/90"
                  : "bg-rose-500/10 text-rose-400/90"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                dealHealth.status === "healthy"
                  ? "bg-emerald-400"
                  : dealHealth.status === "attention"
                    ? "bg-claude-coral"
                    : "bg-rose-400"
              }`}
            />
            {dealHealth.label}
          </div>
          {blockedItems.length > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1.5 text-[12px] font-medium text-rose-400/95">
              <CircleDot className="h-3.5 w-3.5" />
              {blockedItems.length} blocker{blockedItems.length === 1 ? "" : "s"}
            </div>
          )}
          {needsAttention.length > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-claude-coral/10 px-3 py-1.5 text-[12px] font-medium text-claude-coral/90">
              {needsAttention.length} decision{needsAttention.length === 1 ? "" : "s"} pending
            </div>
          )}
          {staleItems.length > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-[12px] text-text-muted">
              {staleItems.length} stale
            </div>
          )}
        </div>
        <p className="mt-3 text-[12px] text-text-muted">{dealHealth.reason}</p>
      </section>

      {/* Today's workspace — compact status strip */}
      <section className="rounded-2xl border border-surface-border bg-surface-elevated p-5 sm:p-6 shadow-elevated">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
              {todayLabel} · {account.name}
            </p>
            <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
              Today&apos;s workspace
            </h1>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col rounded-xl border border-surface-border bg-surface-muted/50 px-4 py-3.5">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-text-muted" strokeWidth={2} />
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">This week</p>
            </div>
            <textarea
              value={workspaceDraft.thisWeekFocus}
              onChange={(e) => handleWorkspaceFieldChange("thisWeekFocus", e.target.value)}
              placeholder="e.g. Lock the pilot sponsor, define success criteria, schedule governance…"
              rows={2}
              className="mt-2.5 w-full resize-none border-none bg-transparent p-0 text-[14px] font-normal leading-relaxed text-text-muted placeholder:text-text-faint focus:outline-none focus:ring-0 focus:text-text-primary focus:placeholder:text-text-muted"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              const el = lastUpdate
                ? document.getElementById(`account-update-${lastUpdate.id}`)
                : document.getElementById("account-log");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="flex flex-col justify-center rounded-xl border border-surface-border bg-surface-muted/50 px-4 py-3.5 text-left transition-colors hover:bg-surface-muted/70"
          >
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-text-muted" strokeWidth={2} />
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Where I left off</p>
            </div>
            <p className="mt-2 text-[15px] font-bold text-text-primary">
              {lastUpdate?.title ?? "Daily account reset"}
            </p>
            <p className="mt-0.5 text-[13px] text-text-secondary">{lastUpdate?.createdAt ?? "Today"}</p>
          </button>
          <button
            type="button"
            onClick={() => {
              const inThisWeek = topPriority && thisWeek.some((i) => i.id === topPriority.id);
              const targetId = inThisWeek ? `execution-item-${topPriority!.id}` : "my-first-30-days";
              document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="flex flex-col justify-center rounded-xl border border-surface-border bg-surface-muted/50 px-4 py-3.5 text-left transition-colors hover:bg-surface-muted/70"
          >
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-text-muted" strokeWidth={2} />
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Today&apos;s priority</p>
            </div>
            <p className="mt-2 text-[15px] font-bold text-text-primary">
              {topPriority?.title ?? "Define the first pilot"}
            </p>
            <p className="mt-0.5 text-[13px] text-text-secondary">
              {topPriority?.owner ?? champion?.name} · {topPriority?.dueLabel ?? "This week"}
            </p>
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-text-faint">
          Capture plan · {account.name}
        </p>
        <div className="max-w-4xl space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            How I&apos;d build pipeline and expansion for Claude Enterprise inside {account.name}
          </h2>
          <p className="max-w-3xl text-[14px] leading-relaxed text-text-muted">
            First wedge, champion path, pilot design, executive alignment, competitive displacement, and the expansion story.
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Modeled pipeline"
          value={`$${pipelineTarget.toFixed(2)}M`}
          subtitle="Combined land motion plus near-term expansion path"
        />
        <MetricCard
          label="First pilot"
          value={`$${account.estimatedLandValue.toFixed(2)}M`}
          subtitle={account.firstWedge}
        />
        <MetricCard
          label="Expansion path"
          value={`$${account.estimatedExpansionValue.toFixed(2)}M`}
          subtitle={account.topExpansionPaths[0]}
        />
        <MetricCard
          label="Deal coverage"
          value={`${championCount} threads`}
          subtitle={`${blockedCount} blocker${blockedCount === 1 ? "" : "s"} need to be actively managed`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_380px]">
        <section className="rounded-[28px] border border-claude-coral/20 bg-white/[0.02] p-5 sm:p-6">
          <SectionHeader
            title="How I&apos;d run this account"
            subtitle="The capture-plan view: how I&apos;d create urgency, who I&apos;d build with, what pilot I&apos;d land, and how I&apos;d expand."
          />
          <div className="grid gap-6 xl:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Land motion</p>
              <p className="mt-3 text-[15px] font-medium text-text-primary">{account.firstWedge}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                I would keep the first sale narrow, measurable, and easy to sponsor internally. The goal is not to sell
                the whole platform first. The goal is to win a wedge that creates permission to expand.
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Champion building</p>
              <p className="mt-3 text-[15px] font-medium text-text-primary">
                {champion?.title ?? "Likely functional champion"}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                {champion?.note ?? "I would look for the operator with the most pain, the strongest urgency, and the most to gain from a successful pilot."}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Pilot strategy</p>
              <p className="mt-3 text-[15px] font-medium text-text-primary">
                {firstDecision?.title ?? "Define the first pilot"}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                {firstDecision?.detail ?? "I would define success criteria, owners, timeline, and the exact workflow before asking for broad executive support."}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Expansion path</p>
              <p className="mt-3 text-[15px] font-medium text-text-primary">
                {expansionItem?.title ?? account.topExpansionPaths[0]}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                I would name the second motion early so leadership sees this as a wedge into broader adoption, not a one-off tooling experiment.
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[28px] border border-claude-coral/15 bg-claude-coral/[0.05] p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ClaudeSparkle size={14} className="text-claude-coral" />
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-claude-coral/70">
                My current take
              </p>
            </div>
            <p className="mt-4 text-[16px] leading-relaxed text-text-primary">
              {currentRecommendation}
            </p>
          </div>

          <div className="rounded-[28px] border border-claude-coral/20 bg-white/[0.02] p-5">
            <div className="flex items-center gap-2 text-text-secondary">
              <Crosshair className="h-4 w-4 text-claude-coral/75" strokeWidth={1.8} />
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Competitive displacement
              </p>
            </div>
            <p className="mt-4 text-[14px] font-medium text-text-primary">
              {topCompetitor?.name ?? "Incumbent platform pressure"}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
              {topCompetitor
                ? `${topCompetitor.strengthAreas.slice(0, 2).join(" · ")}`
                : "The deal is most at risk when incumbent platforms make the customer default to convenience over quality."}
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-text-muted">
              I would not try to out-market the incumbent. I would force a narrower comparison around model quality,
              enterprise governance, and the specific workflow where Claude wins.
            </p>
          </div>
        </aside>
      </div>

      {flagshipDeal && (
        <section className="space-y-4">
          <SectionHeader
            title="Deal progress"
            subtitle={`Named champion, pilot criteria, and competitive battle for ${account.name}.`}
          />
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 space-y-6">
              <div className="rounded-[22px] border border-claude-coral/20 bg-white/[0.02] px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Champion</p>
                <p className="mt-2 text-[15px] font-medium text-text-primary">
                  {flagshipDeal.championName} · {flagshipDeal.championTitle}
                </p>
                {flagshipDeal.lastCallSummary && (
                  <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                    {flagshipDeal.lastCallSummary}
                  </p>
                )}
              </div>
              <div className="rounded-[22px] border border-claude-coral/20 bg-white/[0.02] px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Pilot criteria</p>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                  {flagshipDeal.pilotCriteria.scope}
                </p>
                <ul className="mt-3 space-y-1 text-[12px] text-text-muted">
                  {flagshipDeal.pilotCriteria.successMetrics.map((m, i) => (
                    <li key={i}>• {m}</li>
                  ))}
                </ul>
                <p className="mt-3 text-[12px] text-text-faint">
                  {flagshipDeal.pilotCriteria.timeline} · Owner: {flagshipDeal.pilotCriteria.owner}
                </p>
              </div>
              <div className="rounded-[22px] border border-claude-coral/20 bg-white/[0.02] px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Competitive battle</p>
                <p className="mt-2 text-[13px] font-medium text-text-primary">
                  Incumbent: {flagshipDeal.competitiveBattle.incumbent}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                  {flagshipDeal.competitiveBattle.displacementStrategy}
                </p>
                <p className="mt-3 text-[12px] text-claude-coral/80">
                  Win condition: {flagshipDeal.competitiveBattle.winCondition}
                </p>
              </div>
            </div>
            <div className="rounded-[22px] border border-claude-coral/20 bg-white/[0.02] px-4 py-4">
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-faint">Deal milestones</p>
              <div className="mt-4 space-y-3">
                {flagshipDeal.milestones.map((m, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className={`shrink-0 mt-0.5 h-2 w-2 rounded-full ${
                        m.status === "done"
                          ? "bg-emerald-500/80"
                          : m.status === "in_progress"
                            ? "bg-claude-coral/80"
                            : "bg-white/30"
                      }`}
                    />
                    <div>
                      <p className="text-[13px] font-medium text-text-primary">{m.label}</p>
                      <p className="text-[11px] text-text-muted">
                        {m.date}
                        {m.owner ? ` · ${m.owner}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
          <SectionHeader
            title="AE control board"
            subtitle="This is the editable layer: the account thesis, the win theme, the weekly focus, and the notes the rep actually lives in."
          />
          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Deal thesis
              </label>
              <textarea
                value={workspaceDraft.dealThesis}
                onChange={(event) => handleWorkspaceFieldChange("dealThesis", event.target.value)}
                rows={3}
                className="w-full resize-none rounded-[22px] border border-white/10 bg-black/10 px-4 py-3 text-[13px] leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:border-claude-coral/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Win theme
              </label>
              <textarea
                value={workspaceDraft.winTheme}
                onChange={(event) => handleWorkspaceFieldChange("winTheme", event.target.value)}
                rows={3}
                className="w-full resize-none rounded-[22px] border border-white/10 bg-black/10 px-4 py-3 text-[13px] leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:border-claude-coral/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                This week
              </label>
              <textarea
                value={workspaceDraft.thisWeekFocus}
                onChange={(event) => handleWorkspaceFieldChange("thisWeekFocus", event.target.value)}
                rows={2}
                placeholder="e.g. Lock pilot sponsor, define success criteria, schedule governance…"
                className="w-full resize-none rounded-[22px] border border-white/10 bg-black/10 px-4 py-3 text-[13px] font-normal leading-relaxed text-text-muted placeholder:text-text-faint focus:border-claude-coral/30 focus:outline-none focus:text-text-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Operator notes
              </label>
              <textarea
                value={workspaceDraft.operatorNotes}
                onChange={(event) => handleWorkspaceFieldChange("operatorNotes", event.target.value)}
                rows={4}
                className="w-full resize-none rounded-[22px] border border-white/10 bg-black/10 px-4 py-3 text-[13px] leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:border-claude-coral/30 focus:outline-none"
              />
            </div>
          </div>
        </section>

        <ClaudeActionBar
          title="Ask Claude inside the capture plan"
          subtitle="Use Claude as the AE&apos;s live operator, not just a separate utility. These requests are specific to the deal you&apos;re in."
          account={account}
          competitors={competitors}
          actions={[
            {
              id: "sharpen-thesis",
              label: "Sharpen thesis",
              prompt: `Rewrite my current deal thesis for ${account.name} so it sounds like a top enterprise AE's account strategy. Current thesis: ${workspaceDraft.dealThesis}`,
            },
            {
              id: "pilot-plan",
              label: "Write pilot plan",
              prompt: `Write a concrete first-pilot plan for ${account.name} around ${account.firstWedge}. Include sponsor, scope, success criteria, security path, and next executive step.`,
            },
            {
              id: "competitive-plan",
              label: "Pressure-test competitor",
              prompt: `Pressure-test my win theme for ${account.name}. Win theme: ${workspaceDraft.winTheme}. Tell me where it is weak, what the top competitor will say, and how I should tighten it.`,
            },
            {
              id: "weekly-attack-plan",
              label: "Build weekly attack plan",
              prompt: `Turn my current weekly focus into a practical attack plan for ${account.name}. Weekly focus: ${workspaceDraft.thisWeekFocus}. I want owners, sequence, and suggested messaging.`,
            },
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section id="account-log" className="space-y-4 p-0 scroll-mt-6">
          <SectionHeader
            title="Account log"
            subtitle="The place the AE tracks what happened, what changed, what slipped, and what to do next."
          />
          <div className="space-y-4">
            {recentUpdates.map((update) => (
              <div
                key={update.id}
                id={`account-update-${update.id}`}
                className="rounded-[22px] border border-claude-coral/20 bg-white/[0.02] px-4 py-4 scroll-mt-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] text-text-secondary">
                    {update.tag.replace("_", " ")}
                  </span>
                  <span className="text-[11px] text-text-faint">
                    {update.createdAt} · {update.author}
                  </span>
                  {isStaleUpdate(update.createdAt) && (
                    <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-400/95">
                      Stale
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[14px] font-medium text-text-primary">
                  {update.title}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                  {update.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
          <SectionHeader
            title="Update the account"
            subtitle="Drop in a real note the way a top AE would after a call, internal review, or competitive development."
          />
          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Update title
              </label>
              <input
                value={updateTitle}
                onChange={(event) => setUpdateTitle(event.target.value)}
                placeholder="e.g. Security team asked for a cleaner deployment story"
                className="w-full rounded-[18px] border border-white/10 bg-black/10 px-4 py-3 text-[13px] text-text-primary placeholder:text-text-muted/50 focus:border-claude-coral/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Update type
              </label>
              <div className="flex flex-wrap gap-2">
                {(["call", "internal", "risk", "next_step", "exec"] as const).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setUpdateTag(tag)}
                    className={`rounded-full border px-3 py-1.5 text-[12px] transition-colors ${
                      updateTag === tag
                        ? "border-claude-coral/20 bg-claude-coral/[0.10] text-claude-coral"
                        : "border-white/10 bg-white/[0.04] text-text-secondary hover:bg-white/[0.06]"
                    }`}
                  >
                    {tag.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Notes
              </label>
              <textarea
                value={updateNote}
                onChange={(event) => setUpdateNote(event.target.value)}
                rows={6}
                placeholder="What happened, what it means, and what you need to do next..."
                className="w-full resize-none rounded-[22px] border border-white/10 bg-black/10 px-4 py-3 text-[13px] leading-relaxed text-text-primary placeholder:text-text-muted/50 focus:border-claude-coral/30 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddUpdate}
              disabled={!updateTitle.trim() || !updateNote.trim()}
              className="w-fit rounded-full border border-claude-coral/20 bg-claude-coral/[0.10] px-4 py-2 text-[13px] font-medium text-claude-coral disabled:opacity-50"
            >
              Add account update
            </button>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section id="my-first-30-days" className="space-y-4 scroll-mt-6">
          <div className="flex items-center gap-2">
            <BriefcaseBusiness className="h-4 w-4 text-claude-coral/75" strokeWidth={1.8} />
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
              My first 30 days
            </p>
          </div>
          <div className="mt-5 space-y-3">
            {thisWeek.map((item) => (
              <div
                key={item.id}
                id={`execution-item-${item.id}`}
                className="flex items-start gap-3 rounded-[22px] border border-claude-coral/20 bg-white/[0.02] px-4 py-4 scroll-mt-6"
              >
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-claude-coral/70" strokeWidth={1.8} />
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-text-primary">{item.title}</p>
                  <p className="mt-1 text-[12px] text-text-muted">
                    {item.owner} · {item.dueLabel}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-claude-coral/75" strokeWidth={1.8} />
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
              Risks I&apos;d actively close
            </p>
          </div>
          <div className="mt-5 space-y-3">
            {account.topBlockers.slice(0, 3).map((blocker) => (
              <div
                key={blocker}
                className="rounded-[22px] border border-claude-coral/20 bg-white/[0.02] px-4 py-4"
              >
                <p className="text-[13px] leading-relaxed text-text-secondary">{blocker}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[22px] border border-claude-coral/20 bg-white/[0.02] px-4 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-claude-coral/75" strokeWidth={1.8} />
              <p className="text-[12px] font-medium text-text-primary">Executive path I&apos;d run</p>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
              Use {account.executiveSponsors.slice(0, 2).join(" and ")} to frame the first pilot as a safe wedge,
              not a broad platform replacement.
            </p>
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <SectionHeader
          title="Account hypotheses I would pressure-test"
          subtitle="These are not claimed facts from a live CRM. They are the initial hypotheses I would bring into discovery, stakeholder mapping, and the first pilot cycle."
        />
        <div className="space-y-4">
          {signals.slice(0, 3).map((signal) => (
            <div
              key={signal.id}
              className="rounded-[22px] border border-claude-coral/20 bg-white/[0.02] px-4 py-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] text-text-faint">
                  {signal.priority}
                </span>
                <span className="text-[11px] text-text-faint">
                  {signal.sourceLabel} · {signal.sourceFreshness}
                </span>
              </div>
              <p className="mt-3 text-[15px] font-medium text-text-primary">{signal.title}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                {signal.summary}
              </p>
              <p className="mt-3 text-[12px] leading-relaxed text-claude-coral/80">
                {signal.recommendedAction}
              </p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
