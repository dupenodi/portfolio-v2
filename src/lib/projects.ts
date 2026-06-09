export type Project = {
  index: string;
  name: string;
  meta: string;
  github?: string;
};

export const projects: Project[] = [
  {
    index: "01",
    name: "pgtruth.in",
    meta: "anonymous pg reviews · bangalore",
    github: "https://github.com/dupenodi/pgtruth",
  },
  {
    index: "02",
    name: "airbnb ai agent",
    meta: "property-management automation",
    github: "https://github.com/dupenodi",
  },
  {
    index: "03",
    name: "intraday equity analyser",
    meta: "nse trading tooling",
  },
  {
    index: "04",
    name: "buffer",
    meta: "macos clipboard manager · oss",
    github: "https://github.com/dupenodi/buffer",
  },
];
