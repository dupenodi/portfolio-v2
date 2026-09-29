export const site = {
  name: "Sharath Donepudi",
  url: "https://dupenodi.dev",
  email: "hi@dupenodi.dev",
  calendly: "https://calendly.com/sarath-dpudi/15min",
  resumeUrl: "/resume.pdf",
  location: "bengaluru, india",
  image: "/joel.png",
  imageAlt: "Illustration of Sharath Donepudi",
  identity: {
    primary: "sharath donepudi",
    alt: "dupenodi",
  },
  colophon: "bengaluru, india · 2026",
  description:
    "founding fullstack engineer at niti ai (2023-2026). builds growth products, client sdks, and the infra that serves 100k+ daily users.",
  company: "Niti AI",
  companyUrl: "https://niti.ai",
  heroHeadline: "i build products end to end, including the boring middle between a demo and something people actually use.",
  heroBio: {
    company: "niti ai",
    workHref: "/work",
    text: "i joined with the founding team and owned the stack end to end. built loop, the sdks, and the rag engine that drove 60k+ monthly clicks across client apps. the part i care about is the boring middle: the data pipelines, the system design, and the product plumbing that holds together when real users touch it.",
    emphasis: "data pipelines, the system design, and the product plumbing",
  },
  railRole: {
    prefix: "founding fullstack engineer at",
    company: "niti ai",
    suffix: "products, platform, and the infra between.",
  },
  writing: {
    href: "/writing",
    rssHref: "/rss.xml",
  },
  twitter: "@dupenodi",
  twitterUrl: "https://x.com/dupenodi",
  github: "https://github.com/dupenodi",
  linkedin: "https://www.linkedin.com/in/sarath-donepudi/",
  linkedinApp: "linkedin://in/sarath-donepudi",
  keywords: [
    "Sharath Donepudi",
    "dupenodi",
    "AI engineer",
    "founding fullstack engineer",
    "founding engineer",
    "product engineering",
    "platform engineering",
    "RAG",
    "Niti AI",
    "Bengaluru",
  ],
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
