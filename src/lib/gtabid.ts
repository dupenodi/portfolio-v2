import { createHmac, timingSafeEqual } from "node:crypto";
import { site } from "@/lib/site";
import { resumeFullText } from "@/lib/resume-corpus";

const MAX_SKEW_SECONDS = 5 * 60;
const LLM_TIMEOUT_MS = 12_000;
const MAX_HISTORY = 8;
const MAX_REPLY_CHARS = 700;

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type GtabidGuidance = {
  role?: string;
  objective?: string;
  style?: string[];
};

export class LlmNotConfiguredError extends Error {
  constructor() {
    super("Set GROQ_API_KEY, OPENAI_API_KEY, or OPENROUTER_API_KEY");
    this.name = "LlmNotConfiguredError";
  }
}

export function verifyGtabidSignature(input: {
  secret: string;
  timestampHeader: string | null;
  signatureHeader: string | null;
  rawBody: string;
}): boolean {
  const timestamp = input.timestampHeader ?? "";
  const signature = input.signatureHeader ?? "";
  if (!/^\d+$/.test(timestamp) || !signature.startsWith("v1=")) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > MAX_SKEW_SECONDS) return false;

  const expected = `v1=${createHmac("sha256", input.secret)
    .update(`${timestamp}.${input.rawBody}`)
    .digest("hex")}`;

  const expectedBuf = Buffer.from(expected);
  const givenBuf = Buffer.from(signature);
  if (expectedBuf.length !== givenBuf.length) return false;
  return timingSafeEqual(expectedBuf, givenBuf);
}

type LlmTarget = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export function getLlmTarget(): LlmTarget | null {
  const groq = process.env.GROQ_API_KEY?.trim();
  const openai = process.env.OPENAI_API_KEY?.trim();
  const openrouter = process.env.OPENROUTER_API_KEY?.trim();
  const customKey = process.env.GTABID_LLM_API_KEY?.trim();
  const customBase = process.env.GTABID_LLM_BASE_URL?.trim();
  const overrideModel = process.env.GTABID_LLM_MODEL?.trim();

  if (customKey && customBase) {
    return {
      apiKey: customKey,
      baseUrl: customBase.replace(/\/$/, ""),
      model: overrideModel || "gpt-4o-mini",
    };
  }

  if (openrouter) {
    return {
      apiKey: openrouter,
      baseUrl: "https://openrouter.ai/api/v1",
      model: overrideModel || "openai/gpt-4o-mini",
    };
  }

  if (groq) {
    return {
      apiKey: groq,
      baseUrl: "https://api.groq.com/openai/v1",
      model: overrideModel || "openai/gpt-oss-20b",
    };
  }

  if (openai) {
    return {
      apiKey: openai,
      baseUrl: "https://api.openai.com/v1",
      model: overrideModel || "gpt-4o-mini",
    };
  }

  return null;
}

function buildSystemPrompt(repName: string, guidance?: GtabidGuidance): string {
  const style = guidance?.style?.length
    ? guidance.style.join("; ")
    : "Sound like a person at a booth, not a search result. 2–4 short sentences.";

  return [
    guidance?.role ||
      `You are ${repName}, live booth rep at gtabid.lol for hire me pls (${site.name} / Sarath Donepudi).`,
    guidance?.objective ||
      "Have a conversation. Answer the visitor's latest message directly. Use chat history. Do not dump the resume.",
    `Style: ${style}`,
    "Chat is ~330px wide. No markdown headings, no bullet walls, no greeting unless they just said hi.",
    "Ground facts in the resume. If it is not in the resume, say you do not know and point to dupenodi.dev or hi@dupenodi.dev.",
    "Do not invent titles, dates, employers, metrics, or salary.",
    `Site: ${site.url}. Email: ${site.email}. Calendly: ${site.calendly}.`,
    "",
    "RESUME:",
    resumeFullText,
  ].join("\n");
}

function clipReply(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= MAX_REPLY_CHARS) return trimmed;
  return `${trimmed.slice(0, MAX_REPLY_CHARS - 1).trimEnd()}…`;
}

function readContent(content: unknown): string | null {
  if (typeof content === "string" && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("");
    return text.trim() || null;
  }
  return null;
}

async function completeChat(target: LlmTarget, messages: { role: string; content: string }[]): Promise<string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${target.apiKey}`,
    "Content-Type": "application/json",
  };
  if (target.baseUrl.includes("openrouter.ai")) {
    headers["HTTP-Referer"] = site.url;
    headers["X-Title"] = "hire me pls booth";
  }

  const response = await fetch(`${target.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: target.model,
      temperature: 0.5,
      max_tokens: 220,
      messages,
    }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`LLM ${response.status}: ${raw.slice(0, 240)}`);
  }

  const data = JSON.parse(raw) as { choices?: { message?: { content?: unknown } }[] };
  const content = readContent(data.choices?.[0]?.message?.content);
  if (!content) throw new Error("LLM returned empty content");
  return content;
}

export async function answerVisitor(input: {
  question: string;
  history: ChatTurn[];
  repName: string;
  guidance?: GtabidGuidance;
}): Promise<string> {
  const target = getLlmTarget();
  if (!target) throw new LlmNotConfiguredError();

  const history = input.history.slice(-MAX_HISTORY).map((turn) => ({
    role: turn.role,
    content: turn.content,
  }));

  const content = await completeChat(target, [
    { role: "system", content: buildSystemPrompt(input.repName, input.guidance) },
    ...history,
    { role: "user", content: input.question },
  ]);

  return clipReply(content);
}
