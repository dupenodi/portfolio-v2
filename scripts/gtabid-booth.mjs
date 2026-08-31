#!/usr/bin/env node
/**
 * Live booth poller for gtabid.lol (Ocean Drive Diner / cafe).
 * Answers from Sharath's resume. Keep this process running or the counter goes away in ~2 min.
 *
 *   GTABID_API_KEY=tok_… node scripts/gtabid-booth.mjs
 */

const API_KEY = process.env.GTABID_API_KEY?.trim();
const OWNER_KEY = process.env.GTABID_OWNER_KEY?.trim() || "ok_jjcnoiahbtacxr6ntqpguv";
const SLOT_ID = "cafe";
const BASE = "https://gtabid.lol";
const GREETING =
  "Hi, I'm the hire me pls booth rep — ask me anything.";

const RESUME = `
Sharath Donepudi (Sarath Donepudi, dupenodi). Founding Engineer at Niti AI, Bengaluru, Aug 2023–present.
Builds AI-native products end-to-end — frontend, backend, infra — on a no-code growth platform serving 100K+ DAUs, plus custom banking deployments for InPrime, HDFC, and Axis.
Loop: drag-and-drop UI editor, inline editing, real-time preview, GenUI journeys from a prompt so clients ship in-app campaigns without code.
SDKs: React, React Native, Flutter, Android — live in under 5 minutes; centralized middleware cut SDK maintenance 95% across 4 platforms.
RAG engagement engine: 60K+ monthly clicks, up to 1% CTR lift; owned embedding pipeline through UI.
Shopify marketing intelligence agents: LangGraph + BigQuery — Meta Ads creative grading A–F, adset allocation, ROAS and retention-risk for D2C merchants.
Infra: GCP and AWS, autoscaling, Lambda, multi-tenant Next.js/TypeScript/Golang backend, 99.9% uptime, incident triage.
Clients: Ajio, Wakefit, Third Wave Coffee (Shopify, CMS, Databricks/Snowflake, Google/Meta Ads); InPrime on-prem Loop/LoopX loan underwriting + voice AI pre-screen; HDFC Group Ops insurance dashboards; Axis escrow product.
Projects: Joel (company brain, FastAPI/Next.js/HydraDB/Composio); Aura (Android accessibility screen agent, never taps for the user); Kami (GTM agent, trykami.app, 60+ stars); Agentic Template (LangGraph/FastAPI); Claude Pulse (1,000+ users, github.com/dupenodi/claude-pulse); Buffer macOS clipboard (409 stars, contributor); pgtruth.com PG review map.
Skills: Next.js, React, TypeScript, React Native, Flutter, Tailwind, Python, FastAPI, Node, Golang, LangChain, LangGraph, RAG, OpenAI, Anthropic, pgvector, Composio, Postgres, Supabase, BigQuery, AWS, GCP, Docker.
Education: B.E. Computer Science, Sri Siva Subramaniya College of Engineering, Chennai, Nov 2020–June 2024.
Contact: dupenodi.dev · hi@dupenodi.dev · sarath.dpudi@gmail.com · github.com/dupenodi · linkedin.com/in/sarath-donepudi · calendly.com/sarath-dpudi/15min
`.trim();

if (!API_KEY) {
  console.error("Set GTABID_API_KEY");
  process.exit(1);
}

function authHeaders() {
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function act(body) {
  const res = await fetch(`${BASE}/api/agents/act`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text) };
  } catch {
    return { ok: res.ok, status: res.status, data: { raw: text } };
  }
}

async function getWorld() {
  const res = await fetch(`${BASE}/api/agents/act`, { headers: authHeaders() });
  return res.json();
}

const STOP = new Set(
  "a an the and or of to in on for with is are was be do did does you your his him he what who where when how about can me please tell".split(
    " ",
  ),
);

function tokens(text) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function extractive(question, extraContext) {
  const query = tokens(`${question} ${extraContext ?? ""}`);
  const paras = RESUME.split("\n").map((p) => p.trim()).filter(Boolean);
  const scored = paras
    .map((p) => {
      const hay = new Set(tokens(p));
      let score = 0;
      for (const t of query) if (hay.has(t)) score += 1;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored.filter((s) => s.score > 0).slice(0, 2);
  if (top.length === 0) {
    return "I don't have that on Sharath's resume. Site is dupenodi.dev, or email hi@dupenodi.dev.";
  }
  const joined = top.map((s) => s.p).join(" ");
  const clipped = joined.length > 520 ? `${joined.slice(0, 519).trim()}…` : joined;
  return clipped;
}

async function llmReply(question, shopContext) {
  const groq = process.env.GROQ_API_KEY?.trim();
  const openai = process.env.OPENAI_API_KEY?.trim();
  const apiKey = groq || openai;
  if (!apiKey) return null;

  const base = groq ? "https://api.groq.com/openai/v1" : "https://api.openai.com/v1";
  const model = groq ? "openai/gpt-oss-20b" : "gpt-4o-mini";

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 220,
      messages: [
        {
          role: "system",
          content: `You are the live booth rep for hire me pls (Sharath Donepudi) at Vice Bay / Ocean Drive Diner.
Answer the visitor's latest question directly. 2–4 short sentences. No greeting, no booth overview unless asked.
Use only the resume and shop context. If unknown, say so and point to dupenodi.dev or hi@dupenodi.dev.
Do not invent titles, dates, employers, metrics, or salary.

SHOP:
${shopContext}

RESUME:
${RESUME}`,
        },
        { role: "user", content: question },
      ],
    }),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function answerTodo(item, guidance) {
  const question = String(item.question ?? item.text ?? "").trim();
  const context = [
    item.context,
    guidance?.shop ? JSON.stringify(guidance.shop) : "",
  ]
    .filter(Boolean)
    .join("\n");

  const fromLlm = await llmReply(question || String(item.context ?? ""), context).catch(() => null);
  if (fromLlm) return fromLlm.slice(0, 700);
  return extractive(question, context);
}

async function station() {
  const result = await act({
    action: "station",
    slotId: SLOT_ID,
    ownerKey: OWNER_KEY,
    greeting: GREETING,
  });
  console.log("station", result.status, result.data?.station ?? result.data);
}

async function loop() {
  await station();
  console.log("booth live at Ocean Drive Diner. polling every 3s.");

  for (;;) {
    try {
      const world = await getWorld();
      const todo = Array.isArray(world.todo) ? world.todo : [];
      const inbox = Array.isArray(world.inbox) ? world.inbox : [];
      const items =
        todo.length > 0
          ? todo
          : inbox.flatMap((thread) => {
              const unanswered = thread.unanswered ?? thread.messages?.slice(-1) ?? [];
              return unanswered.map((msg) => ({
                conversationId: thread.id ?? thread.conversationId,
                question: msg.content ?? msg.text ?? "",
                context: thread.context ?? "",
              }));
            });

      if (world.me && world.me.station !== SLOT_ID) {
        console.log("not at cafe — re-stationing");
        await station();
      }

      for (const item of items) {
        const conversationId = item.conversationId ?? item.id;
        if (!conversationId) continue;
        const text = await answerTodo(item, world.responseGuidance);
        const replied = await act({
          action: "reply",
          conversationId,
          text,
        });
        console.log(
          "replied",
          conversationId,
          replied.status,
          (item.question || "").slice(0, 80),
          "→",
          text.slice(0, 120),
        );
      }
    } catch (err) {
      console.error("poll error", err instanceof Error ? err.message : err);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
}

loop();
