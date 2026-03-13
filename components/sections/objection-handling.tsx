"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { StreamingContent } from "@/components/ui/streaming-content";
import { useStreaming } from "@/lib/hooks/use-streaming";
import { ClaudeSparkle } from "@/components/ui/claude-logo";
import { cn } from "@/lib/utils";
import type { Account, Competitor } from "@/types";

const commonObjections = [
  { category: "Competitive", items: [
    "We're already using ChatGPT/OpenAI",
    "GitHub Copilot is good enough for our developers",
    "Microsoft Copilot is included in our E5 license",
    "Google Gemini is integrated with our Workspace",
  ]},
  { category: "Security & Privacy", items: [
    "We can't send our data to a third-party AI",
    "We need on-premises deployment",
    "Our security team won't approve another vendor",
    "How do we know you won't train on our data?",
  ]},
  { category: "Pricing & Value", items: [
    "Claude is too expensive compared to alternatives",
    "We don't have budget for another AI tool",
    "What's the ROI? Show me hard numbers",
    "Why pay for Claude when open-source models are free?",
  ]},
  { category: "Technical", items: [
    "We tried Claude and it hallucinated",
    "Our use case needs fine-tuning, which you don't support",
    "Integration is too complex for our stack",
    "We need multi-modal and Claude isn't strong enough",
  ]},
  { category: "Organizational", items: [
    "We're not ready for AI yet",
    "Our team won't adopt another tool",
    "We need to consolidate vendors, not add more",
    "Let's revisit this next quarter/year",
  ]},
];

interface ObjectionHandlingProps {
  account: Account;
  competitors: Competitor[];
}

export function ObjectionHandling({ account, competitors }: ObjectionHandlingProps) {
  const [customObjection, setCustomObjection] = useState("");
  const [currentObjection, setCurrentObjection] = useState("");
  const response = useStreaming();

  const handleObjection = useCallback(
    (objection: string) => {
      setCurrentObjection(objection);
      response.startStream({
        url: "/api/generate",
        body: {
          type: "objection_response",
          account,
          competitors,
          context: `The customer at ${account.name} said: "${objection}"\n\nProvide a structured response to this objection. Be specific to ${account.name}'s context — their industry, existing tech stack (${account.existingVendorFootprint.join(", ")}), and deal situation.`,
        },
      });
    },
    [account, competitors, response]
  );

  const handleCustomSubmit = () => {
    if (!customObjection.trim()) return;
    handleObjection(customObjection.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="space-y-8 sm:space-y-10"
    >
      <SectionHeader
        title="Objection handling"
        subtitle="Claude-powered responses with evidence and follow-ups"
      />

      {/* Custom objection input */}
      <div className="rounded-lg border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-4 w-4 text-claude-coral/60" strokeWidth={1.8} />
          <p className="text-[13px] font-medium text-text-primary">What are they saying?</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={customObjection}
            onChange={(e) => setCustomObjection(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            placeholder="Type the objection you're hearing..."
            className="flex-1 rounded-lg border border-surface-border/40 bg-surface/60 px-4 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted/50 focus:border-claude-coral/30 focus:outline-none"
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customObjection.trim() || response.isStreaming}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-medium transition-colors sm:w-auto sm:shrink-0",
              customObjection.trim()
                ? "border border-claude-coral/20 bg-claude-coral/[0.06] text-claude-coral/90 hover:bg-claude-coral/10"
                : "border border-surface-border/30 bg-surface-muted/20 text-text-muted/40 cursor-not-allowed"
            )}
          >
            <Send className="h-3.5 w-3.5" />
            Handle It
          </button>
        </div>
      </div>

      {/* Common objections */}
      <div className="space-y-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
          Common objections
        </p>
        {commonObjections.map(({ category, items }) => (
          <div key={category}>
            <p className="text-[12px] font-medium text-text-secondary mb-2">{category}</p>
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <button
                  key={item}
                  onClick={() => handleObjection(item)}
                  disabled={response.isStreaming}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-[12px] text-left transition-all",
                    currentObjection === item
                      ? "border-claude-coral/30 bg-claude-coral/[0.05] text-text-primary"
                      : "border-surface-border/30 text-text-muted hover:border-surface-border/50 hover:text-text-secondary"
                  )}
                >
                  &ldquo;{item}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Response */}
      {(response.content || response.isStreaming) && (
        <StreamingContent
          content={response.content}
          isStreaming={response.isStreaming}
          onRegenerate={() => currentObjection && handleObjection(currentObjection)}
          label={`Response to: "${currentObjection.slice(0, 50)}${currentObjection.length > 50 ? "..." : ""}"`}
        />
      )}
    </motion.div>
  );
}
