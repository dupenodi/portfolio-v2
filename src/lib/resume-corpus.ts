/**
 * RAG corpus extracted from `public/resume.pdf` (1 page).
 * Re-extract if the PDF changes — this is the source the booth answers from.
 */

export type ResumeChunk = {
  id: string;
  title: string;
  text: string;
};

export const resumeChunks: ResumeChunk[] = [
  {
    id: "profile",
    title: "profile",
    text: `Sarath Donepudi (also Sharath Donepudi, handle dupenodi). Founding Engineer building AI-native products end-to-end — frontend to backend to infra — across a no-code growth platform serving 100K+ DAUs and custom banking deployments for InPrime, HDFC, and Axis. Based in Bengaluru, India.`,
  },
  {
    id: "contact",
    title: "contact",
    text: `Email sarath.dpudi@gmail.com. Site dupenodi.dev. GitHub github.com/dupenodi. LinkedIn linkedin.com/in/sarath-donepudi. Phone +91-911-0316-645. Portfolio contact hi@dupenodi.dev. Calendly https://calendly.com/sarath-dpudi/15min.`,
  },
  {
    id: "niti",
    title: "niti ai — founding engineer",
    text: `Niti AI (founded by ex-Uber, Microsoft, Amazon engineers), Bengaluru, India. Founding Engineer, Aug 2023 – Present. Joined with the founding team. Builds AI-native products end-to-end.`,
  },
  {
    id: "loop",
    title: "loop — no-code growth platform",
    text: `No-code Growth Platform (Loop): built the core product as part of the founding team — a no-code platform for creating in-app growth experiences. Shipped a drag-and-drop UI editor with inline editing, real-time preview, and GenUI to generate complete user journeys from a single prompt — enabling clients to ship in-app campaigns without writing a line of code.`,
  },
  {
    id: "sdks",
    title: "sdk suite",
    text: `Platform-Agnostic SDK Suite: shipped production-grade SDKs for React, React Native, Flutter, and Android enabling client integrations in under 5 minutes, via a centralized middleware architecture that cut SDK maintenance overhead by 95% across 4 platforms.`,
  },
  {
    id: "engagement",
    title: "ai engagement engine",
    text: `AI-Powered Engagement Engine: built the RAG-based recommendation system that drove 60K+ monthly clicks with up to 1% CTR lift across client apps. Owned the full stack from embedding pipeline to UI rendering — no handoffs.`,
  },
  {
    id: "shopify-agents",
    title: "shopify marketing intelligence agents",
    text: `Shopify Marketing Intelligence Agents: built the multi-agent LLM system (LangGraph + BigQuery) behind Niti AI’s growth intelligence product — a Meta Ads creative grading pipeline (A–F letter grades), an adset allocation/recommendation engine, and cross-channel ROAS and retention-risk analysis for D2C Shopify merchants.`,
  },
  {
    id: "infra",
    title: "infrastructure devops aiops",
    text: `Infrastructure, DevOps & AIOps: owned all infrastructure and DevOps across GCP and AWS — instance and cluster management, autoscaling, and Lambda-based serverless workflows — supporting a multi-tenant backend serving 100K+ DAUs at 99.9% uptime using Next.js, TypeScript, and Golang. Led production incident triage and reliability fixes.`,
  },
  {
    id: "clients",
    title: "client work",
    text: `Client integrations — Ajio, Wakefit, Third Wave Coffee, InPrime, HDFC, Axis. D2C (Ajio, Wakefit, Third Wave Coffee — integrating Shopify, custom in-house CMS, Databricks/Snowflake, and Google/Meta Ads data) and enterprise banking (on-prem deployments of Loop/LoopX for InPrime’s loan underwriting workflows and voice AI pre-screening agent, HDFC Group Ops’ insurance dashboards and AI-driven user journeys, and a full escrow product for Axis) — scoping solutions and shipping features end-to-end, including infra setup and team leadership on the HDFC/Axis engagements.`,
  },
  {
    id: "joel",
    title: "project joel",
    text: `Joel — Self-Hostable Company Brain (Python/FastAPI, Next.js, HydraDB, Composio): multi-workspace company memory system that connects Slack, Gmail, GitHub, Linear, and more via Composio, distills threads into structured artifacts, resolves entities into a HydraDB ontology with a decision-reversal ledger, and answers with multi-lane retrieval plus abstention. Surfaces: web chat, MCP ask tool, and Slack bot — visibility always derived server-side from who is asking and which room they are in.`,
  },
  {
    id: "aura",
    title: "project aura",
    text: `Aura — Voice-Driven Android Screen Agent (Kotlin, Android Accessibility, Mobile-use): on-device Android assistant that reads the accessibility tree, runs an LLM agent loop to pick the next UI step, and guides the user with an overlay cursor and spotlight — never taps or types for them. Multi-provider LLM routing (local Ollama / OpenRouter / Anthropic / OpenAI) with voice summon bubble and step-gated progression.`,
  },
  {
    id: "kami",
    title: "project kami",
    text: `Kami — AI Go-to-Market Agency for Startups (Next.js, TypeScript, Hermes, Supabase): co-built an open-source, self-hosted GTM agent (60+ GitHub stars) that researches customers and drafts outreach from a company dossier — human approval before any send/post. Orchestrates local Hermes agents with Supabase-backed campaign state; live at trykami.app.`,
  },
  {
    id: "agentic-template",
    title: "project agentic template",
    text: `Agentic Template — AI Workflow Orchestration Starter (FastAPI, LangGraph, PostgreSQL): production-oriented starter framework for agentic AI systems — workflow state management, persistence, checkpointing, and REST APIs for long-running multi-step workflows, with extensible graph-based execution patterns for custom agents and RAG pipelines.`,
  },
  {
    id: "claude-pulse",
    title: "project claude pulse",
    text: `Claude Pulse — Chrome Extension for Claude Usage Observability (JavaScript, Chrome Extensions API): open-source Chrome extension with 1,000+ users that surfaces real-time Claude usage metrics — context window tokens, cache countdown, and 5-hour / 7-day rate limits — plus one-click chat export to text/Markdown. Fully local and private. Source: github.com/dupenodi/claude-pulse.`,
  },
  {
    id: "buffer",
    title: "project buffer",
    text: `Buffer — macOS Clipboard Manager (Swift, SwiftUI, AppKit): major contributor to an open-source macOS clipboard manager with 409 GitHub stars and 3,190+ downloads. On-device OCR via Apple Vision, disk-backed storage, pins, bookmarks, multi-select paste, and configurable global hotkeys. ~2 MB install, fully local and private. Maintained by samirpatil2000.`,
  },
  {
    id: "pgtruth",
    title: "project pgtruth",
    text: `pgtruth.com — Crowdsourced PG Review Map (Next.js 14, Supabase, Mapbox GL JS): anonymous map-based review platform for paying guest accommodations in Bangalore — geolocation search, user submissions, and interactive map rendering.`,
  },
  {
    id: "skills",
    title: "skills",
    text: `Frontend: Next.js, React.js, TypeScript, React Native, Flutter, Tailwind CSS. Backend: Python, FastAPI, Node.js, Golang. AI / ML: LangChain, LangGraph, RAG Systems, OpenAI & Anthropic APIs, pgvector, Composio. Data & Infra: PostgreSQL, Supabase, BigQuery, HydraDB. Cloud & DevOps: AWS (EC2, S3, Lambda), GCP, Docker.`,
  },
  {
    id: "education",
    title: "education",
    text: `Sri Siva Subramaniya College of Engineering, Chennai, India. Bachelor of Engineering — Computer Science, Nov 2020 – June 2024.`,
  },
];

export const resumeFullText = resumeChunks.map((chunk) => `## ${chunk.title}\n${chunk.text}`).join("\n\n");
