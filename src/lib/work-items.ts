// Skills, for the phone chat's notes. Experience itself lives in Supabase (see src/lib/experience.ts).
export const skillGroups = [
  { label: "frontend", items: "next.js, react, typescript, react native, flutter, tailwind, zustand, shadcn" },
  { label: "backend", items: "node.js, fastapi, express, golang, python" },
  { label: "data", items: "postgresql, supabase, mongodb, redis, elasticsearch" },
  { label: "ai", items: "langchain, langgraph, rag, openai, anthropic, pgvector" },
  { label: "cloud", items: "aws, gcp, docker, kafka, github actions" },
] as const;
