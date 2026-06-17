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
      "sole full-time engineer with interns. built it all from nothing: a bigquery-backed meta ads analytics layer, an AI-assisted creative scoring system, and a hindi/hinglish voice agent for loan pre-screening. the job is whatever needs shipping that week.",
  },
];
