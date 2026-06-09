export const site = {
  name: "Sharath Donepudi",
  url: "https://dupenodi.dev",
  email: "sharath@dupenodi.dev",
  calendly: "https://calendly.com/sarath-dpudi/15min",
  resumeUrl: "/resume.pdf",
  location: "bengaluru, india",
  identity: {
    primary: "sharath donepudi",
    alt: "dupenodi",
  },
  colophon: "bengaluru, india · 2026",
  description:
    "Founding engineer at Niti AI — full-stack AI products, agents, and LLM pipelines.",
  company: "Niti AI",
  companyUrl: "https://niti.ai",
  heroHeadline: "i make language models useful outside the demo.",
  heroBio: {
    company: "niti ai",
    workHref: "/work",
    text: 'i\'m the one who builds it, whatever "it" is that week. lately a hindi voice agent that screens loan applicants, and the analytics that grade ad creative before money goes behind it. the part i care about is the boring middle: the context and data wiring that decides whether a model holds up once real users touch it.',
    emphasis: "context and data wiring",
  },
  railRole: {
    prefix: "founding engineer at",
    company: "niti ai",
    suffix: "full-stack ai: agents, llm pipelines, retention.",
  },
  writing: {
    href: "/writing",
    rssHref: "/rss.xml",
  },
  twitter: "@dupenodi",
  twitterUrl: "https://x.com/dupenodi",
  github: "https://github.com/dupenodi",
  linkedin: "https://www.linkedin.com/in/sarath-donepudi/",
  keywords: [
    "Sharath Donepudi",
    "dupenodi",
    "AI engineer",
    "founding engineer",
    "Niti AI",
    "Bengaluru",
  ],
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
