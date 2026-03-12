"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Square, Trash2 } from "lucide-react";
import { useApiKey } from "@/app/context/api-key-context";
import { cn } from "@/lib/utils";
import { readApiErrorMessage } from "@/lib/client/api";
import { ClaudeSparkle } from "@/components/ui/claude-logo";
import type { Account, Competitor } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  competitors: Competitor[];
  activeSection: string;
}

export function ChatPanel({
  isOpen,
  onClose,
  account,
  competitors,
  activeSection,
}: ChatPanelProps) {
  const { hasApiKey, getRequestHeaders } = useApiKey();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const previousAccountIdRef = useRef(account.id);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  useEffect(() => {
    if (previousAccountIdRef.current !== account.id) {
      // #region agent log
      fetch("http://127.0.0.1:7605/ingest/623d59d1-98a2-437e-8e26-cbbf21853b65", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "b70088",
        },
        body: JSON.stringify({
          sessionId: "b70088",
          runId: "vercel-readiness-pass-1",
          hypothesisId: "H3",
          location: "components/layout/chat-panel.tsx:accountChange",
          message: "Chat account changed with existing local state",
          data: {
            previousAccountId: previousAccountIdRef.current,
            nextAccountId: account.id,
            retainedMessageCount: messages.length,
            retainedStreamingChars: streamingContent.length,
            wasStreaming: isStreaming,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      previousAccountIdRef.current = account.id;
    }
  }, [account.id, isStreaming, messages.length, streamingContent.length]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");

    const controller = new AbortController();
    abortRef.current = controller;
    let fullText = "";
    let chunkCount = 0;
    let parseFailureCount = 0;
    let loggedFirstParseFailure = false;
    const requestHeaders = getRequestHeaders();

    try {
      // #region agent log
      fetch("http://127.0.0.1:7605/ingest/623d59d1-98a2-437e-8e26-cbbf21853b65", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "b70088",
        },
        body: JSON.stringify({
          sessionId: "b70088",
          runId: "vercel-readiness-pass-1",
          hypothesisId: "H2",
          location: "components/layout/chat-panel.tsx:sendMessage",
          message: "Chat request started",
          data: {
            accountId: account.id,
            section: activeSection,
            messageCount: newMessages.length,
            hadRetainedMessages: messages.length > 0,
            hasClientApiKey: Boolean(requestHeaders["x-anthropic-api-key"]),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...requestHeaders,
        },
        body: JSON.stringify({
          messages: newMessages,
          account,
          competitors,
          section: activeSection,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await readApiErrorMessage(response));
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunkCount += 1;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setStreamingContent(fullText);
              }
            } catch {
              parseFailureCount += 1;
              if (!loggedFirstParseFailure) {
                loggedFirstParseFailure = true;
                // #region agent log
                fetch("http://127.0.0.1:7605/ingest/623d59d1-98a2-437e-8e26-cbbf21853b65", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Debug-Session-Id": "b70088",
                  },
                  body: JSON.stringify({
                    sessionId: "b70088",
                    runId: "vercel-readiness-pass-1",
                    hypothesisId: "H2",
                    location: "components/layout/chat-panel.tsx:sendMessage",
                    message: "Chat streaming JSON parse failed",
                    data: {
                      accountId: account.id,
                      chunkCount,
                      dataLength: data.length,
                      chunkLength: chunk.length,
                      chunkEndsWithNewline: chunk.endsWith("\n"),
                    },
                    timestamp: Date.now(),
                  }),
                }).catch(() => {});
                // #endregion
              }
              // skip
            }
          }
        }
      }

      // #region agent log
      fetch("http://127.0.0.1:7605/ingest/623d59d1-98a2-437e-8e26-cbbf21853b65", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "b70088",
        },
        body: JSON.stringify({
          sessionId: "b70088",
          runId: "vercel-readiness-pass-1",
          hypothesisId: "H2",
          location: "components/layout/chat-panel.tsx:sendMessage",
          message: "Chat request completed",
          data: {
            accountId: account.id,
            chunkCount,
            parseFailureCount,
            fullTextLength: fullText.length,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fullText },
      ]);
      setStreamingContent("");
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              error instanceof Error
                ? error.message
                : "I couldn't process that request. Add your Claude API key in the top right and try again.",
          },
        ]);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, messages, isStreaming, account, competitors, activeSection, getRequestHeaders]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    if (streamingContent) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: streamingContent },
      ]);
      setStreamingContent("");
    }
    setIsStreaming(false);
  }, [streamingContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[480px] flex-col border-l border-surface-border/40 bg-surface shadow-2xl"
          >
            {/* Header */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-surface-border/40 px-4">
              <div className="flex items-center gap-2">
                <ClaudeSparkle size={14} className="text-claude-coral" />
                <span className="text-[13px] font-medium text-text-primary">
                  Claude Co-Pilot
                </span>
                <span className="rounded-full bg-surface-muted/60 px-2 py-0.5 text-[10px] text-text-muted">
                  {account.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={() => {
                      setMessages([]);
                      setStreamingContent("");
                    }}
                    className="rounded-md p-1.5 text-text-muted hover:bg-surface-muted/40 hover:text-text-secondary transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-md p-1.5 text-text-muted hover:bg-surface-muted/40 hover:text-text-secondary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            >
              {messages.length === 0 && !streamingContent && (
                <div className="flex h-full flex-col items-center justify-center text-center px-8">
                  <ClaudeSparkle
                    size={24}
                    className="text-claude-coral/30 mb-4"
                  />
                  <p className="text-[14px] font-medium text-text-secondary mb-2">
                    Your strategic co-pilot
                  </p>
                  <p className="text-[12px] text-text-muted leading-relaxed mb-6">
                    I have full context on {account.name}. Ask me anything about
                    the account, deal strategy, or competitive positioning.
                  </p>
                  {!hasApiKey && (
                    <div className="mb-6 rounded-lg border border-claude-coral/20 bg-claude-coral/[0.06] px-3 py-2 text-[11px] text-claude-coral/85">
                      If chat is not responding yet, add your Claude API key from the top right.
                    </div>
                  )}
                  <div className="space-y-2 w-full">
                    {[
                      `What should I focus on this week for ${account.name}?`,
                      `Draft a follow-up email to ${account.executiveSponsors[0]?.split(" (")[0] ?? "the CIO"}`,
                      "How do I handle the security review blocker?",
                      "Generate a battle card against the top competitor",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInput(suggestion);
                          setTimeout(() => inputRef.current?.focus(), 0);
                        }}
                        className="w-full rounded-lg border border-surface-border/40 bg-surface-elevated/30 px-3 py-2.5 text-left text-[12px] text-text-muted hover:border-claude-coral/20 hover:text-text-secondary transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-claude-coral/10">
                      <ClaudeSparkle size={12} className="text-claude-coral" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2.5 text-[13px] leading-relaxed",
                      msg.role === "user"
                        ? "bg-claude-coral/10 text-text-primary"
                        : "bg-surface-elevated/60 text-text-secondary"
                    )}
                  >
                    <div className="whitespace-pre-wrap prose-sm">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              {isStreaming && streamingContent && (
                <div className="flex gap-3 justify-start">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-claude-coral/10">
                    <ClaudeSparkle
                      size={12}
                      className="text-claude-coral animate-pulse"
                    />
                  </div>
                  <div className="max-w-[85%] rounded-lg bg-surface-elevated/60 px-3 py-2.5 text-[13px] leading-relaxed text-text-secondary">
                    <div className="whitespace-pre-wrap prose-sm">
                      {streamingContent}
                      <span className="inline-block w-1.5 h-4 bg-claude-coral/50 animate-pulse ml-0.5 align-text-bottom" />
                    </div>
                  </div>
                </div>
              )}

              {isStreaming && !streamingContent && (
                <div className="flex gap-3 justify-start">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-claude-coral/10">
                    <ClaudeSparkle
                      size={12}
                      className="text-claude-coral animate-pulse"
                    />
                  </div>
                  <div className="rounded-lg bg-surface-elevated/60 px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-text-muted/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-text-muted/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-text-muted/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-surface-border/40 p-4">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask about ${account.name}...`}
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-surface-border/50 bg-surface-elevated/40 px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted/60 focus:border-claude-coral/30 focus:outline-none focus:ring-0 transition-colors"
                  style={{
                    maxHeight: "120px",
                    minHeight: "40px",
                    height: "auto",
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                  }}
                />
                {isStreaming ? (
                  <button
                    onClick={stopStreaming}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted/60 text-text-muted hover:bg-surface-muted transition-colors"
                  >
                    <Square className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                      input.trim()
                        ? "bg-claude-coral/90 text-white hover:bg-claude-coral"
                        : "bg-surface-muted/40 text-text-muted/40"
                    )}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
