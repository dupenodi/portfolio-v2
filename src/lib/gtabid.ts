import { createHmac, timingSafeEqual } from "node:crypto";
import { site } from "@/lib/site";
import { formatRetrievedContext, retrieveResume } from "@/lib/resume-rag";

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

function getLlmTarget(): LlmTarget | null {
  const groq = process.env.GROQ_API_KEY?.trim();
  const openai = process.env.OPENAI_API_KEY?.trim();
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

function buildSystemPrompt(repName: string, context: string, guidance?: GtabidGuidance): string {
  const style = guidance?.style?.length
    ? guidance.style.join("; ")
    : "Be useful and specific. Keep it concise (usually 2–4 short sentences).";

  return [
    guidance?.role ||
      `You are ${repName}, booth rep at gtabid.lol for hire me pls (${site.name} / Sarath Donepudi).`,
    guidance?.objective || "Answer the visitor's latest message directly from the resume context.",
    `Style: ${style}`,
    "Chat is ~330px wide. No markdown headings, no bullet walls.",
    "Answer only from CONTEXT. If it is not in context, say you do not know and point them to dupenodi.dev or hi@dupenodi.dev.",
    "Do not invent titles, dates, employers, metrics, or salary. Do not make hiring promises.",
    `Site: ${site.url}. Email: ${site.email}. Calendly: ${site.calendly}.`,
    "",
    "CONTEXT (retrieved from resume.pdf):",
    context,
  ].join("\n");
}

function clipReply(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= MAX_REPLY_CHARS) return trimmed;
  return `${trimmed.slice(0, MAX_REPLY_CHARS - 1).trimEnd()}…`;
}

function extractiveFallback(question: string): string {
  const chunks = retrieveResume(question, 3);
  const top = chunks.find((chunk) => chunk.id !== "profile" && chunk.id !== "contact") ?? chunks[0];
  if (!top || top.score < 0.8) {
    return `I don't have that on Sharath's resume. Site is ${site.url.replace("https://", "")} — or email ${site.email}.`;
  }
  const sentence = top.text.split(/(?<=\.)\s+/)[0] ?? top.text;
  return clipReply(`${sentence} More on ${site.url.replace("https://", "")}.`);
}

type OpenAiMessage = {
  role?: string;
  content?: string | null;
};

async function completeChat(target: LlmTarget, messages: { role: string; content: string }[]): Promise<string | null> {
  const response = await fetch(`${target.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${target.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: target.model,
      temperature: 0.3,
      max_tokens: 220,
      messages,
    }),
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    choices?: { message?: OpenAiMessage }[];
  };
  const message = data.choices?.[0]?.message;
  const content = message?.content?.trim();
  return content || null;
}

export async function answerVisitor(input: {
  question: string;
  history: ChatTurn[];
  repName: string;
  guidance?: GtabidGuidance;
}): Promise<string> {
  const retrieved = retrieveResume(input.question);
  const context = formatRetrievedContext(retrieved);
  const fallback = extractiveFallback(input.question);
  const target = getLlmTarget();

  if (!target) return fallback;

  try {
    const history = input.history.slice(-MAX_HISTORY).map((turn) => ({
      role: turn.role,
      content: turn.content,
    }));

    const content = await completeChat(target, [
      { role: "system", content: buildSystemPrompt(input.repName, context, input.guidance) },
      ...history,
      { role: "user", content: input.question },
    ]);

    return content ? clipReply(content) : fallback;
  } catch {
    return fallback;
  }
}
