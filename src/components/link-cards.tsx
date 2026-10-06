"use client";

import { play } from "cuelume";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { ContributionDay, GitHubCard as GitHubData } from "@/lib/github-card";
import type { LinkedInCard as LinkedInData } from "@/lib/linkedin-card";
import type { XCard as XData } from "@/lib/x-card";
import { site } from "@/lib/site";

// Hover cards for the hero's links, each dressed like the place the link goes. They follow the page's light/dark
// tone the way the real sites follow the system's. Every control on them does the real thing; nothing is decoration.
// The cards are aria-hidden (each is a richer version of its link, which stays the accessible way in), so their
// controls are kept out of the tab order.

const AVATAR = "/media/avatar.jpg";
const external = { target: "_blank", rel: "noreferrer", tabIndex: -1 } as const;
// A physical press and release on the cards' buttons (muted with the rest of the page's sound).
const pressable = { "data-cuelume-press": "", "data-cuelume-release": "" } as const;

function compact(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n);
}

function Svg({ d, size = 16, className }: { d: string | string[]; size?: number; className?: string }) {
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className={className} aria-hidden="true">
      {(Array.isArray(d) ? d : [d]).map((path) => (
        <path key={path} d={path} fill="currentColor" />
      ))}
    </svg>
  );
}

// A flag that flips on, then back off after a moment: "copied", "downloading", and so on.
function useFlash(ms: number) {
  const [on, setOn] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const flash = () => {
    window.clearTimeout(timer.current);
    setOn(true);
    timer.current = window.setTimeout(() => setOn(false), ms);
  };
  return [on, flash] as const;
}

const ICON = {
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  send: "M2.01 21 23 12 2.01 3 2 10l15 2-15 2z",
  verified:
    "M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.438 1.69-.882.445-.47.75-1.055.88-1.69.131-.634.084-1.292-.139-1.899.584-.274 1.083-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z",
  external:
    "M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z",
  tray: "M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z",
  arrow:
    "M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z",
  check:
    "M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z",
};

// ── niti.ai: a little browser window with the live site's homepage; the whole window opens the site ──
// Without an href it's just the window (the projects' cursor preview, where the card under it is the link).

export function SiteCard({ href, host, image, caption }: { href?: string; host: string; image: string; caption?: string }) {
  const Shell = href ? "a" : "div";
  return (
    <Shell {...(href ? { href, ...external } : {})} className="site-card">
      <div className="site-card-bar">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        {/* The address bar turns into the call to action while the pointer's on the window. */}
        <span className="site-card-url">
          <span>{host}</span>
          <span>
            open {host} <Svg d={ICON.external} className="site-card-go" />
          </span>
        </span>
      </div>
      <div className="site-card-shot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* Keep the complete screenshot visible: cover, zoom and drift crop edge text. */}
        <img src={image} alt="" width={960} height={540} decoding="async"
          style={{ objectFit: "contain", objectPosition: "center", scale: "1", translate: "none" }} />
      </div>
      {caption ? <p className="site-card-caption">{caption}</p> : null}
    </Shell>
  );
}

// ── email: a mail compose window, already addressed. click the address to copy it; send opens your mail app ──

const MAIL_SUBJECT = "hey sharath 👋";
const MAIL_BODY = "saw your site. wanted to say hi";

export function MailCard() {
  const [copied, flashCopied] = useFlash(1600);
  const [sending, flashSending] = useFlash(900);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      flashCopied();
      play("success");
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };
  const send = () => {
    flashSending();
    play("sparkle");
    // Let the plane leave before the mail app takes focus.
    window.setTimeout(() => {
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(MAIL_SUBJECT)}&body=${encodeURIComponent(MAIL_BODY)}`;
    }, 380);
  };

  return (
    <div className="mail-card">
      <div className="mail-card-bar">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="mail-card-title">New Message</span>
        <button
          type="button"
          tabIndex={-1}
          className="mail-card-send"
          data-sending={sending || undefined}
          onClick={send}
          {...pressable}
        >
          <Svg d={ICON.send} size={24} />
        </button>
      </div>
      <div className="mail-card-row">
        <span>To:</span>
        <button
          type="button"
          tabIndex={-1}
          className="mail-card-chip"
          data-copied={copied || undefined}
          onClick={copy}
          {...pressable}
        >
          <span className="mail-card-slot">
            <span>{site.email}</span>
            <span>
              <Svg d={ICON.check} /> copied
            </span>
          </span>
        </button>
      </div>
      <div className="mail-card-row">
        <span>Subject:</span>
        <span className="mail-card-subject">{MAIL_SUBJECT}</span>
      </div>
      <p className="mail-card-body">
        <span className="mail-card-typed">{MAIL_BODY}</span>
      </p>
    </div>
  );
}

// ── resume: the pdf itself, in a viewer window, with open and download in the toolbar ──

export function PdfCard({ href, image }: { href: string; image: string }) {
  const [saved, flashSaved] = useFlash(1800);
  return (
    <div className="pdf-card">
      <div className="pdf-card-bar">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="pdf-card-title">
          resume.pdf
          <small>Page 1 of 1</small>
        </span>
        <span className="pdf-card-tools">
          <a href={href} {...external} {...pressable} className="pdf-card-tool" data-tip="Open">
            <Svg d={ICON.external} />
          </a>
          <a
            href={href}
            download="Sarath-Donepudi-Resume.pdf"
            tabIndex={-1}
            className="pdf-card-tool"
            data-tip={saved ? "Saved" : "Download"}
            data-saved={saved || undefined}
            onClick={() => {
              flashSaved();
              play("success");
            }}
            {...pressable}
          >
            <Svg d={[ICON.tray, ICON.arrow]} className="pdf-card-download" />
            <Svg d={ICON.check} className="pdf-card-saved" />
          </a>
        </span>
      </div>
      <a href={href} {...external} className="pdf-card-canvas">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" width={720} height={1019} decoding="async" />
      </a>
    </div>
  );
}

// ── github: primer's hover card, plus the contribution graph with github's per-day tooltips ──

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function describe(day: ContributionDay) {
  const date = new Date(`${day.date}T00:00:00Z`);
  const month = date.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const count = day.count === 0 ? "No contributions" : `${day.count} contribution${day.count === 1 ? "" : "s"}`;
  return `${count} on ${month} ${ordinal(date.getUTCDate())}.`;
}

function Graph({ weeks }: { weeks: GitHubData["weeks"] }) {
  const cell = 5;
  const step = 6;
  const width = weeks.length * step - (step - cell);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const rect = e.target instanceof SVGRectElement ? e.target : null;
    const day = rect ? weeks[Number(rect.dataset.x)]?.[Number(rect.dataset.y)] : null;
    if (!rect || !day) return setTip(null);
    const box = rect.getBoundingClientRect();
    const frame = e.currentTarget.getBoundingClientRect();
    setTip({ x: box.left + box.width / 2 - frame.left, y: box.top - frame.top, text: describe(day) });
  };

  return (
    <div className="gh-card-plot">
      <svg
        viewBox={`0 0 ${width} ${7 * step - (step - cell)}`}
        width="100%"
        aria-hidden="true"
        onPointerMove={onMove}
        onPointerLeave={() => setTip(null)}
      >
        {weeks.map((week, x) =>
          week.map((day, y) =>
            day ? (
              <rect
                key={day.date}
                x={x * step}
                y={y * step}
                width={cell}
                height={cell}
                rx={1}
                data-x={x}
                data-y={y}
                className={`gh-l${day.level}`}
                style={{ "--c": x } as CSSProperties}
              />
            ) : null,
          ),
        )}
      </svg>
      {tip && (
        <span className="gh-card-tip" style={{ left: tip.x, top: tip.y }}>
          {tip.text}
        </span>
      )}
    </div>
  );
}

export function GitHubCard({ data }: { data: GitHubData }) {
  const profile = `https://github.com/${data.login}`;
  return (
    <a href={profile} {...external} className="gh-card">
      <div className="gh-card-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={AVATAR} alt="" width={32} height={32} className="gh-card-avatar" />
        <div>
          <p className="gh-card-name">
            <strong>{data.login}</strong>
          </p>
          <p className="gh-card-meta">
            <b>{data.followers}</b> followers · <b>{data.repos}</b> repos
          </p>
        </div>
      </div>
      <div className="gh-card-graph">
        <p>{data.total.toLocaleString("en-US")} contributions in the last year</p>
        <Graph weeks={data.weeks} />
        <div className="gh-card-legend">
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <i key={l} className={`gh-l${l}`} />
          ))}
          More
        </div>
      </div>
    </a>
  );
}

// ── x: x.com's profile hover card. follow takes you to the profile, where the real follow button is ──

// Links in the bio show the way x shows them: blue, without the protocol, and they go where they say.
function Bio({ text }: { text: string }) {
  return text.split(/(https?:\/\/\S+)/).map((part, i) =>
    i % 2 ? (
      <a key={i} href={part} {...external} className="x-card-link">
        {part.replace(/^https?:\/\//, "")}
      </a>
    ) : (
      part
    ),
  );
}

export function XCard({ data }: { data: XData }) {
  const profile = `https://x.com/${data.handle}`;
  return (
    <div className="x-card">
      <div className="x-card-head">
        <a href={profile} {...external} className="x-card-avatar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.avatar} alt="" width={64} height={64} />
        </a>
        <a href={profile} {...external} {...pressable} className="x-card-follow">
          Follow
        </a>
      </div>
      <a href={profile} {...external} className="x-card-who">
        <span className="x-card-name">
          {data.name}
          {data.verified && <Svg d={ICON.verified} size={24} className="x-card-verified" />}
        </span>
        <span className="x-card-handle">@{data.handle}</span>
      </a>
      {data.bio && (
        <p className="x-card-bio">
          <Bio text={data.bio} />
        </p>
      )}
      <p className="x-card-stats">
        <a href={`${profile}/following`} {...external}>
          <b>{compact(data.following)}</b> Following
        </a>
        <a href={`${profile}/followers`} {...external}>
          <b>{compact(data.followers)}</b> Followers
        </a>
      </p>
    </div>
  );
}

// ── linkedin: the profile badge, whose one action is linkedin's own: view profile ──

export function LinkedInCard({ data }: { data: LinkedInData }) {
  const niti = data.company?.toLowerCase().includes("niti");
  return (
    <div className="li-card">
      <div
        className="li-card-banner"
        style={data.banner ? { backgroundImage: `url("${data.banner}")`, backgroundSize: "cover" } : undefined}
      >
        <Svg d={ICON.linkedin} size={24} className="li-card-logo" />
      </div>
      <a href={site.linkedin} {...external} className="li-card-avatar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={data.photo ?? AVATAR} alt="" width={72} height={72} referrerPolicy="no-referrer" />
      </a>
      <div className="li-card-body">
        <a href={site.linkedin} {...external} className="li-card-name">
          {data.name}
        </a>
        {(data.headline ?? data.about) && <p className="li-card-headline">{data.headline ?? data.about}</p>}
        {data.location && <p className="li-card-muted">{data.location}</p>}
        {(data.followers !== null || data.connections) && (
          <p className="li-card-muted">
            {data.followers !== null && (
              <span className="li-card-connections">{data.followers.toLocaleString("en-US")} followers</span>
            )}
            {data.followers !== null && data.connections && " · "}
            {data.connections && <span className="li-card-connections">{data.connections} connections</span>}
          </p>
        )}
        {(data.company || data.school) && (
          <ul className="li-card-orgs">
            {data.company && (
              <li>
                {niti ? (
                  <a href={site.companyUrl} {...external}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/media/niti-logo-2.webp" alt="" width={20} height={20} className="li-card-org" />
                    <span>{data.company}</span>
                  </a>
                ) : (
                  <>
                    <span className="li-card-org">{data.company[0]}</span>
                    <span>{data.company}</span>
                  </>
                )}
              </li>
            )}
            {data.school && (
              <li>
                <span className="li-card-org">{data.school[0]}</span>
                <span>{data.school}</span>
              </li>
            )}
          </ul>
        )}
        <a href={site.linkedin} {...external} {...pressable} className="li-card-view">
          View profile
        </a>
      </div>
    </div>
  );
}
