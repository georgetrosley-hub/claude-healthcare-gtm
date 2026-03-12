import { NextRequest } from "next/server";
import { CHAT_SYSTEM_PROMPT, buildAccountContext } from "@/lib/prompts/base";
import {
  createAnthropicClient,
  getAnthropicErrorMessage,
  getAnthropicErrorStatus,
} from "@/lib/server/anthropic";

export async function POST(req: NextRequest) {
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
        runId: "vercel-readiness-pass-2",
        hypothesisId: "H6",
        location: "app/api/chat/route.ts:POST",
        message: "Chat API route entered",
        data: {
          hasClientApiKey: Boolean(req.headers.get("x-anthropic-api-key")?.trim()),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    const anthropic = createAnthropicClient(req);
    const { messages, account, competitors, section } = await req.json();

    const accountContext = account
      ? buildAccountContext(account, competitors)
      : "";

    const systemPrompt = `${CHAT_SYSTEM_PROMPT}

${accountContext ? `\n## Current Account Context\n${accountContext}` : ""}
${section ? `\nThe seller is currently viewing the "${section}" section of the platform.` : ""}`;

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: getAnthropicErrorMessage(error) }),
      {
        status: getAnthropicErrorStatus(error),
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
