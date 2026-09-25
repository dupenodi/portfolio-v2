"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

// iMessage (dark mode) on an iPhone, zooming up out of the phone on the studio floor. Messages go to
// /api/chat, which streams the AI stand-in's reply back as plain text.

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message[] = [
  { role: "assistant", content: "hey! this is an ai version of me, texting from my phone." },
  { role: "assistant", content: "ask me anything about my work, projects, or what i'm up to." },
];

// The model splits longer replies with blank lines: each part becomes its own bubble, like real texting.
const bubblesOf = (m: Message) => m.content.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

function nowLabel() {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());
}

export function PhoneChat({ open, origin, onClose }: { open: boolean; origin: { x: number; y: number } | null; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>(GREETING);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Mounted (for the closing animation) vs visible (animated in).
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [clock, setClock] = useState(nowLabel);
  const [openedAt] = useState(nowLabel);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Open: mount first, then flip to shown next frame so the zoom transition runs. Close: reverse.
  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 420);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 380);
    const tick = setInterval(() => setClock(nowLabel()), 15000);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      clearInterval(tick);
      removeEventListener("keydown", onKey);
    };
  }, [shown, onClose]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending, mounted]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || pending) return;
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setDraft("");
    setPending(true);
    setError(null);
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The greeting is UI, not conversation.
        body: JSON.stringify({ messages: next.slice(GREETING.length) }),
        signal: abort.signal,
      });
      if (!res.ok || !res.body) {
        setError((await res.text().catch(() => "")) || "couldn't send. try again?");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        const content = reply;
        setMessages([...next, { role: "assistant", content }]);
      }
      if (!reply.trim()) setError("no reply came back. try again?");
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("not delivered. check your connection?");
    } finally {
      setPending(false);
    }
  }, [draft, messages, pending]);

  if (!mounted) return null;

  // Zoom from the phone's spot on screen to the middle of the viewport.
  const from = origin ?? { x: innerWidth / 2, y: innerHeight };
  const dx = from.x - innerWidth / 2;
  const dy = from.y - innerHeight / 2;
  const waiting = pending && messages[messages.length - 1]?.role === "user";
  const lastUser = messages.map((m) => m.role).lastIndexOf("user");

  return (
    <div className={`phone-overlay${shown ? " is-open" : ""}`} onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="iphone"
        role="dialog"
        aria-modal="true"
        aria-label="chat with sharath"
        style={{ transform: shown ? "none" : `translate(${dx}px, ${dy}px) scale(0.06) rotateX(55deg)` }}
      >
        <div className="iphone-screen">
          <div className="ios-status">
            <span>{clock.replace(/\s?[AP]M$/, "")}</span>
            <span className="ios-island" aria-hidden />
            <span className="ios-icons" aria-hidden>
              <svg width="18" height="11" viewBox="0 0 18 11">
                <rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" />
                <rect x="5" y="5" width="3" height="6" rx="1" fill="currentColor" />
                <rect x="10" y="2.5" width="3" height="8.5" rx="1" fill="currentColor" />
                <rect x="15" y="0" width="3" height="11" rx="1" fill="currentColor" />
              </svg>
              <svg width="16" height="11" viewBox="0 0 16 11">
                <path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.3-1.3A10.3 10.3 0 0 0 8 .3 10.3 10.3 0 0 0 .7 3.3L2 4.6a8.5 8.5 0 0 1 6-2.4Z" fill="currentColor" />
                <path d="M8 5.6c1.4 0 2.6.5 3.6 1.4l1.3-1.3A7 7 0 0 0 8 3.7a7 7 0 0 0-4.9 2l1.3 1.3c1-.9 2.2-1.4 3.6-1.4Z" fill="currentColor" />
                <path d="M8 8.9c.5 0 1 .2 1.3.5L8 10.8 6.7 9.4c.3-.3.8-.5 1.3-.5Z" fill="currentColor" />
              </svg>
              <svg width="26" height="12" viewBox="0 0 26 12">
                <rect x="0.5" y="0.5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity="0.4" />
                <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor" />
                <rect x="23.5" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.4" />
              </svg>
            </span>
          </div>

          <header className="ios-header">
            <button type="button" className="ios-back" onClick={onClose} aria-label="close chat">
              <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden>
                <path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="ios-contact">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={site.image} alt="" className="ios-avatar" />
              <span className="ios-name">
                sharath <span aria-hidden>›</span>
              </span>
            </div>
          </header>

          <div className="ios-thread" ref={scrollRef}>
            <p className="ios-stamp">
              <strong>iMessage</strong>
              <br />
              Today {openedAt}
            </p>
            {messages.map((m, mi) =>
              bubblesOf(m).map((text, bi, all) => {
                const next = messages[mi + 1];
                const lastOfGroup = bi === all.length - 1 && (!next || next.role !== m.role);
                return (
                  <div key={`${mi}-${bi}`} className={`ios-bubble ${m.role === "user" ? "out" : "in"}${lastOfGroup ? " tail" : ""}`}>
                    {text}
                  </div>
                );
              }),
            )}
            {waiting ? (
              <div className="ios-bubble in tail ios-typing" aria-label="typing">
                <span />
                <span />
                <span />
              </div>
            ) : null}
            {!pending && !error && lastUser >= 0 && lastUser === messages.length - 1 ? <p className="ios-receipt">Delivered</p> : null}
            {error ? <p className="ios-error">{error}</p> : null}
          </div>

          <form
            className="ios-compose"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              maxLength={1000}
              placeholder="iMessage"
              aria-label="message"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button type="submit" className="ios-send" aria-label="send" disabled={!draft.trim() || pending} data-ready={draft.trim() ? "" : undefined}>
              <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden>
                <path d="M7 15V2M1.5 7.5 7 2l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
          <div className="ios-home" aria-hidden />
        </div>
      </div>
    </div>
  );
}
