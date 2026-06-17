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
    "Founding engineer at Niti AI. Builds the product layer that makes AI systems work in production — products, platform, and the infra between.",
  company: "Niti AI",
  companyUrl: "https://niti.ai",
  heroHeadline: "i build the product layer that makes AI systems work in production.",
  heroBio: {
    company: "niti ai",
    workHref: "/work",
    text: 'i\'m the one who builds it, whatever "it" is that week. lately a hindi voice agent that screens loan applicants, and the analytics that grade ad creative before money goes behind it. the part i care about is the boring middle: the data pipelines, the system design, and the product plumbing that holds together when real users touch it.',
    emphasis: "data pipelines, the system design, and the product plumbing",
  },
  railRole: {
    prefix: "founding engineer at",
    company: "niti ai",
    suffix: "full-stack: products, platform, and the infra between.",
  },
  writing: {
    href: "/writing",
    rssHref: "/rss.xml",
  },
  twitter: "@dupenodi",
  twitterUrl: "https://x.com/dupenodi",
  github: "https://github.com/dupenodi",
  linkedin: "https://www.linkedin.com/comm/in/sarath-donepudi/",
  linkedinApp: "linkedin://in/sarath-donepudi",
  keywords: [
    "Sharath Donepudi",
    "dupenodi",
    "AI engineer",
    "founding engineer",
    "product engineering",
    "platform engineering",
    "Niti AI",
    "Bengaluru",
  ],
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
