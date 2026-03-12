"use client";

import { useState, useCallback, useRef } from "react";
import { useApiKey } from "@/app/context/api-key-context";
import { readApiErrorMessage } from "@/lib/client/api";

interface StreamOptions {
  url: string;
  body: Record<string, unknown>;
  onComplete?: (text: string) => void;
}

export function useStreaming() {
  const { getRequestHeaders } = useApiKey();
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(async ({ url, body, onComplete }: StreamOptions) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsStreaming(true);
    setContent("");
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
          hypothesisId: "H1",
          location: "lib/hooks/use-streaming.ts:startStream",
          message: "Shared streaming request started",
          data: {
            url,
            bodyKeys: Object.keys(body),
            hasClientApiKey: Boolean(requestHeaders["x-anthropic-api-key"]),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...requestHeaders,
        },
        body: JSON.stringify(body),
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
                setContent(fullText);
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
                    hypothesisId: "H1",
                    location: "lib/hooks/use-streaming.ts:startStream",
                    message: "Shared streaming JSON parse failed",
                    data: {
                      url,
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
              // skip malformed chunks
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
          hypothesisId: "H1",
          location: "lib/hooks/use-streaming.ts:startStream",
          message: "Shared streaming request completed",
          data: {
            url,
            chunkCount,
            parseFailureCount,
            fullTextLength: fullText.length,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      onComplete?.(fullText);
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Stream error:", error);
        setContent(
          error instanceof Error
            ? error.message
            : "I couldn't generate that response. Add your Claude API key in the top right and try again."
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [getRequestHeaders]);

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setContent("");
    setIsStreaming(false);
  }, []);

  return { content, isStreaming, startStream, stopStream, reset };
}
