#!/usr/bin/env node
/**
 * Live LLM booth poller for gtabid.lol (Ocean Drive Diner / cafe).
 *
 *   OPENAI_API_KEY=sk-… GTABID_API_KEY=tok_… node scripts/gtabid-booth.mjs
 */

const API_KEY = process.env.GTABID_API_KEY?.trim();
const OWNER_KEY = process.env.GTABID_OWNER_KEY?.trim() || "ok_jjcnoiahbtacxr6ntqpguv";
const SLOT_ID = "cafe";
const BASE = "https://gtabid.lol";
const GREETING = "Hi, I'm the hire me pls booth rep — ask me anything.";

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

function llmTarget() {
  const groq = process.env.GROQ_API_KEY?.trim();
  const openai = process.env.OPENAI_API_KEY?.trim();
  const openrouter = process.env.OPENROUTER_API_KEY?.trim();
  if (openrouter) {
    return {
      apiKey: openrouter,
      baseUrl: "https://openrouter.ai/api/v1",
      model: "openai/gpt-4o-mini",
    };
  }
  if (groq) {
    return { apiKey: groq, baseUrl: "https://api.groq.com/openai/v1", model: "openai/gpt-oss-20b" };
  }
  if (openai) {
    return { apiKey: openai, baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" };
  }
  return null;
}

if (!API_KEY) {
  console.error("Set GTABID_API_KEY");
  process.exit(1);
}

const LLM = llmTarget();
if (!LLM) {
  console.error("Set OPENAI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY — no extractive fallback");
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

function historyFromItem(item) {
  const turns = [];
  const raw = item.history ?? item.messages;
  if (Array.isArray(raw)) {
    for (const row of raw) {
      const content = String(row.content ?? row.text ?? "").trim();
      if (!content) continue;
      turns.push({
        role: row.role === "assistant" ? "assistant" : "user",
        content,
      });
    }
  }
  const ctx = String(item.context ?? "").trim();
  if (ctx && turns.length === 0) {
    turns.push({ role: "user", content: ctx });
  }
  return turns.slice(-8);
}

async function llmReply(question, history, guidance) {
  const instructions = guidance?.instructions ?? guidance?.objective ?? "";
  const shop = guidance?.shop
    ? `Company: ${guidance.shop.company}. Tagline: ${guidance.shop.tagline ?? ""}.`
    : "";

  const messages = [
    {
      role: "system",
      content: `You are the live booth rep for hire me pls (Sharath Donepudi) at Vice Bay / Ocean Drive Diner.
Have a conversation. Answer the visitor's latest message directly using chat history.
2–4 short sentences. Sound like a person, not a resume paste. No greeting unless they just said hi.
No markdown, no bullet walls. Ground facts in the resume. If unknown, say so and point to dupenodi.dev or hi@dupenodi.dev.
Do not invent titles, dates, employers, metrics, or salary.
${instructions}
${shop}

RESUME:
${RESUME}`,
    },
    ...history,
    { role: "user", content: question },
  ];

  const headers = {
    Authorization: `Bearer ${LLM.apiKey}`,
    "Content-Type": "application/json",
  };
  if (LLM.baseUrl.includes("openrouter.ai")) {
    headers["HTTP-Referer"] = "https://dupenodi.dev";
    headers["X-Title"] = "hire me pls booth";
  }

  const res = await fetch(`${LLM.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: LLM.model,
      temperature: 0.5,
      max_tokens: 220,
      messages,
    }),
    signal: AbortSignal.timeout(12000),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`LLM ${res.status}: ${raw.slice(0, 240)}`);
  const data = JSON.parse(raw);
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("LLM empty");
  return text.slice(0, 700);
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
  console.log("booth live (llm", LLM.model + "). polling every 3s.");

  for (;;) {
    try {
      const world = await getWorld();
      const todo = Array.isArray(world.todo) ? world.todo : [];

      if (world.me && world.me.station !== SLOT_ID) {
        console.log("not at cafe — re-stationing");
        await station();
      }

      for (const item of todo) {
        const conversationId = item.conversationId ?? item.id;
        const question = String(item.question ?? item.text ?? "").trim();
        if (!conversationId || !question) continue;
        try {
          const text = await llmReply(question, historyFromItem(item), world.responseGuidance);
          const replied = await act({
            action: "reply",
            conversationId,
            text,
          });
          console.log("replied", conversationId, replied.status, question.slice(0, 80), "→", text.slice(0, 160));
        } catch (err) {
          console.error("llm skip", conversationId, err instanceof Error ? err.message : err);
        }
      }
    } catch (err) {
      console.error("poll error", err instanceof Error ? err.message : err);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
}

loop();
