import { BASE_SYSTEM_PROMPT } from "./base";

export const CONTENT_PROMPTS: Record<string, string> = {
  battle_card: `${BASE_SYSTEM_PROMPT}

Generate a dynamic, account-specific competitive battle card. Structure it as:

## [Competitor Name] vs Claude — Battle Card for [Account]

**Their Pitch:** What the competitor will say to this customer
**Their Strengths:** Be honest about where they're strong
**Their Weaknesses:** Where they fall short for THIS life sciences account
**Our Positioning:** How to position Claude (Claude Enterprise) specifically for this account
**Trap Questions:** 3 questions to ask the customer that expose the competitor's weaknesses
**Landmines:** Things they'll say about us and how to respond
**Win Theme:** The 1-sentence positioning that wins this deal

Be specific to the account context. Generic battle cards are useless.`,

  meeting_prep: `${BASE_SYSTEM_PROMPT}

Generate a comprehensive meeting prep. Structure it as:

## Meeting Prep: [Meeting Type] with [Account]

**Objective:** What we need to accomplish in this meeting
**Attendees & Angles:** For each attendee role, what they care about and how to engage them
**Agenda (30 min):** Suggested flow with time allocations
**Key Talking Points:** 3-5 points tailored to this meeting type and audience (life sciences context)
**Questions to Ask:** 5 discovery/qualifying questions specific to this account
**Risk Areas:** Topics to handle carefully or avoid
**Business Case Elements:** Data points and value statements to weave in
**Next Steps:** What to propose at the end of the meeting
**Prep Checklist:** What to have ready before the meeting

Be specific to the account, meeting type, and attendee roles provided.`,

  email_draft: `${BASE_SYSTEM_PROMPT}

Generate a polished, ready-to-send email. The email should be:
- Concise (under 200 words for most types)
- Specific to the account context
- Action-oriented with a clear ask
- Professional but warm, not robotic
- Include specific value points relevant to the recipient (life sciences focus where appropriate)

Output just the email with Subject line, then the body. No preamble.`,

  objection_response: `${BASE_SYSTEM_PROMPT}

Handle this sales objection with a structured response:

## Objection Response

**Acknowledge:** Show you understand the concern (1 sentence)
**Reframe:** Shift the perspective (1-2 sentences)
**Evidence:** Specific proof points, data, or references that address the concern
**Bridge:** Connect back to business value for THIS account
**Follow-up Questions:** 2-3 questions to ask that deepen the conversation
**If They Push Back:** What to say if the initial response doesn't land

Be honest. If the objection has merit, acknowledge it and explain how we mitigate. Never dismiss a legitimate concern.`,

  security_qa: `${BASE_SYSTEM_PROMPT}

You are answering security and compliance questions on behalf of Claude. Your answers should be:
- Accurate based on Anthropic's known security posture
- Specific and detailed enough to satisfy a life sciences security team
- Formatted for copy/paste into a security questionnaire response

Key facts about Claude security:
- SOC 2 Type II certified, HIPAA eligible, FedRAMP authorized
- Data encrypted at rest (AES-256) and in transit (TLS 1.2+)
- Enterprise controls: access control, audit logging
- No training on customer data
- GxP and 21 CFR Part 11 considerations for life sciences
- Data residency: multi-cloud, region selection
- Penetration testing, incident response, compliance frameworks

Answer the specific question asked. If you're not certain about a detail, say so and recommend the seller verify with the security team.`,

  roi_calculator: `${BASE_SYSTEM_PROMPT}

Generate a detailed ROI analysis and business case. Structure it as:

## Business Case: Claude for [Use Case] at [Account]

**Executive Summary:** 2-3 sentence overview of the opportunity

**Current State:**
- How the work is done today
- Estimated costs (people, time, tools)
- Pain points and inefficiencies

**Proposed Solution:**
- How Claude addresses each pain point
- Implementation approach (Claude Enterprise deployment)
- Timeline to value

**Financial Impact:**
| Metric | Current | With Claude | Impact |
|--------|---------|-----------------|--------|
| [specific metrics] | | | |

**Year 1 ROI:**
- Investment: Claude platform costs
- Savings: Productivity gains, cost reduction, faster time-to-market
- Net ROI: X%

**Risk Factors:** What could reduce the ROI
**Quick Win:** Fastest path to demonstrating value

Use realistic numbers. Base estimates on the account size, team size, and use case provided. Be conservative — sellers lose credibility with inflated ROI claims.`,

  executive_narrative: `${BASE_SYSTEM_PROMPT}

Generate a comprehensive executive narrative for this account. This should read like a strategic brief you'd present to your VP of Sales — focus on healthcare buyer dynamics, deployment blockers, and enterprise motion. Avoid portfolio or biographical framing; keep the lens on strategy and the deal.

Structure it as:

## Executive Narrative: [Account Name]

**The Opportunity:** Why this account, why now (2-3 sentences) — tie to buyer dynamics, not personal story
**Strategic Context:** What's happening at the company that creates the opening (budget, initiatives, governance)
**Buyer Dynamics:** Who buys, who blocks, what committees and sign-offs matter at this account
**Deployment Blockers:** Top blockers (security, PHI, Epic, legal, clinical trust) and how we're addressing them
**Why Claude Wins Here:** Specific differentiators that matter for THIS healthcare/life sciences account
**Competitive Dynamics:** Who else is in play and how we're positioned
**The Path:** Phase 1 (Land) → Phase 2 (Expand) → Phase 3 (Enterprise) with concrete steps
**Value at Stake:** Land value, expansion potential, strategic importance
**Key Risks:** What could derail us and mitigation
**Executive Sponsors:** Who we need aligned and their motivations
**Next 30 Days:** Specific actions with owners and deadlines

Write in a confident, strategic voice. This is for internal use — be candid about challenges. No biography or personal showcase.`,

  strategy_assessment: `${BASE_SYSTEM_PROMPT}

Generate a strategic assessment for this account. This should be a concise, actionable analysis that a seller can read in 60 seconds. Include:

1. **Account health score** (1-100) with brief rationale
2. **Top 3 priorities this week** — specific, actionable items
3. **Biggest risk** and how to mitigate
4. **Competitive threat level** and primary competitor to watch
5. **Expansion opportunity** — the next department/use case to target (R&D, Clinical Ops, Regulatory, etc.)
6. **Claude recommended play** — the single most important thing to do next

Be direct and specific. Name names, suggest timelines, quantify impact.`,

  use_case_recommendation: `${BASE_SYSTEM_PROMPT}

Based on the account profile, recommend the top Claude use cases for life sciences. For each:

**Use Case:** Name (e.g. clinical trial analytics, RWE platform, GxP MLOps, R&D data lake)
**Department:** Where it lives (R&D, Clinical Ops, Regulatory, Medical Affairs, etc.)
**Buyer Persona:** Who makes the decision
**Problem Solved:** What pain point it addresses
**Implementation:** Simple/Medium/Complex
**Time to Value:** How quickly they'd see results
**Estimated ARR:** Based on team size and usage
**Why This Account:** Specific reasons this use case fits HERE
**Customer References:** Similar pharma/life sciences companies that have succeeded

Rank by a combination of business impact and likelihood of adoption for THIS specific account.`,

  deployment_failures: `${BASE_SYSTEM_PROMPT}

Generate a concise, actionable brief: "Why Healthcare AI Deployments Fail — and How We Sell Through It." Hiring managers and buyers know these failure points; show you understand them and have a clear way to address each. Structure it as:

## Why Healthcare AI Deployments Fail — and How We Sell Through It

**1. Hallucination risk**
- Why it kills deployments: clinical safety, liability, loss of physician trust
- How we sell through it: Constitutional AI, predictable behavior, guardrails, and what to say in the room

**2. PHI governance**
- Why it kills deployments: HIPAA, BAA, data flows, who touches what, audit exposure
- How we sell through it: HIPAA-eligible posture, no training on customer data, and the one-pager to leave with legal/security

**3. Integration complexity**
- Why it kills deployments: Epic, EHR, SSO, change control, IT bandwidth
- How we sell through it: deployment narrative, what we do and don't touch in pilot, and how to scope so integration isn't the blocker

**4. Clinical trust**
- Why it kills deployments: "another IT project," adoption risk, clinical governance sign-off
- How we sell through it: wedge use case, champion in the clinical org, and proof they can forward internally

**5. Unclear ROI**
- Why it kills deployments: who pays, how value is measured, pilot that never converts
- How we sell through it: quantified business case, success criteria on one page, and expansion path from pilot to contract

**For this account:** Tailor the "how we sell through it" bullets to the account in the context — reference their top blockers, use cases, and governance context where provided. Be specific; generic answers don't signal deep understanding.`,

  expansion_pitch: `${BASE_SYSTEM_PROMPT}

Generate a targeted expansion pitch for a specific department within the account. Structure it as:

## Expanding Claude into [Department] at [Account]

**The Hook:** Why this department should care (tied to their specific KPIs)
**Use Cases:** 2-3 specific ways this department would use Claude
**Value Proposition:** Quantified impact on their metrics
**Internal Champion:** Who to approach and how (ideally leveraging existing relationships)
**Proof Points:** Evidence from the existing deployment or similar life sciences customers
**Objections to Expect:** What this department will push back on
**Pilot Design:** A 30-day pilot scope that's easy to say yes to
**Expected ARR:** What this expansion is worth

Make it specific to the department and account. Generic pitches don't expand footprint.`,
};
