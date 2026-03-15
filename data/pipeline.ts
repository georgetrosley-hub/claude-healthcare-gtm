/**
 * Simulated territory pipeline — multiple accounts at different stages.
 * Gives the hiring manager the "territory owner" view.
 */

export type PipelineStage =
  | "Discovery"
  | "Champion Build"
  | "POV Selected"
  | "Pilot Design"
  | "Security Review"
  | "Legal Review"
  | "Procurement"
  | "Negotiation"
  | "Closed";

export interface PipelineRow {
  accountId: string;
  accountName: string;
  stage: PipelineStage;
  valueM: number;
  nextStep: string;
}

export const pipelineRows: PipelineRow[] = [
  {
    accountId: "hss",
    accountName: "HSS",
    stage: "Pilot Design",
    valueM: 1.5,
    nextStep: "Legal and clinical governance review",
  },
  {
    accountId: "penn-medicine",
    accountName: "Penn Medicine",
    stage: "Security Review",
    valueM: 2.2,
    nextStep: "Epic and security review Mar 18",
  },
  {
    accountId: "chop",
    accountName: "CHOP",
    stage: "Security Review",
    valueM: 1.5,
    nextStep: "Clinical and privacy review due",
  },
  {
    accountId: "northwell-health",
    accountName: "Northwell Health",
    stage: "Champion Build",
    valueM: 2.0,
    nextStep: "Pilot scope intro",
  },
  {
    accountId: "ibx",
    accountName: "IBX",
    stage: "Discovery",
    valueM: 1.8,
    nextStep: "Member services demo",
  },
];
