"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { addPhotos, deletePhoto, grabLinkPreview, movePhoto, prepareUploads, type SaveResult } from "./actions";

const NAV = [
  { href: "/admin", label: "overview" },
  { href: "/admin/experience", label: "experience" },
  { href: "/admin/projects", label: "projects" },
  { href: "/admin/writing", label: "writing" },
  { href: "/admin/photos", label: "photos" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="admin-nav">
      {NAV.map((n) => {
        const on = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} aria-current={on ? "page" : undefined}>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

// A submit button that asks first. Put it inside a form whose action does the deleting.
export function ConfirmButton({ children, message }: { children: React.ReactNode; message: string }) {
  return (
    <button
      type="submit"
      className="admin-button danger"
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

// ── the edit form: one save bar, unsaved-change tracking, ⌘S ──

type Values = Map<string, string>;

function read(form: HTMLFormElement): Values {
  const out: Values = new Map();
  for (const [k, v] of new FormData(form).entries()) if (typeof v === "string") out.set(k, out.has(k) ? `${out.get(k)}\n${v}` : v);
  return out;
}

// Changed if any field differs from what was saved. A field that's missing on one side counts as empty, so an
// unticked checkbox reads as a change, but a new empty field (a photo just uploaded, its alt text blank) doesn't.
function differs(a: Values, b: Values) {
  for (const k of new Set([...a.keys(), ...b.keys()])) if ((a.get(k) ?? "") !== (b.get(k) ?? "")) return true;
  return false;
}

// Tell the enclosing AdminForm that something changed without a keystroke (a list reordered, an image uploaded).
export function touch(el: Element | null) {
  el?.closest("form")?.dispatchEvent(new Event("input", { bubbles: true }));
}

export function AdminForm({
  action,
  children,
  className = "admin-form wide",
}: {
  action: (prev: SaveResult | undefined, form: FormData) => Promise<SaveResult>;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const saved = useRef<Values>(new Map());
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [dirty, setDirty] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [pending, start] = useTransition();
  // Just created (the page it redirects to carries ?saved=1): say so once, then tidy the address.
  const [created] = useState(() => params.get("saved") === "1");

  useEffect(() => {
    if (ref.current) saved.current = read(ref.current);
    if (created) router.replace(pathname, { scroll: false });
  }, [created, pathname, router]);

  const check = useCallback(() => {
    if (ref.current) setDirty(differs(read(ref.current), saved.current));
  }, []);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const snapshot = read(form);
    start(async () => {
      const r = await action(undefined, data);
      setResult(r);
      if (!r.ok) return;
      if (r.redirect) {
        saved.current = read(form);
        setDirty(false);
        router.push(r.redirect);
        return;
      }
      saved.current = snapshot;
      setDirty(differs(read(form), snapshot));
      router.refresh();
    });
  };

  // ⌘S / ctrl+S saves; leaving with unsaved changes asks first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        ref.current?.requestSubmit();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest("a[href]");
      if (!dirty || !a || a.getAttribute("target") === "_blank") return;
      if (!confirm("you have unsaved changes. leave without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    addEventListener("keydown", onKey);
    addEventListener("beforeunload", onLeave);
    document.addEventListener("click", onClick, true);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("beforeunload", onLeave);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  const status = pending
    ? { text: "saving…", tone: "" }
    : result && !result.ok
      ? { text: result.error, tone: "error" }
      : dirty
        ? { text: "unsaved changes", tone: "dirty" }
        : result?.ok || created
          ? { text: "all changes saved", tone: "ok" }
          : { text: "no changes", tone: "" };

  return (
    <form ref={ref} className={className} onSubmit={submit} onInput={check} onChange={check} noValidate>
      {children}
      <div className="admin-savebar" data-tone={status.tone || undefined}>
        <p role="status" aria-live="polite">
          {status.text}
        </p>
        <span className="admin-savebar-keys">⌘S</span>
        <button type="submit" className="admin-button primary" disabled={pending || !dirty}>
          {pending ? "saving…" : "save"}
        </button>
      </div>
    </form>
  );
}

// A label with an optional hint on the same line.
export function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="admin-label">
      {children}
      {hint ? <span className="admin-hint">{hint}</span> : null}
    </span>
  );
}

// ── highlights: rows of title + detail, saved with the form as JSON ──

type Highlight = { title: string; body: string };

export function HighlightsEditor({ initial }: { initial: Highlight[] }) {
  const ref = useRef<HTMLFieldSetElement>(null);
  // Stable keys, so removing a row doesn't hand its neighbour's text to the wrong inputs.
  const [rows, setRows] = useState(() => initial.map((h, i) => ({ ...h, key: i })));
  const nextKey = useRef(initial.length);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    touch(ref.current);
  }, [rows]);

  const set = (key: number, patch: Partial<Highlight>) => setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const swap = (i: number, j: number) =>
    setRows((r) => {
      if (j < 0 || j >= r.length) return r;
      const next = [...r];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <fieldset ref={ref} className="admin-highlights">
      <legend>highlights</legend>
      <input type="hidden" name="highlights" value={JSON.stringify(rows.filter((r) => r.title.trim()).map(({ title, body }) => ({ title, body })))} />
      {rows.length === 0 ? <p className="admin-note">none yet.</p> : null}
      {rows.map((row, i) => (
        <div key={row.key} className="admin-highlight">
          <label>
            <Label>title</Label>
            <input value={row.title} onChange={(e) => set(row.key, { title: e.target.value })} />
          </label>
          <label>
            <Label>detail</Label>
            <textarea value={row.body} rows={3} onChange={(e) => set(row.key, { body: e.target.value })} />
          </label>
          <div className="admin-row-tools">
            <button type="button" className="admin-link" onClick={() => swap(i, i - 1)} disabled={i === 0} aria-label="move up">
              ↑
            </button>
            <button type="button" className="admin-link" onClick={() => swap(i, i + 1)} disabled={i === rows.length - 1} aria-label="move down">
              ↓
            </button>
            <button type="button" className="admin-link" onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}>
              remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="admin-button" onClick={() => setRows((r) => [...r, { title: "", body: "", key: nextKey.current++ }])}>
        + add highlight
      </button>
    </fieldset>
  );
}

// ── uploads straight to storage ──

async function uploadFiles(folder: string, files: File[]) {
  const targets = await prepareUploads(
    folder,
    files.map((f) => ({ name: f.name, type: f.type })),
  );
  await Promise.all(
    targets.map(async (t, i) => {
      const res = await fetch(t.url, { method: "PUT", body: files[i], headers: { "content-type": files[i].type, "x-upsert": "false" } });
      if (!res.ok) throw new Error(`${files[i].name}: upload failed (${res.status})`);
    }),
  );
  return targets.map((t) => t.path);
}

// ── a trip's photos: upload several at once, reorder, delete; alt text saves with the trip's form ──

type Photo = { id: string; src: string; alt: string };

export function PhotoManager({ tripId, folder, photos }: { tripId: string; folder: string; photos: Photo[] }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [status, setStatus] = useState<{ text: string; error?: boolean } | null>(null);

  const run = (label: string, fn: () => Promise<unknown>) =>
    start(async () => {
      try {
        setStatus({ text: label });
        await fn();
        setStatus(null);
        router.refresh();
      } catch (e) {
        setStatus({ text: e instanceof Error ? e.message : "something went wrong", error: true });
      }
    });

  const upload = (list: File[]) => {
    if (!list.length) return;
    run(`uploading ${list.length}…`, async () => addPhotos(tripId, await uploadFiles(folder, list)));
  };

  return (
    <section className="admin-photos" aria-busy={busy}>
      <label className="admin-drop">
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="admin-file" disabled={busy} onChange={(e) => {
          const list = [...(e.target.files ?? [])];
          e.target.value = "";
          upload(list);
        }} />
        <span>{busy ? "working…" : "choose photos to upload"}</span>
        <span className="admin-hint">uploads right away · alt text saves with the trip</span>
      </label>
      {status ? <p className={status.error ? "admin-inline-error" : "admin-note"}>{status.text}</p> : null}
      <ul className="admin-photo-grid">
        {photos.map((p, i) => (
          <li key={p.id}>
            {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails, straight from storage */}
            <img src={p.src} alt={p.alt} loading="lazy" />
            <input name={`alt:${p.id}`} defaultValue={p.alt} placeholder="describe the photo" aria-label="alt text" />
            <div className="admin-row-tools">
              <button type="button" className="admin-link" disabled={busy || i === 0} onClick={() => run("moving…", () => movePhoto(p.id, tripId, -1))} aria-label="move earlier">
                ←
              </button>
              <button type="button" className="admin-link" disabled={busy || i === photos.length - 1} onClick={() => run("moving…", () => movePhoto(p.id, tripId, 1))} aria-label="move later">
                →
              </button>
              <button type="button" className="admin-link danger" disabled={busy} onClick={() => confirm("delete this photo?") && run("deleting…", () => deletePhoto(p.id))}>
                delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {photos.length === 0 ? <p className="admin-note">no photos yet.</p> : null}
    </section>
  );
}

// ── a project's picture: upload a screenshot, or take the link's own preview; either saves with the form ──

export function ProjectImage({ initial, base }: { initial: string | null; base: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(initial ?? "");
  const [busy, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const src = !path ? null : /^https?:/.test(path) ? path : base + path.split("/").map(encodeURIComponent).join("/");

  const set = (next: string) => {
    setPath(next);
    // The hidden input's value changes without a keystroke; let the form see it once React has rendered it.
    requestAnimationFrame(() => touch(ref.current));
  };
  const run = (fn: () => Promise<string>) =>
    start(async () => {
      try {
        setError(null);
        set(await fn());
      } catch (e) {
        setError(e instanceof Error ? e.message : "something went wrong");
      }
    });
  const link = () => (ref.current?.form?.elements.namedItem("url") as HTMLInputElement | null)?.value.trim() ?? "";

  return (
    <div className="admin-project-image" aria-busy={busy}>
      <input ref={ref} type="hidden" name="image" value={path} />
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview, straight from storage
        <img src={src} alt="" />
      ) : (
        <p className="admin-note">no picture yet. the card shows it in a browser window when hovered.</p>
      )}
      <div className="admin-row-tools">
        <label className="admin-link">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="admin-file"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) run(async () => (await uploadFiles("projects", [file]))[0]);
            }}
          />
          {busy ? "working…" : "upload a screenshot"}
        </label>
        <button type="button" className="admin-link" disabled={busy} onClick={() => run(() => grabLinkPreview(link()))}>
          use the link&apos;s preview
        </button>
        {path ? (
          <button type="button" className="admin-link danger" disabled={busy} onClick={() => set("")}>
            remove
          </button>
        ) : null}
      </div>
      {error ? <p className="admin-inline-error">{error}</p> : null}
    </div>
  );
}
