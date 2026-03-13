"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, Send, Lock, Server, Eye, FileCheck, Globe, Database } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { StreamingContent } from "@/components/ui/streaming-content";
import { useStreaming } from "@/lib/hooks/use-streaming";
import { cn } from "@/lib/utils";
import type { Account, Competitor } from "@/types";

const quickQuestions = [
  { category: "Certifications", icon: FileCheck, questions: [
    "Is Anthropic SOC 2 Type II certified?",
    "Do you support HIPAA? Is a BAA available?",
    "What compliance frameworks do you support?",
    "Do you have FedRAMP authorization?",
  ]},
  { category: "Data Handling", icon: Database, questions: [
    "Do you train on customer data?",
    "What is your data retention policy?",
    "How is data encrypted at rest and in transit?",
    "Can we get data residency in the EU?",
  ]},
  { category: "Access & Identity", icon: Lock, questions: [
    "Do you support SSO / SAML?",
    "What RBAC controls are available?",
    "Do you support SCIM provisioning?",
    "What audit logging is available?",
  ]},
  { category: "Infrastructure", icon: Server, questions: [
    "Where is data processed and stored?",
    "What is your SLA for enterprise customers?",
    "Do you offer on-premises deployment?",
    "What are the deployment options (API, Bedrock, Vertex)?",
  ]},
  { category: "Privacy & AI Safety", icon: Eye, questions: [
    "How do you prevent model hallucinations?",
    "What content filtering is in place?",
    "How do you handle PII in prompts?",
    "What is Constitutional AI and how does it help?",
  ]},
  { category: "Vendor Risk", icon: Globe, questions: [
    "What is your incident response process?",
    "Do you perform regular penetration testing?",
    "What is your business continuity plan?",
    "Can you provide your SOC 2 report?",
  ]},
];

interface SecurityQAProps {
  account: Account;
  competitors: Competitor[];
}

export function SecurityQA({ account, competitors }: SecurityQAProps) {
  const [customQuestion, setCustomQuestion] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const answer = useStreaming();

  const askQuestion = useCallback(
    (question: string) => {
      setCurrentQuestion(question);
      answer.startStream({
        url: "/api/generate",
        body: {
          type: "security_qa",
          account,
          competitors,
          context: `Security/compliance question from ${account.name} (security sensitivity: ${account.securitySensitivity}/100, compliance complexity: ${account.complianceComplexity}/100):\n\n"${question}"\n\nProvide a detailed, accurate answer suitable for a security questionnaire response. Include specific certifications, technical details, and policy references.`,
        },
      });
    },
    [account, competitors, answer]
  );

  const handleCustomSubmit = () => {
    if (!customQuestion.trim()) return;
    askQuestion(customQuestion.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="space-y-8 sm:space-y-10"
    >
      <SectionHeader
        title="Security & compliance Q&A"
        subtitle="Instant answers to customer security questions"
      />

      {/* Custom question */}
      <div className="rounded-lg border border-surface-border/50 bg-surface-elevated/30 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-claude-coral/60" strokeWidth={1.8} />
          <p className="text-[13px] font-medium text-text-primary">Ask a security question</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <textarea
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleCustomSubmit();
              }
            }}
            placeholder="Paste a question from a security questionnaire or type your own..."
            rows={2}
            className="flex-1 resize-none rounded-lg border border-surface-border/40 bg-surface/60 px-4 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted/50 focus:border-claude-coral/30 focus:outline-none"
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customQuestion.trim() || answer.isStreaming}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-medium transition-colors sm:w-auto sm:shrink-0 sm:self-end",
              customQuestion.trim()
                ? "border border-claude-coral/20 bg-claude-coral/[0.06] text-claude-coral/90 hover:bg-claude-coral/10"
                : "border border-surface-border/30 bg-surface-muted/20 text-text-muted/40 cursor-not-allowed"
            )}
          >
            <Send className="h-3.5 w-3.5" />
            Answer
          </button>
        </div>
      </div>

      {/* Response */}
      {(answer.content || answer.isStreaming) && (
        <StreamingContent
          content={answer.content}
          isStreaming={answer.isStreaming}
          onRegenerate={() => currentQuestion && askQuestion(currentQuestion)}
          label="Security Response"
        />
      )}

      {/* Quick questions */}
      <div className="space-y-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">
          Common security questions
        </p>
        {quickQuestions.map(({ category, icon: Icon, questions }) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="h-3.5 w-3.5 text-text-muted/60" strokeWidth={1.8} />
              <p className="text-[12px] font-medium text-text-secondary">{category}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {questions.map((q) => (
                <button
                  key={q}
                  onClick={() => askQuestion(q)}
                  disabled={answer.isStreaming}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-[12px] text-left transition-all",
                    currentQuestion === q
                      ? "border-claude-coral/30 bg-claude-coral/[0.05] text-text-primary"
                      : "border-surface-border/30 text-text-muted hover:border-surface-border/50 hover:text-text-secondary"
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
