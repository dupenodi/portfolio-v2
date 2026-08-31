import { NextRequest, NextResponse } from "next/server";
import {
  answerVisitor,
  LlmNotConfiguredError,
  type ChatTurn,
  type GtabidGuidance,
  verifyGtabidSignature,
} from "@/lib/gtabid";
import { getGtabidWebhookSecret } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readHistory(conversation: Record<string, unknown> | null): ChatTurn[] {
  const raw = conversation?.history;
  if (!Array.isArray(raw)) return [];

  const turns: ChatTurn[] = [];
  for (const item of raw) {
    const row = asRecord(item);
    if (!row || typeof row.content !== "string" || !row.content.trim()) continue;
    turns.push({
      role: row.role === "assistant" ? "assistant" : "user",
      content: row.content.trim(),
    });
  }
  return turns;
}

function readGuidance(payload: Record<string, unknown>): GtabidGuidance | undefined {
  const raw = asRecord(payload.response_guidance);
  if (!raw) return undefined;
  return {
    role: typeof raw.role === "string" ? raw.role : undefined,
    objective: typeof raw.objective === "string" ? raw.objective : undefined,
    style: Array.isArray(raw.style) ? raw.style.filter((item) => typeof item === "string") : undefined,
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "gtabid-hook",
    hint: "POST gtabid visitor messages here. Paste https://www.dupenodi.dev/api/gtabid/hook into Owner tools → webhook.",
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const secret = getGtabidWebhookSecret();

  if (secret) {
    const valid = verifyGtabidSignature({
      secret,
      timestampHeader: request.headers.get("x-gtabid-timestamp"),
      signatureHeader: request.headers.get("x-gtabid-signature"),
      rawBody,
    });
    if (!valid) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  }

  let parsed: unknown = {};
  if (rawBody.trim()) {
    try {
      parsed = JSON.parse(rawBody) as unknown;
    } catch {
      return NextResponse.json({ error: "invalid json" }, { status: 400 });
    }
  }

  const payload = asRecord(parsed) ?? {};
  const event = request.headers.get("x-gtabid-event") ?? "";
  const type = typeof payload.type === "string" ? payload.type : event;
  const conversation = asRecord(payload.conversation);
  const message = asRecord(payload.message);
  const text = typeof message?.text === "string" ? message.text.trim() : "";

  if (type === "ping" || (!text && conversation == null)) {
    return new NextResponse("ok", { status: 200 });
  }

  if (!text) {
    return NextResponse.json({ reply: "say that again?" });
  }

  const rep = asRecord(payload.rep);
  const repName =
    typeof rep?.name === "string" && rep.name.trim() ? rep.name.trim() : "Max";

  try {
    const reply = await answerVisitor({
      question: text,
      history: readHistory(conversation),
      repName,
      guidance: readGuidance(payload),
    });
    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof LlmNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    const detail = err instanceof Error ? err.message : "llm failed";
    return NextResponse.json({ error: detail }, { status: 502 });
  }
}
