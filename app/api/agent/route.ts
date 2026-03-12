import { NextRequest, NextResponse } from "next/server";
import { buildAccountContext } from "@/lib/prompts/base";
import { AGENT_PROMPTS } from "@/lib/prompts/agents";
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
        hypothesisId: "H7",
        location: "app/api/agent/route.ts:POST",
        message: "Agent API route entered",
        data: {
          hasClientApiKey: Boolean(req.headers.get("x-anthropic-api-key")?.trim()),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    const anthropic = createAnthropicClient(req);
    const { agentName, account, competitors } = await req.json();

    const agentPrompt =
      AGENT_PROMPTS[agentName] ?? AGENT_PROMPTS["Research Agent"];
    const accountContext = buildAccountContext(account, competitors);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: agentPrompt,
      messages: [
        {
          role: "user",
          content: `Analyze the following account and generate a single intelligence signal.\n\n${accountContext}\n\nRespond with a JSON object containing: { "title": "...", "explanation": "...", "recommendedAction": "...", "priority": "low|medium|high|critical", "type": "research_signal|champion_identified|competitor_detected|architecture_recommendation|security_blocker|procurement_friction|legal_review|expansion_path|executive_narrative|deal_stage_advanced" }`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
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
            hypothesisId: "H4",
            location: "app/api/agent/route.ts:POST",
            message: "Agent response JSON parsed successfully",
            data: {
              agentName,
              accountId: account?.id ?? null,
              textLength: text.length,
              jsonLength: jsonMatch[0].length,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        return NextResponse.json(parsed);
      } catch (parseError) {
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
            hypothesisId: "H4",
            location: "app/api/agent/route.ts:POST",
            message: "Agent response JSON parse failed",
            data: {
              agentName,
              accountId: account?.id ?? null,
              textLength: text.length,
              jsonLength: jsonMatch[0].length,
              errorMessage:
                parseError instanceof Error ? parseError.message : "unknown",
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        throw parseError;
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
        hypothesisId: "H4",
        location: "app/api/agent/route.ts:POST",
        message: "Agent response missing JSON block",
        data: {
          agentName,
          accountId: account?.id ?? null,
          textLength: text.length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json({
      title: "Analysis complete",
      explanation: text.slice(0, 200),
      recommendedAction: "Review the analysis",
      priority: "medium",
      type: "research_signal",
    });
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      { error: getAnthropicErrorMessage(error) },
      { status: getAnthropicErrorStatus(error) }
    );
  }
}
