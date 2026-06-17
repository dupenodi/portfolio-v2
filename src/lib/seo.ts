import type { Metadata } from "next";
import { site } from "@/lib/site";

type PageMeta = {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string;
  noIndex?: boolean;
};

export function createMetadata({
  title,
  description,
  path = "/",
  type = "website",
  publishedTime,
  noIndex = false,
}: PageMeta): Metadata {
  const url = new URL(path, site.url).toString();
  const ogImage = new URL("/opengraph-image", site.url).toString();
  const ogImageAlt = site.imageAlt;

  return {
    title,
    description,
    keywords: [...site.keywords],
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": `${site.url}/rss.xml`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: "en_US",
      type,
      ...(publishedTime && type === "article" ? { publishedTime } : {}),
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogImageAlt || title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: site.twitter,
      images: [{ url: ogImage, alt: ogImageAlt || title }],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
  };
}

export function blogPostingJsonLd({
  title,
  description,
  date,
  url,
  answers = [],
}: {
  title: string;
  description: string;
  date: string;
  url: string;
  answers?: string[];
}) {
  const base = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: date,
    dateModified: date,
    url,
    mainEntityOfPage: url,
    author: {
      "@type": "Person",
      name: site.name,
      url: site.url,
    },
    publisher: {
      "@type": "Person",
      name: site.name,
      url: site.url,
    },
    inLanguage: "en",
    image: new URL("/opengraph-image", site.url).toString(),
  };

  if (answers.length === 0) return base;

  return {
    ...base,
    abstract: description,
    about: answers.map((name) => ({ "@type": "Thing", name })),
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: site.url,
    email: site.email,
    jobTitle: "Founding Engineer",
    worksFor: {
      "@type": "Organization",
      name: site.company,
      url: site.companyUrl,
    },
    description: site.description,
    image: new URL(site.image, site.url).toString(),
    knowsAbout: [
      "artificial intelligence",
      "production ai systems",
      "full-stack development",
      "product engineering",
      "platform engineering",
      "system design",
    ],
    sameAs: [
      site.github,
      site.linkedin,
      site.twitterUrl,
      site.calendly,
      `${site.url}/writing`,
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: "en",
    author: { "@type": "Person", name: site.name, url: site.url },
  };
}
