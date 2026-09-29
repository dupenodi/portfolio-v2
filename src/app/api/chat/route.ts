import { z } from "zod";
import { chatSystemPrompt } from "@/lib/chat-prompt";
import { site } from "@/lib/site";

// The phone chat: streams a reply from OpenRouter as plain text.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MODEL = "anthropic/claude-sonnet-5";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(1000) }))
    .min(1)
    .max(40),
});

// Light per-IP limit so the endpoint can't be run up: 30 messages per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 30;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

export async function POST(request: Request) {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) return new Response("chat isn't set up yet.", { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) return new Response("slow down a little. try again in a few minutes.", { status: 429 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response("bad request", { status: 400 });
  // Only the recent part of the conversation is needed.
  const history = parsed.data.messages.slice(-16);

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": site.url,
      "X-Title": "dupenodi.dev phone",
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      max_tokens: 400,
      temperature: 0.85,
      messages: [{ role: "system", content: await chatSystemPrompt() }, ...history],
    }),
    signal: request.signal,
  }).catch(() => null);

  if (!upstream?.ok || !upstream.body) {
    console.error("[chat] upstream failed", upstream?.status, await upstream?.text().catch(() => ""));
    return new Response("my phone's acting up. try again in a bit?", { status: 502 });
  }

  // OpenRouter sends server-sent events; pass just the text deltas through.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let newline: number;
          while ((newline = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, newline).trim();
            buffer = buffer.slice(newline + 1);
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const text = JSON.parse(data)?.choices?.[0]?.delta?.content;
              if (typeof text === "string" && text) controller.enqueue(encoder.encode(text));
            } catch {
              // Keep-alive comments and partial lines are skipped.
            }
          }
        }
      } catch (error) {
        console.error("[chat] stream error", error);
      } finally {
        controller.close();
      }
    },
    cancel() {
      upstream.body?.cancel();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
