"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useApiKey } from "@/app/context/api-key-context";
import { SectionHeader } from "@/components/ui/section-header";
import { LiveEventCard } from "@/components/ui/live-event-card";
import { ClaudeSparkle } from "@/components/ui/claude-logo";
import { readApiErrorMessage } from "@/lib/client/api";
import type { SimulationEvent, Account, Competitor } from "@/types";

interface LiveAgentFeedProps {
  events: SimulationEvent[];
  account: Account;
  competitors: Competitor[];
}

export function LiveAgentFeed({ events, account, competitors }: LiveAgentFeedProps) {
  const { getRequestHeaders } = useApiKey();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiEvents, setAiEvents] = useState<SimulationEvent[]>([]);

  useEffect(() => {
    if (scrollRef.current && events.length > 0) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events.length]);

  const generateAgentInsight = useCallback(async () => {
    setIsGenerating(true);
    const agentNames = [
      "Research Agent",
      "Competitive Strategy Agent",
      "Technical Architecture Agent",
      "Expansion Strategy Agent",
      "Security and Compliance Agent",
      "Executive Narrative Agent",
    ];
    const randomAgent = agentNames[Math.floor(Math.random() * agentNames.length)];

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getRequestHeaders(),
        },
        body: JSON.stringify({ agentName: randomAgent, account, competitors }),
      });

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response));
      }

      const data = await response.json();
      const newEvent: SimulationEvent = {
        id: `ai-${Date.now()}`,
        timestamp: new Date(),
        agentName: randomAgent,
        priority: data.priority ?? "medium",
        type: data.type ?? "research_signal",
        title: data.title ?? "Analysis complete",
        explanation: data.explanation ?? "Agent analysis completed.",
        recommendedAction: data.recommendedAction,
      };
      setAiEvents((prev): SimulationEvent[] => [newEvent, ...prev].slice(0, 20));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Add your Claude API key in the top right and try again.";
      const errorEvent: SimulationEvent = {
        id: `ai-error-${Date.now()}`,
        timestamp: new Date(),
        agentName: randomAgent,
        priority: "high",
        type: "research_signal",
        title: "Claude request needs attention",
        explanation: message,
        recommendedAction: "Update your Claude API key from the top right, then retry.",
      };

      setAiEvents((prev): SimulationEvent[] => [
        errorEvent,
        ...prev,
      ].slice(0, 20));
    } finally {
      setIsGenerating(false);
    }
  }, [account, competitors, getRequestHeaders]);

  const allEvents = [...aiEvents, ...events].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex h-full flex-col"
    >
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          title="Agent activity"
          subtitle="Real-time intelligence stream"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={generateAgentInsight}
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-claude-coral/20 bg-claude-coral/[0.06] px-3 py-2 text-[11px] font-medium text-claude-coral/90 transition-colors hover:bg-claude-coral/10 disabled:opacity-50 sm:w-auto sm:py-1.5"
          >
            {isGenerating ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <ClaudeSparkle size={10} />
            )}
            Generate AI Insight
          </button>
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-claude-coral/40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-claude-coral/70" />
            </span>
            <span className="text-[11px] text-text-muted">live</span>
          </div>
        </div>
      </div>

      {aiEvents.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <ClaudeSparkle size={10} className="text-claude-coral/50" />
          <span className="text-[11px] text-claude-coral/60">
            {aiEvents.length} AI-generated insight{aiEvents.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-visible pr-0 sm:pr-2 lg:overflow-y-auto lg:max-h-[calc(100vh-280px)]"
      >
        <AnimatePresence mode="popLayout">
          {allEvents.map((event, i) => (
            <LiveEventCard
              key={event.id}
              event={event}
              isNew={i === 0}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
