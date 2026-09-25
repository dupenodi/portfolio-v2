"use client";

import { useRef, useState } from "react";

// The address as a mailto, and beside it a quiet button that copies it instead, for people without a mail app set up.
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <span className="copy-email">
      <a href={`mailto:${email}`} data-cuelume-hover="tick">
        {email}
      </a>
      <button type="button" onClick={copy} data-copied={copied || undefined} aria-live="polite">
        {copied ? "copied" : "copy"}
      </button>
    </span>
  );
}
