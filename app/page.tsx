"use client";

import { useEffect, useState } from "react";
import { AppProvider, useApp } from "@/app/context/app-context";
import { Sidebar, type SectionId } from "@/components/layout/sidebar";
import { StatusBar } from "@/components/layout/status-bar";
import { ChatPanel } from "@/components/layout/chat-panel";
import { CommandCenter } from "@/components/sections/command-center";
import { LiveAgentFeed } from "@/components/sections/live-agent-feed";
import { OrgExpansionMap } from "@/components/sections/org-expansion-map";
import { CompetitiveBattlefield } from "@/components/sections/competitive-battlefield";
import { ArchitectureSecurity } from "@/components/sections/architecture-security";
import { DealTimeline } from "@/components/sections/deal-timeline";
import { ApprovalQueue } from "@/components/sections/approval-queue";
import { ExecutiveNarrative } from "@/components/sections/executive-narrative";
import { MeetingPrep } from "@/components/sections/meeting-prep";
import { EmailStudio } from "@/components/sections/email-studio";
import { ObjectionHandling } from "@/components/sections/objection-handling";
import { UseCaseLibrary } from "@/components/sections/use-case-library";
import { SecurityQA } from "@/components/sections/security-qa";
import { ROICalculator } from "@/components/sections/roi-calculator";
import { motion, AnimatePresence } from "framer-motion";

function MainContent() {
  const [activeSection, setActiveSection] = useState<SectionId>("command");
  const [chatOpen, setChatOpen] = useState(false);
  const {
    account,
    accounts,
    agents,
    events,
    approvals,
    orgNodes,
    competitors,
    dealStages,
    currentRecommendation,
    pipelineTarget,
    setAccountId,
    lastApprovedTitle,
    clearLastApproved,
    handleApprove,
    handleReject,
    handleModify,
  } = useApp();

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7605/ingest/623d59d1-98a2-437e-8e26-cbbf21853b65", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "b70088",
      },
      body: JSON.stringify({
        sessionId: "b70088",
        runId: "vercel-readiness-pass-2",
        hypothesisId: "H5",
        location: "app/page.tsx:MainContent",
        message: "Main page mounted",
        data: {
          accountId: account.id,
          activeSection,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [account.id, activeSection]);

  const forecastData = [
    { month: "M1", land: account.estimatedLandValue * 0.1, expansion: 0 },
    { month: "M3", land: account.estimatedLandValue * 0.4, expansion: account.estimatedExpansionValue * 0.05 },
    { month: "M6", land: account.estimatedLandValue * 0.8, expansion: account.estimatedExpansionValue * 0.2 },
    { month: "M9", land: account.estimatedLandValue, expansion: account.estimatedExpansionValue * 0.4 },
    { month: "M12", land: account.estimatedLandValue, expansion: account.estimatedExpansionValue * 0.7 },
  ];

  const estimatedArr = account.estimatedLandValue + orgNodes.reduce((s, n) => s + n.arrPotential, 0) * 0.3;
  const currentStage = dealStages.find((s) => s.current);
  const activeAgentsCount = agents.filter((a) => a.status !== "idle").length;
  const oversightStatus = approvals.some((a) => a.status === "pending") ? "active" as const : "idle" as const;

  const sections: Record<SectionId, React.ReactNode> = {
    command: (
      <CommandCenter
        account={account}
        agents={agents}
        competitors={competitors}
        currentRecommendation={currentRecommendation}
        forecastData={forecastData}
      />
    ),
    feed: (
      <LiveAgentFeed
        events={events}
        account={account}
        competitors={competitors}
      />
    ),
    competitive: (
      <CompetitiveBattlefield
        competitors={competitors}
        account={account}
      />
    ),
    meeting: (
      <MeetingPrep
        account={account}
        competitors={competitors}
      />
    ),
    email: (
      <EmailStudio
        account={account}
        competitors={competitors}
      />
    ),
    objection: (
      <ObjectionHandling
        account={account}
        competitors={competitors}
      />
    ),
    approval: (
      <ApprovalQueue
        approvals={approvals}
        lastApprovedTitle={lastApprovedTitle}
        clearLastApproved={clearLastApproved}
        onApprove={handleApprove}
        onReject={handleReject}
        onModify={handleModify}
      />
    ),
    org: (
      <OrgExpansionMap
        nodes={orgNodes}
        account={account}
        competitors={competitors}
      />
    ),
    timeline: <DealTimeline stages={dealStages} />,
    architecture: (
      <ArchitectureSecurity
        account={account}
        competitors={competitors}
      />
    ),
    usecases: (
      <UseCaseLibrary
        account={account}
        competitors={competitors}
      />
    ),
    security: (
      <SecurityQA
        account={account}
        competitors={competitors}
      />
    ),
    roi: (
      <ROICalculator
        account={account}
        competitors={competitors}
      />
    ),
    narrative: (
      <ExecutiveNarrative
        account={account}
        competitors={competitors}
      />
    ),
  };

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onOpenChat={() => setChatOpen(true)}
      />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(218,119,86,0.02),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(218,119,86,0.01),transparent_55%)]" />

        <StatusBar
          account={account}
          accounts={accounts}
          onAccountChange={setAccountId}
          pipelineTarget={pipelineTarget}
          estimatedArr={estimatedArr}
          dealStage={currentStage?.label ?? "Pilot design"}
          activeAgents={activeAgentsCount}
          oversightStatus={oversightStatus}
          onOpenChat={() => setChatOpen(true)}
        />
        <main className="relative flex-1 overflow-y-auto px-10 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={activeSection === "org" ? "mx-auto w-full max-w-[1600px]" : "mx-auto max-w-5xl"}
            >
              {sections[activeSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        account={account}
        competitors={competitors}
        activeSection={activeSection}
      />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
