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
      "founding engineer, still the only full-time one. built the bigquery ads analytics layer, ai-assisted creative scoring, and most of the production stack with interns. before that, the no-code platform, client sdks, and multi-tenant backend.",
  },
];
