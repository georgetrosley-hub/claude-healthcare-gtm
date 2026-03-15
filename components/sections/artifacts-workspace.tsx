"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BriefcaseBusiness,
  FileText,
  Mail,
  MessageSquare,
  Shield,
  Swords,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { StreamingContent } from "@/components/ui/streaming-content";
import { useStreaming } from "@/lib/hooks/use-streaming";
import { cn } from "@/lib/utils";
import type { Account, Competitor } from "@/types";

type ArtifactId =
  | "briefing"
  | "meeting"
  | "email"
  | "objection"
  | "security"
  | "battlecard"
  | "deployfail";

const artifactTemplates = [
  {
    id: "briefing" as const,
    label: "Executive brief",
    description: "Internal account brief for leadership and account review.",
    icon: FileText,
    promptType: "executive_narrative",
    quickPrompts: [
      "Condense the account into one page for leadership.",
      "Highlight why now, the risks, and what support is needed.",
    ],
  },
  {
    id: "meeting" as const,
    label: "Meeting prep",
    description: "Prep for discovery, exec, technical, or procurement meetings.",
    icon: BriefcaseBusiness,
    promptType: "meeting_prep",
    quickPrompts: [
      "Prepare for a technical architecture review.",
      "Prepare for an executive sponsor alignment call.",
    ],
  },
  {
    id: "email" as const,
    label: "Email draft",
    description: "Write seller-ready or champion-forwardable deal email copy.",
    icon: Mail,
    promptType: "email_draft",
    quickPrompts: [
      "Write a follow-up after a positive discovery call.",
      "Draft a champion-forwardable internal email.",
    ],
  },
  {
    id: "objection" as const,
    label: "Objection talk track",
    description: "Turn pushback into a response you can actually use in a deal.",
    icon: MessageSquare,
    promptType: "objection_response",
    quickPrompts: [
      "They want to wait for their incumbent vendor.",
      "They say security will never approve another AI vendor.",
    ],
  },
  {
    id: "security" as const,
    label: "Security response",
    description: "Draft a detailed answer for security and compliance review.",
    icon: Shield,
    promptType: "security_qa",
    quickPrompts: [
      "Do you train on customer data?",
      "How do SSO, audit logs, and retention work?",
    ],
  },
  {
    id: "battlecard" as const,
    label: "Battle card",
    description: "Sharper account-specific positioning against the main threat.",
    icon: Swords,
    promptType: "battle_card",
    quickPrompts: [
      "Help me displace Microsoft in this account.",
      "Write the trap questions for the top competitor.",
    ],
  },
  {
    id: "deployfail" as const,
    label: "Why deployments fail",
    description: "Why healthcare AI pilots fail and how to sell through the blockers.",
    icon: AlertTriangle,
    promptType: "deployment_failures",
    quickPrompts: [
      "Focus on PHI and governance for this account.",
      "Tailor to their top blockers and Epic integration.",
    ],
  },
];

interface ArtifactsWorkspaceProps {
  account: Account;
  competitors: Competitor[];
}

export function ArtifactsWorkspace({
  account,
  competitors,
}: ArtifactsWorkspaceProps) {
  const artifact = useStreaming();
  const [selectedId, setSelectedId] = useState<ArtifactId>("briefing");
  const [primaryInput, setPrimaryInput] = useState("");
  const [secondaryInput, setSecondaryInput] = useState("");
  const [context, setContext] = useState("");

  const selectedTemplate = useMemo(
    () => artifactTemplates.find((template) => template.id === selectedId) ?? artifactTemplates[0],
    [selectedId]
  );

  const buildContext = useCallback(() => {
    switch (selectedId) {
      case "briefing":
        return context || "Create the cleanest possible internal account brief with clear next actions.";
      case "meeting":
        return [
          `Meeting type: ${primaryInput || "Executive sponsor sync"}`,
          `Expected attendees: ${secondaryInput || "Key stakeholders"}`,
          context ? `Additional context: ${context}` : "",
        ]
          .filter(Boolean)
          .join("\n");
      case "email":
        return [
          `Email type or goal: ${primaryInput || "Follow-up email"}`,
          `Recipient role: ${secondaryInput || "Executive sponsor"}`,
          context ? `Context: ${context}` : "",
        ]
          .filter(Boolean)
          .join("\n");
      case "objection":
        return `The customer at ${account.name} said: "${primaryInput || "We should just use our incumbent vendor."}"${context ? `\n\nAdditional context: ${context}` : ""}`;
      case "security":
        return `Security question from ${account.name}: "${primaryInput || "How do you handle customer data and retention?"}"${context ? `\n\nAdditional context: ${context}` : ""}`;
      case "battlecard":
        return [
          `Primary competitor: ${primaryInput || competitors[0]?.name || "Microsoft"}`,
          secondaryInput ? `Focus area: ${secondaryInput}` : "",
          context ? `Additional context: ${context}` : "",
        ]
          .filter(Boolean)
          .join("\n");
      case "deployfail":
        return context || "Tailor to this account's top blockers, use cases, and governance context.";
      default:
        return context;
    }
  }, [account.name, competitors, context, primaryInput, secondaryInput, selectedId]);

  const handleGenerate = useCallback(() => {
    artifact.startStream({
      url: "/api/generate",
      body: {
        type: selectedTemplate.promptType,
        account,
        competitors,
        context: buildContext(),
      },
    });
  }, [account, artifact, buildContext, competitors, selectedTemplate.promptType]);

  const applyQuickPrompt = (prompt: string) => {
    if (selectedId === "briefing") {
      setContext(prompt);
      return;
    }

    setPrimaryInput(prompt);
  };

  const handleTemplateChange = (id: ArtifactId) => {
    setSelectedId(id);
    setPrimaryInput("");
    setSecondaryInput("");
    setContext("");
    artifact.reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="space-y-8 sm:space-y-10"
    >
      <SectionHeader
        title="Field kit"
        subtitle="The actual outputs I would use to move a deal forward: exec briefs, meeting prep, follow-up emails, objection handling, security answers, and battle cards."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-3">
          {artifactTemplates.map(({ id, label, description, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleTemplateChange(id)}
              className={cn(
                "w-full rounded-[24px] border px-4 py-4 text-left transition-all",
                selectedId === id
                  ? "border-accent/20 bg-accent/[0.06]"
                  : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={cn(
                    "h-4 w-4",
                    selectedId === id ? "text-accent" : "text-text-muted"
                  )}
                  strokeWidth={1.8}
                />
                <p className="text-[13px] font-medium text-text-primary">{label}</p>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-text-muted">
                {description}
              </p>
            </button>
          ))}
        </aside>

        <section className="space-y-5 rounded-[30px] border border-white/8 bg-white/[0.03] p-5 sm:p-6">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
              {selectedTemplate.label}
            </p>
            <p className="max-w-2xl text-[13px] leading-relaxed text-text-secondary">
              {selectedTemplate.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedTemplate.quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => applyQuickPrompt(prompt)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-text-secondary"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Primary input
              </label>
              <input
                value={primaryInput}
                onChange={(event) => setPrimaryInput(event.target.value)}
                placeholder={
                  selectedId === "meeting"
                    ? "e.g. Executive sponsor sync"
                    : selectedId === "email"
                      ? "e.g. Follow-up after discovery"
                      : selectedId === "battlecard"
                        ? "e.g. Microsoft"
                        : "Enter the main request"
                }
                className="w-full rounded-[18px] border border-surface-border/40 bg-surface-muted/20 px-4 py-3 text-[13px] text-text-primary placeholder:text-text-muted/50 focus:border-accent/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
                Secondary input
              </label>
              <input
                value={secondaryInput}
                onChange={(event) => setSecondaryInput(event.target.value)}
                placeholder={
                  selectedId === "meeting"
                    ? "e.g. CIO, security lead, platform engineering"
                    : selectedId === "email"
                      ? "e.g. VP Engineering"
                      : selectedId === "battlecard"
                        ? "e.g. Developer productivity + governance"
                        : "Optional"
                }
                className="w-full rounded-[18px] border border-surface-border/40 bg-surface-muted/20 px-4 py-3 text-[13px] text-text-primary placeholder:text-text-muted/50 focus:border-accent/30 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.12em] text-text-faint">
              Context
            </label>
            <textarea
              value={context}
              onChange={(event) => setContext(event.target.value)}
              rows={4}
              placeholder="Anything the AI should know before drafting this artifact..."
              className="w-full resize-none rounded-[22px] border border-surface-border/40 bg-surface-muted/20 px-4 py-3 text-[13px] text-text-primary placeholder:text-text-muted/50 focus:border-accent/30 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={artifact.isStreaming}
            className="rounded-full border border-accent/20 bg-accent/[0.08] px-4 py-2 text-[13px] font-medium text-accent transition-colors hover:bg-accent/[0.12] disabled:opacity-50"
          >
            {artifact.isStreaming ? "Generating..." : `Generate ${selectedTemplate.label}`}
          </button>

          {(artifact.content || artifact.isStreaming) && (
            <StreamingContent
              content={artifact.content}
              isStreaming={artifact.isStreaming}
              onRegenerate={handleGenerate}
              label={selectedTemplate.label}
            />
          )}
        </section>
      </div>
    </motion.div>
  );
}
