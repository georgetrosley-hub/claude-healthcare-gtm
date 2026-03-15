import type {
  SimulationEvent,
  EventType,
  PriorityLevel,
  Agent,
  ApprovalRequest,
  OrgNode,
} from "@/types";
import { accounts } from "@/data/accounts";

type EventTemplate = {
  type: EventType;
  agentName: string;
  priority: PriorityLevel;
  title: string;
  explanation: string;
  recommendedAction?: string;
  operationalPhrase?: string;
};

const EVENT_TEMPLATES: Record<string, EventTemplate[]> = {
  hss: [
    { type: "research_signal", agentName: "Research Agent", priority: "high", title: "Opportunity detected", explanation: "Clinical Ops evaluating documentation and care coordination. Epic integration in scope.", recommendedAction: "Engage Clinical Ops leadership", operationalPhrase: "opportunity detected in clinical ops" },
    { type: "champion_identified", agentName: "Research Agent", priority: "high", title: "Champion identified", explanation: "VP Clinical Ops interested in pilot for documentation with governed AI.", recommendedAction: "Prepare pilot proposal", operationalPhrase: "champion identified" },
    { type: "competitor_detected", agentName: "Competitive Strategy Agent", priority: "high", title: "Competitive pressure elevated", explanation: "Microsoft Copilot and Epic tools in the mix.", recommendedAction: "Differentiate on governance and safety", operationalPhrase: "competitive pressure elevated" },
    { type: "security_blocker", agentName: "Security and Compliance Agent", priority: "high", title: "Legal and governance review recommended", explanation: "Legal and Clinical Governance want narrative before pilot.", recommendedAction: "Package HIPAA and audit story", operationalPhrase: "governance review recommended" },
    { type: "expansion_path", agentName: "Expansion Strategy Agent", priority: "medium", title: "Expansion path identified", explanation: "OR docs and patient communications could benefit.", recommendedAction: "Map clinical and IT leadership", operationalPhrase: "expansion path identified" },
  ],
  "penn-medicine": [
    { type: "research_signal", agentName: "Research Agent", priority: "high", title: "Opportunity detected", explanation: "Clinical Informatics wants ambient documentation and scribe.", recommendedAction: "Engage Clinical Informatics", operationalPhrase: "opportunity detected in clinical informatics" },
    { type: "champion_identified", agentName: "Research Agent", priority: "high", title: "Champion identified", explanation: "Director Clinical Informatics interested in ambient scribe pilot.", recommendedAction: "Draft pilot scope with Epic path", operationalPhrase: "champion identified" },
    { type: "competitor_detected", agentName: "Competitive Strategy Agent", priority: "medium", title: "Competitive pressure", explanation: "Nuance DAX and Epic ecosystem. Land with best-of-breed governance.", recommendedAction: "Position on quality and control", operationalPhrase: "competitive pressure" },
    { type: "security_blocker", agentName: "Security and Compliance Agent", priority: "high", title: "Epic and HIPAA review", explanation: "Security wants Epic change control and data residency clarity.", recommendedAction: "Prepare deployment narrative", operationalPhrase: "security review recommended" },
  ],
  chop: [
    { type: "research_signal", agentName: "Research Agent", priority: "high", title: "Opportunity detected", explanation: "Pediatric clinical documentation and family engagement use cases.", recommendedAction: "Engage Clinical and Family Experience", operationalPhrase: "opportunity detected in pediatric workflows" },
    { type: "champion_identified", agentName: "Research Agent", priority: "high", title: "Champion identified", explanation: "Clinical leadership interested in governed AI for documentation.", recommendedAction: "Scope pilot with privacy guardrails", operationalPhrase: "champion identified" },
    { type: "security_blocker", agentName: "Security and Compliance Agent", priority: "high", title: "Privacy and clinical review", explanation: "Pediatric and family data privacy requirements need mapping.", recommendedAction: "Document compliance and governance", operationalPhrase: "privacy review recommended" },
  ],
  "northwell-health": [
    { type: "research_signal", agentName: "Research Agent", priority: "high", title: "Opportunity detected", explanation: "Large system evaluating clinical docs and operational efficiency.", recommendedAction: "Engage system leadership", operationalPhrase: "opportunity detected" },
    { type: "champion_identified", agentName: "Research Agent", priority: "high", title: "Champion identified", explanation: "Operational and clinical leaders interested in pilot.", recommendedAction: "Define narrow pilot for standardization", operationalPhrase: "champion identified" },
    { type: "security_blocker", agentName: "Security and Compliance Agent", priority: "high", title: "Procurement and governance review", explanation: "Multi-site deployment and Epic governance required.", recommendedAction: "Align on security and change control", operationalPhrase: "governance review" },
  ],
  ibx: [
    { type: "research_signal", agentName: "Research Agent", priority: "medium", title: "Opportunity detected", explanation: "Member services and claims support exploring AI workflows.", recommendedAction: "Engage Member Services and Compliance" },
    { type: "legal_review", agentName: "Legal and Procurement Agent", priority: "high", title: "Legal review recommended", explanation: "State insurance and DOI considerations for AI-assisted member workflows.", recommendedAction: "Prepare compliance package", operationalPhrase: "legal review recommended" },
    { type: "security_blocker", agentName: "Security and Compliance Agent", priority: "high", title: "Compliance review recommended", explanation: "Member data and HIPAA requirements need mapping.", recommendedAction: "Document compliance requirements", operationalPhrase: "compliance review recommended" },
    { type: "expansion_path", agentName: "Expansion Strategy Agent", priority: "medium", title: "Expansion path identified", explanation: "Claims and care management could benefit.", recommendedAction: "Map claims and quality leadership", operationalPhrase: "expansion path identified" },
  ],
};

const APPROVAL_TEMPLATES: Record<string, { title: string; reason: string; agent: string; impact: string; risk: "low" | "medium" | "high" }[]> = {
  hss: [
    { title: "Launch clinical documentation pilot with Clinical Ops", reason: "Champion aligned; Legal and governance review in progress.", agent: "Human Oversight Agent", impact: "$1.2M land, path to expansion", risk: "medium" },
    { title: "Package governance narrative for Legal and Clinical Governance", reason: "Required before pilot approval.", agent: "Human Oversight Agent", impact: "Unblocks pilot timeline", risk: "low" },
    { title: "Build executive brief for CIO", reason: "Executive alignment needed for Epic integration path.", agent: "Human Oversight Agent", impact: "Moves decision forward", risk: "low" },
  ],
  "penn-medicine": [
    { title: "Launch ambient scribe pilot", reason: "Champion aligned; Epic and security review in progress.", agent: "Human Oversight Agent", impact: "$2.2M land, path to expansion", risk: "medium" },
    { title: "Schedule Epic and security review", reason: "Required before pilot.", agent: "Human Oversight Agent", impact: "Unblocks pilot", risk: "low" },
  ],
  chop: [
    { title: "Launch pediatric documentation pilot", reason: "Clinical leadership interested. Privacy review in parallel.", agent: "Human Oversight Agent", impact: "$1.5M land, path to expansion", risk: "medium" },
    { title: "Prepare privacy and clinical governance package", reason: "Key for pediatric and family data.", agent: "Human Oversight Agent", impact: "Accelerates pilot", risk: "low" },
  ],
  "northwell-health": [
    { title: "Launch clinical docs pilot", reason: "Champion aligned; procurement and standardization in review.", agent: "Human Oversight Agent", impact: "$2M land, path to expansion", risk: "medium" },
    { title: "Initiate security and Epic change control review", reason: "Multi-site deployment requirements.", agent: "Human Oversight Agent", impact: "Unblocks deployment", risk: "medium" },
  ],
  ibx: [
    { title: "Run Member Services pilot", reason: "Member and claims support workflows pilot.", agent: "Human Oversight Agent", impact: "$1.8M land, path to expansion", risk: "medium" },
    { title: "Initiate DOI and compliance review", reason: "State insurance and member data considerations.", agent: "Human Oversight Agent", impact: "Unblocks deployment", risk: "medium" },
  ],
  default: [
    { title: "Launch pilot", reason: "Champion aligned; pilot scope defined.", agent: "Human Oversight Agent", impact: "Unblocks expansion path", risk: "medium" },
    { title: "Schedule security architecture review", reason: "Required before pilot approval.", agent: "Human Oversight Agent", impact: "Unblocks timeline", risk: "low" },
  ],
};

let eventId = 0;
let approvalId = 0;

function getEventTemplates(accountId: string): EventTemplate[] {
  return EVENT_TEMPLATES[accountId] ?? EVENT_TEMPLATES.hss;
}

function getApprovalTemplates(accountId: string) {
  return APPROVAL_TEMPLATES[accountId] ?? APPROVAL_TEMPLATES.default;
}

function deterministicIndex(seed: number, max: number): number {
  return Math.floor(((seed * 9301 + 49297) % 233280) / 233280 * max);
}

export function generateEvent(accountId: string, tick: number): SimulationEvent | null {
  const templates = getEventTemplates(accountId);
  const idx = deterministicIndex(tick, templates.length);
  const t = templates[idx];
  if (!t) return null;
  eventId++;
  return {
    id: `evt-${eventId}`,
    timestamp: new Date(),
    agentName: t.agentName,
    priority: t.priority,
    type: t.type,
    title: t.title,
    explanation: t.explanation,
    recommendedAction: t.recommendedAction,
    operationalPhrase: t.operationalPhrase,
  };
}

export function generateApprovalRequest(accountId: string, tick: number): ApprovalRequest | null {
  const templates = getApprovalTemplates(accountId);
  const idx = deterministicIndex(tick + 1000, templates.length);
  const t = templates[idx];
  if (!t) return null;
  approvalId++;
  return {
    id: `apr-${approvalId}`,
    title: t.title,
    reason: t.reason,
    requestingAgent: t.agent,
    estimatedImpact: t.impact,
    riskLevel: t.risk,
    timestamp: new Date(),
    status: "pending",
  };
}

export function buildOrgNodes(accountId: string): OrgNode[] {
  const account = accounts.find((a) => a.id === accountId);
  if (!account) return [];

  const baseNodes: OrgNode[] = [
    { id: "rnd", name: "R&D", useCase: "Drug discovery, computational chemistry", buyingLikelihood: 72, arrPotential: account.estimatedExpansionValue * 0.25, status: "identified", recommendedNextStep: "Map R&D Data Platform", },
    { id: "clinical", name: "Clinical Ops", useCase: "Trial analytics, site performance", buyingLikelihood: 78, arrPotential: account.estimatedExpansionValue * 0.3, status: "engaged", recommendedNextStep: "Pilot design", },
    { id: "regulatory", name: "Regulatory", useCase: "Submission prep, document workflows", buyingLikelihood: 65, arrPotential: account.estimatedExpansionValue * 0.15, status: "latent", recommendedNextStep: "Discover use cases", },
    { id: "medical", name: "Medical Affairs", useCase: "HCP engagement, knowledge retrieval", buyingLikelihood: 70, arrPotential: account.estimatedExpansionValue * 0.2, status: "identified", recommendedNextStep: "Pilot scope", },
    { id: "manufacturing", name: "Manufacturing", useCase: "Quality, supply chain analytics", buyingLikelihood: 60, arrPotential: account.estimatedExpansionValue * 0.1, status: "latent", recommendedNextStep: "Map data needs", },
  ];

  return baseNodes;
}

export function buildAgents(): Agent[] {
  return [
    { id: "territory", name: "Territory Intelligence Agent", role: "Market and timing signals", status: "idle", confidenceScore: 82, priority: "medium", lastActionAt: new Date() },
    { id: "research", name: "Research Agent", role: "Champion and opportunity detection", status: "idle", confidenceScore: 85, priority: "high", lastActionAt: new Date() },
    { id: "competitive", name: "Competitive Strategy Agent", role: "Competitive positioning", status: "idle", confidenceScore: 78, priority: "medium", lastActionAt: new Date() },
    { id: "technical", name: "Technical Architecture Agent", role: "Integration and deployment", status: "idle", confidenceScore: 80, priority: "medium", lastActionAt: new Date() },
    { id: "security", name: "Security and Compliance Agent", role: "Security and compliance", status: "idle", confidenceScore: 88, priority: "high", lastActionAt: new Date() },
    { id: "executive", name: "Executive Narrative Agent", role: "Executive storytelling", status: "idle", confidenceScore: 75, priority: "medium", lastActionAt: new Date() },
    { id: "expansion", name: "Expansion Strategy Agent", role: "Expansion opportunities", status: "idle", confidenceScore: 77, priority: "medium", lastActionAt: new Date() },
    { id: "oversight", name: "Human Oversight Agent", role: "Approval recommendations", status: "idle", confidenceScore: 90, priority: "critical", lastActionAt: new Date() },
  ];
}
