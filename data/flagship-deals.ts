/**
 * Deep deal context for flagship healthcare accounts: named progress, pilot criteria,
 * and competitive battle dynamics.
 */

export interface PilotCriteria {
  scope: string;
  successMetrics: string[];
  timeline: string;
  owner: string;
  securityPath: string;
}

export interface CompetitiveBattle {
  incumbent: string;
  displacementStrategy: string;
  keyRisk: string;
  winCondition: string;
}

export interface DealMilestone {
  label: string;
  date: string;
  status: "done" | "in_progress" | "upcoming";
  owner?: string;
}

export interface FlagshipDealContext {
  championName: string;
  championTitle: string;
  pilotCriteria: PilotCriteria;
  competitiveBattle: CompetitiveBattle;
  milestones: DealMilestone[];
  lastCallSummary?: string;
}

const flagshipDeals: Record<string, FlagshipDealContext> = {
  hss: {
    championName: "Dr. Sarah Chen",
    championTitle: "VP, Clinical Operations",
    pilotCriteria: {
      scope: "Clinical documentation and care coordination — Orthopedics and perioperative workflows. 40 clinicians. Internal doc retrieval, note prep. No PHI in pilot scope; Epic integration design in parallel.",
      successMetrics: [
        "Faster documentation turnaround (target 40% reduction)",
        "Governed access and audit trail validated by Legal",
        "Clinical governance sign-off before expansion",
      ],
      timeline: "90-day pilot, kickoff Apr 15. Legal and Clinical Governance sign-off required before start.",
      owner: "Sarah Chen (Clinical Ops) + Legal, Clinical Governance",
      securityPath: "HIPAA-aligned deployment. Data residency US. Full audit logging. No Epic validated paths in pilot.",
    },
    competitiveBattle: {
      incumbent: "Microsoft Copilot, Epic-integrated tools, manual workflows",
      displacementStrategy: "Position Claude as governed AI for clinical documentation. Safe choice for orthopedics. Land with narrow use case before broad EHR integration.",
      keyRisk: "Legal and clinical governance slow the deal. Need proof package they can forward internally.",
      winCondition: "Clinical Ops gets working pilot. Legal and governance comfortable. Expands to OR docs and patient communications.",
    },
    milestones: [
      { label: "Intro with Clinical Ops", date: "Mar 10", status: "done", owner: "AE" },
      { label: "Pilot scope draft shared", date: "Mar 18", status: "done", owner: "Sarah Chen" },
      { label: "Legal & Clinical Governance review", date: "Apr 5", status: "in_progress", owner: "Legal" },
      { label: "Pilot kickoff", date: "Apr 15", status: "upcoming", owner: "Sarah Chen" },
      { label: "90-day review gate", date: "Jul 15", status: "upcoming" },
    ],
    lastCallSummary: "Sarah is aligned. Clinical documentation angle resonates. Legal and governance want explicit deployment narrative. Next: package security and HIPAA story for their review.",
  },
  "penn-medicine": {
    championName: "Dr. James Okonkwo",
    championTitle: "Director, Clinical Informatics",
    pilotCriteria: {
      scope: "Ambient documentation and clinical scribe — Pilot with select ambulatory and inpatient teams. Epic-integrated workflow design. 35 physicians. No research/IRB data in pilot.",
      successMetrics: [
        "Reduced documentation time (target 30% reduction)",
        "Epic integration path validated by IT and Clinical",
        "Academic governance and IRB alignment documented",
      ],
      timeline: "75-day pilot, target start Apr 22. Security and Epic change control required.",
      owner: "James Okonkwo (Clinical Informatics) + IT, Clinical Governance",
      securityPath: "HIPAA, data residency, Epic change control. No research data in pilot.",
    },
    competitiveBattle: {
      incumbent: "Microsoft Nuance DAX, internal tools, Epic ecosystem",
      displacementStrategy: "Position as best-of-breed ambient AI with strong governance. Land with ambulatory pilot before system-wide evaluation.",
      keyRisk: "Nuance and Epic relationship may favor bundled option. Need clear differentiation on quality and control.",
      winCondition: "Clinical Informatics adopts Claude for pilot. Epic path validated. Expands to more service lines and research support.",
    },
    milestones: [
      { label: "Clinical Informatics intro", date: "Mar 8", status: "done", owner: "AE" },
      { label: "Pilot scope agreed", date: "Mar 20", status: "in_progress", owner: "James Okonkwo" },
      { label: "Security & Epic review", date: "Apr 10", status: "upcoming", owner: "IT" },
      { label: "Pilot kickoff", date: "Apr 22", status: "upcoming", owner: "James Okonkwo" },
      { label: "75-day review", date: "Jul 6", status: "upcoming" },
    ],
    lastCallSummary: "James wants ambient documentation. Nuance is in play. Security wants HIPAA and Epic clarity. Governance narrative is the hook.",
  },
};

export function getFlagshipDealContext(accountId: string): FlagshipDealContext | null {
  return flagshipDeals[accountId] ?? null;
}

export function isFlagshipAccount(accountId: string): boolean {
  return accountId in flagshipDeals;
}
