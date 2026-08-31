import { resumeChunks, type ResumeChunk } from "@/lib/resume-corpus";

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "for",
  "with",
  "is",
  "are",
  "was",
  "be",
  "do",
  "did",
  "does",
  "you",
  "your",
  "his",
  "him",
  "he",
  "what",
  "who",
  "where",
  "when",
  "how",
  "about",
  "can",
  "me",
  "please",
  "tell",
]);

const ALIASES: Record<string, string[]> = {
  sharath: ["sarath", "dupenodi"],
  sarath: ["sharath", "dupenodi"],
  dupenodi: ["sarath", "sharath"],
  hire: ["founding", "engineer", "role"],
  job: ["founding", "engineer", "role"],
  stack: ["skills", "frontend", "backend"],
  tech: ["skills"],
  school: ["education", "college", "degree"],
  college: ["education", "degree"],
  email: ["contact"],
  phone: ["contact"],
  reach: ["contact", "calendly"],
  book: ["calendly", "contact"],
  call: ["calendly", "contact"],
};

export type RankedChunk = ResumeChunk & { score: number };

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((token) => token.length > 1 && !STOP.has(token));
}

function expand(tokens: string[]): string[] {
  const out = new Set(tokens);
  for (const token of tokens) {
    for (const alias of ALIASES[token] ?? []) out.add(alias);
  }
  return [...out];
}

/** Rank resume chunks for a visitor question. Always keeps profile + contact. */
export function retrieveResume(question: string, limit = 5): RankedChunk[] {
  const query = expand(tokenize(question));
  const ranked: RankedChunk[] = resumeChunks.map((chunk) => {
    const hay = tokenize(`${chunk.title} ${chunk.text}`);
    const counts = new Map<string, number>();
    for (const token of hay) counts.set(token, (counts.get(token) ?? 0) + 1);

    let score = 0;
    for (const token of query) {
      const tf = counts.get(token) ?? 0;
      if (tf > 0) score += 1 + Math.log(1 + tf);
    }
    if (chunk.id === "profile" || chunk.id === "contact") score += 0.15;
    return { ...chunk, score };
  });

  ranked.sort((a, b) => b.score - a.score);

  const picked = new Map<string, RankedChunk>();
  for (const chunk of ranked) {
    if (chunk.id === "profile" || chunk.id === "contact") picked.set(chunk.id, chunk);
  }
  for (const chunk of ranked) {
    if (picked.size >= limit) break;
    picked.set(chunk.id, chunk);
  }

  return [...picked.values()].sort((a, b) => b.score - a.score);
}

export function formatRetrievedContext(chunks: RankedChunk[]): string {
  return chunks.map((chunk) => `### ${chunk.title}\n${chunk.text}`).join("\n\n");
}
