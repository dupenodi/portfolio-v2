export type WorkItem = {
  index: string;
  role: string;
  company: string;
  period: string;
  description: string;
};

export const workItems: WorkItem[] = [
  {
    index: "a",
    role: "founding engineer",
    company: "niti ai",
    period: "2023 — now",
    description:
      "sole full-time engineer with interns. built it all from nothing: a bigquery-backed meta ads analytics layer, llm grading pipelines for ad creative, and a hindi/hinglish voice agent for loan pre-screening. the job is whatever needs shipping that week.",
  },
  {
    index: "b",
    role: "software engineer",
    company: "earlier",
    period: "2022 — 2023",
    description:
      "backend and integrations. where i got serious about putting ml pipelines into production and learning what \"deployed\" actually has to mean.",
  },
];
